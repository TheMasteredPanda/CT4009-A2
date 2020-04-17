import crypto from "crypto";
import jwt from "jsonwebtoken";
import * as configUtils from "../utils/config";
import { ServerGenericError } from "../utils/errorhandler";
import { ClientNotAcceptableError } from "../utils/errorhandler";

/**
 * A manager responsible for gneerating the secret,
 * rotating that secret, signing JWTs, and verifying
 * JWTs for each user (handler).
 */

let handlers: any = {};

/**
 * Create a new auth handler for a user if one doesn't exist. If one
 * does exist the function will throw an error.
 *
 * @param userId - The id of the user.
 *
 * @returns {AuthHandler} an auth handler an error.
 */
export function create(userId: string) {
  if (Object.keys(handlers).includes(userId)) {
    throw new ServerGenericError(
      "Auth",
      "Cannot make duplicate handlers",
      `A auth token handler for ${userId} already exists.`
    );
  }

  handlers[userId] = new AuthHandler(userId);
  return handlers[userId];
}

/**
 * Check if a handler for a user exists.
 *
 * @param userId - The id of the user.
 *
 * @returns {boolean} true if one exists, otherwise false.
 */
export function hasHandler(userId: string) {
  return Object.keys(handlers).includes(userId);
}

/**
 * Remove the auth handler for a user if one exists. If one
 * doesn't exist an error will be thrown.
 *
 * @param userId - The id of the user.
 */
export function remove(userId: string) {
  if (!Object.keys(handlers).includes(userId)) {
    throw new ServerGenericError(
      "Auth",
      "Cannot delete what the user does not have",
      `Cannot remove auth handlers for ${userId} because user does not have one.`
    );
  }

  delete handlers[userId];
}

/**
 * Get a user's auth handler, If one doesn't exist an error will be thrown.
 *
 * @param userId - The id of the user.
 *
 * @returns {AuthHandler} an auth handler or an error.
 */
export function get(userId: string) {
  if (!Object.keys(handlers).includes(userId)) {
    throw new ServerGenericError(
      "Auth",
      "Cannot return what the user does not have",
      `Cannot get the auth handler for ${userId} because the user does not have one.`
    );
  }

  return handlers[userId];
}

/**
 * A bunch of interfaces used by TypeScript. Illustrated purely for convenience.
 */
export interface SecretEntry {
  token: string;
  exp: number;
  nbf: number;
  iat: number;
}

export interface RefreshToken {
  token: string;
  exp: number;
  nbf: number;
  iat: number;
}

export interface JWT {
  token: string;
  exp: number;
  nbf: number;
  iat: number;
  sub: string;
  aud: string;
}

export interface JWTPayload extends JWT {
  refreshToken: RefreshToken;
}

/**
 * This class handles the creation of the JWT, Secret, and Refresh Tokens. This class
 * also deals with the rotation of the secret key, and the verification of the JWT.
 */
export class AuthHandler {
  id: string;
  /**
   * The secret tokens expiration time
   */
  secretExp: number;

  /**
   * The refresh tokens expiration time.
   */
  refreshExp: number;

  /**
   * The amount of time the refresh nbf value will overlap with the secret tokens expiration time.
   */
  refreshOffset: number;

  /**
   * The current valid secret entry used to sign the jwtEntry.
   */
  secretEntry: SecretEntry;

  /**
   * The current refresh token entry.
   */
  refreshToken: RefreshToken;

  /**
   * The current jwt the user is using. While JWT is, by nature, stateless I store it here to prevent the
   * sercret key from being stolen and used to forge a valid token.
   */
  jwtEntry: JWT | null;

  constructor(userId: string) {
    this.id = userId;
    let config = configUtils.get();
    this.secretExp = config.auth.secretExp;
    this.refreshExp = config.auth.refreshExp;
    this.refreshOffset = config.auth.refreshOffset;
    this.secretEntry = this.generateSecret();
    this.refreshToken = this.generateRefreshToken();
    this.jwtEntry = null;
  }

