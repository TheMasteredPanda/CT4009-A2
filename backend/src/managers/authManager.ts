import * as timeUtils from "../utils/timeUtil";
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

let handlers: { [key: number]: AuthHandler } = {};

/**
 * Create a new auth handler for a user if one doesn't exist. If one
 * does exist the function will throw an error.
 *
 * @param userId - The id of the user.
 *
 * @returns {AuthHandler} an auth handler an error.
 */
export function create(userId: number): AuthHandler {
  if (Object.keys(handlers).includes(String(userId))) {
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
export function hasHandler(userId: number) {
  return Object.keys(handlers).includes(String(userId));
}

/**
 * Remove the auth handler for a user if one exists. If one
 * doesn't exist an error will be thrown.
 *
 * @param userId - The id of the user.
 */
export function remove(userId: number) {
  if (!Object.keys(handlers).includes(String(userId))) {
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
export function get(userId: number) {
  if (!Object.keys(handlers).includes(String(userId))) {
    throw new ServerGenericError(
      "Auth",
      "Cannot return what the user does not have",
      `Cannot get the auth handler for ${userId} because the user does not have one.`
    );
  }

  return handlers[userId];
}

/**
 * Deletes all auth handlers.
 */
export function flushAll() {
  handlers = {};
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
}

export interface JWTPayload extends JWT {
  refreshToken: RefreshToken;
}

/**
 * This class handles the creation of the JWT, Secret, and Refresh Tokens. This class
 * also deals with the rotation of the secret key, and the verification of the JWT.
 */
export class AuthHandler {
  private id: number;
  /**
   * The secret tokens expiration time
   */
  private secretExp: number;

  /**
   * The refresh tokens expiration time.
   */
  private refreshExp: number;

  /**
   * The amount of time the refresh nbf value will overlap with the secret tokens expiration time.
   */
  private refreshOffset: number;

  /**
   * The current valid secret entry used to sign the jwtEntry.
   */
  private secretEntry: SecretEntry;

  /**
   * The current refresh token entry.
   */
  private refreshToken: RefreshToken;

  /**
   * The current jwt the user is using. While JWT is, by nature, stateless I store it here to prevent the
   * sercret key from being stolen and used to forge a valid token.
   */
  private jwtEntry: JWT | null;

  constructor(userId: number) {
    this.id = userId;
    let config = configUtils.get();
    this.secretExp = timeUtils.fromString(config.auth.secretExp);
    this.refreshExp = timeUtils.fromString(config.auth.refreshExp);
    this.refreshOffset = timeUtils.fromString(config.auth.refreshOffset);
    this.secretEntry = this.generateSecret();
    this.refreshToken = this.generateRefreshToken();
    this.jwtEntry = null;
  }

  /**
   * The refresh token, used to generate a new JWT at the expiry of the old one.
   *
   * @returns {RefreshToken} a refresh token or null.
   */
  getRefreshToken() {
    return this.refreshToken;
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
      nbf: now - 1, //Not before time in miliseconds
      iat: now, //Issued at time in miliseconds.
    };
  }

  /**
   * Create a new JWT.
   * @param payload - The data encoded in the JWT.
   *
   * @returns {JWT} A JWT entry.
   */
  async generateJWT(payload: any): Promise<JWT> {
    let now = Date.now();
    let token = await jwt.sign(
      { payload, refreshToken: this.refreshToken },
      this.secretEntry.token,
      {
        expiresIn: now + this.secretEntry.exp,
      }
    );

    let entry = {
      token, //JWT
      exp: this.secretEntry.exp, //Expiration time in miliseconds.
      nbf: this.secretEntry.nbf, //The Not Before time in miliseconds
      iat: now, //The Issued at time in miliseconds.
    };

    this.jwtEntry = entry;
    return entry;
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
      exp: this.secretEntry.exp + this.refreshExp, //The expiration time in miliesconds
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
   * @param token - The JWT token.
   *
   * @returns {boolean} true if valid, otherwise false.
   */
  async verify(token: string): Promise<boolean> {
    if (!this.jwtEntry) {
      throw new ServerGenericError(
        "Auth",
        "JWT Not Found",
        `There is no JWT entry to reference in memory.`
      );
    }

    if (token !== this.jwtEntry.token) {
      throw new ServerGenericError(
        "Auth",
        "Json Web Token Mismatch",
        `The JWT token given is not identical to the authentication token stored.`
      );
    }

    let decoded;
    try {
      if (this.secretEntry.nbf > Date.now()) {
        console.log("Secret Entry NBF is bigger than the current date.");
      }

      decoded = await jwt.verify(token, this.secretEntry.token);
    } catch (err) {
      throw err;
    }

    return decoded ? true : false;
  }

  /**
   * Refresh a JWT by generating a new one with the refresh token entry added to the
   * payload. After the injected JWT is verified, new secret and refresh tokens are
   * generated. Then a new JWT is generated.
   *
   * @param entry - A JWT token.
   *
   * @returns {string} a JWT token or an error.
   */
  async refresh(token: string) {
    let decoded;
    try {
      decoded = await jwt.verify(token, this.secretEntry.token);
    } catch (err) {
      throw err;
    }

    let payload = decoded as JWTPayload;

    if (!payload) {
      throw new ServerGenericError(
        "Auth",
        "Payload Error",
        `Payload is ${payload}`
      );
    }

    if (payload.refreshToken.token !== this.refreshToken.token) {
      throw new ClientNotAcceptableError(
        "Auth",
        "Payload Error",
        `Refresh token found in JWT payload is not identical to the payload stored on the server.`
      );
    }

    let jwtEntry = this.jwtEntry;

    if (!jwtEntry) {
      throw new ServerGenericError(
        "Auth",
        "Auth error",
        `JWT Entry is ${jwtEntry}`
      );
    }

    this.secretEntry = this.generateSecret();
    this.refreshToken = this.generateRefreshToken();
    let entry;

    try {
      entry = await this.generateJWT(JSON.stringify(payload));
    } catch (err) {
      throw err;
    }

    this.jwtEntry = entry;
    return entry.token;
  }
}