  /**
   * Generate a new secret entry.
   */
  generateSecret() {
    let secret = crypto.randomBytes(48).toString("base64");
    let now = Date.now();
    return {
      token: secret,
      exp: now + this.secretExp, //Expiration time in miliseconds.
      nbf: now, //Not before time in miliseconds
      iat: now, //Issued at time in miliseconds.
    };
  }

  /**
   * Create a new JWT.
   * @param payload - The data encoded in the JWT.
   * @param sub - The subject the JWT will be used for.
   * @param aud - The client the JWT will be used by.
   *
   * @returns {JWT} A JWT entry.
   */
  generateJWT(payload: string, sub: string, aud: string): Promise<JWT> {
    return new Promise((resolve, reject) => {
      let now = Date.now();
      jwt.sign(
        { payload, refreshToken: JSON.stringify(this.refreshToken) },
        this.secretEntry.token,
        {
          expiresIn: this.secretEntry.exp,
          audience: aud,
          subject: sub,
          notBefore: this.secretEntry.nbf,
        },
        (token: any) => {
          let jwtEntry = {
            token, //JWT
            exp: this.secretEntry.exp, //Expiration time in miliseconds.
            aud, //The client who will use this JWT.
            sub, //The subject the JWT will be used for.
            nbf: this.secretEntry.nbf, //The Not Before time in miliseconds
            iat: now, //The Issued at time in miliseconds.
          };
          resolve(jwtEntry);
        }
      );
    });
  }

  /**
   * Generate a new Refresh Token Entry.
   *
   * @returns {RefreshToken} a erefrsh token entry.
   */
  generateRefreshToken() {
    let token = crypto.randomBytes(48).toString("base64");
    let now = Date.now();

    return {
      token, //The refresh token.
      exp: now + this.refreshExp, //The expiration time in miliesconds
      nbf:
        this.secretEntry.exp -
        this
          .refreshOffset /*The Not Before time in miliseconds. 
      Note that because of the refresh offset the Nbf time will overlap the secret entrys exp time by n miliseconds.*/,
      iat: now, //Issued at time in miliseconds.
    };
  }

  /**
   * Verify the JWT against the stored secret entry.
   *
   * @param entry - The JWT entry.
   *
   * @returns {boolean} true if valid, otherwise false.
   */
  verify(entry: JWT) {
    return new Promise((resolve, reject) => {
      jwt.verify(entry.token, this.secretEntry.token, (err, decoded) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Refresh a JWT by generating a new one with the refresh token entry added to the
   * payload. After the injected JWT is verified, new secret and refresh tokens are
   * generated. Then a new JWT is generated.
   *
   * @param entry - The JWT entry.
   *
   * @returns {JWT} a JWT or an error.
   */
  refresh(entry: JWT) {
    return new Promise((resolve, reject) => {
      jwt.verify(entry.token, this.secretEntry.token, (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }

        let payload = decoded as JWTPayload;

        if (!payload) {
          reject(
            new ServerGenericError(
              "Auth",
              "Payload Error",
              `Payload is ${payload}`
            )
          );
          return;
        }

        if (payload.refreshToken.token !== this.refreshToken.token) {
          reject(
            new ClientNotAcceptableError(
              "Auth",
              "Payload Error",
              `Refresh token found in JWT payload is not identical to the payload stored on the server.`
            )
          );
          return;
        }

        let jwtEntry = this.jwtEntry;

        if (!jwtEntry) {
          reject(
            new ServerGenericError(
              "Auth",
              "Auth error",
              `JWT Entry is ${jwtEntry}`
            )
          );
          return;
        }

        this.secretEntry = this.generateSecret();
        this.refreshToken = this.generateRefreshToken();
        this.generateJWT(
          JSON.stringify(payload),
          jwtEntry.sub,
          jwtEntry.aud
        ).then((jwt) => {
          this.jwtEntry = jwt;
          resolve(this.jwtEntry);
        });
      });
    });
  }
}
