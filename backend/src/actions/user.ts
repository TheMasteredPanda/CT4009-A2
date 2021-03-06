import bcrypt from "bcrypt";
import * as authManager from "../managers/authManager";
import Users from "../schemas/User.schema";
import Contacts from "../schemas/Contacts.schema";
import {
  ClientUnauthorizedError,
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";

/**
 * This script contains all functions that will be used in the endpoints/users.ts script.
 */

/**
 * A user contact entry .
 */
export interface UserContact {
  id: number;
  contact_value: string;
  contact_type: string;
  contact_hierarchy_position: string;
}

/**
 * A user entry.
 */
export interface User {
  id: number;
  username: string;
  password: Promise<string>; //Wouldn't be proper to store the password in memory, for security reasons.
  contacts: UserContact[];
}

/**
 * Changes the users password.
 *
 * @param {number} userId - The id of a user.
 * @param {string} newPassword - The new password.
 */
export async function change(userId: number, newPassword: string) {
  let hashedPassword = await bcrypt.hash(newPassword, 10);
  await Users.update({ password: hashedPassword }, { where: { id: userId } });
}

/**
 * Used to check if a user exists.
 *
 * @param {number} userId - The id of a user.
 *
 * @return {boolean} true if exists, otherwise false.
 */
export async function exists(userId: number): Promise<boolean> {
  let result = await Users.findOne({ where: { id: userId } });
  return result ? true : false;
}

/**
 * Gets user information. This includes contacts.
 *
 * @param {number} userId - The id of a user.
 *
 * @returns {Promise<object>} a user object or null.
 */
export async function get(userId: string): Promise<User | null> {
  let userInfo = await Users.findOne({ where: { id: userId } });
  let userContacts = await Contacts.findAll({ where: { id: userId } });
  if (userInfo === null || userContacts === null) {
    return null;
  } else {
    let user: any = userInfo.toJSON();
    let contacts = JSON.parse(JSON.stringify(userContacts));
    user.contacts = contacts;
    return user;
  }
}

/**
 * Registry params interface.
 */
interface RegisterParams {
  username: string;
  password: string;
  email: string;
}

/**
 * Registers a new civilian user.
 * NOTE: The password is hashed and salted via bcrypt.
 *
 * @param {RegisterParams} params - The parameters needed to register an account successfully.
 *
 * @returns {string} an authentication payload
 */
export async function register(params: RegisterParams) {
  let usernameExists = await Users.findOne({
    where: { username: params.username },
  });

  if (usernameExists) {
    throw new ClientNotAcceptableError(
      "Client",
      "Username already taken",
      `The username ${params.username} has already been taken`,
      { username: params.username }
    );
  }

  let hash = await bcrypt.hash(params.password, 10);
  let model = await Users.create({ username: params.username, password: hash });
  let user: any = model.toJSON();
  await Contacts.create({
    user_id: user.id,
    contact_value: params.email,
    contact_type: "email",
    contact_hierarchy_position: 1,
  });

  let handler = authManager.create(user.id);
  let jwtEntry = await handler.generateJWT({
    username: user.username,
    id: user.id,
  });

  let refreshToken = handler.getRefreshToken();
  return {
    token: jwtEntry.token,
    id: user.id,
    refreshToken: {
      token: refreshToken.token,
      nbf: refreshToken.nbf,
      exp: refreshToken.exp,
    },
  };
}

/**
 * Logs a user in using their username and password.
 *
 * @param {string} username - The name of the account.
 * @param {string} password - The password of that account.
 *
 * @returns {string} an authentication payload if successful, otherwise a 401 error.
 */
export async function login(username: string, password: string): Promise<any> {
  let model = await Users.findOne({ where: { username } });
  if (!model)
    throw new ClientNotFoundError(
      "Client",
      "User not found",
      `Couldn't find user ${username}`
    );

  let user: any = model.toJSON();
  let valid;

  try {
    valid = await bcrypt.compare(password, user.password);
  } catch (err) {
    throw err;
  }

  if (!valid) {
    throw new ClientUnauthorizedError(
      "Client",
      "Unable to authorise user",
      `Passwords are not identical.`
    );
  }

  let handler = authManager.create(user.id);
  let jwt = await handler.generateJWT({ username: user.username, id: user.id });
  let refreshToken = handler.getRefreshToken();
  return {
    token: jwt.token,
    id: user.id,
    refreshToken: {
      token: refreshToken.token,
      exp: refreshToken.exp,
      nbf: refreshToken.nbf,
    },
  };
}

/**
 * Used to verify that a user has a valid authentication token.
 *
 * @param {string} token - The JWT token.
 * @param {string} userId - The id of a user.
 *
 * @return {boolean} if valid returns true, otherwise false.
 */
export async function verify(token: string, userId: number) {
  if (!authManager.hasHandler(userId)) return false;
  let handler = authManager.get(userId);
  return await handler.verify(token);
}

/**
 * Logs a user out.
 *
 * @param {number} userId - The id of a user.
 */
export function logout(userId: number) {
  if (!authManager.hasHandler(userId)) return;
  authManager.remove(userId);
}

/**
 * Used to get the rank of a user.
 *
 * @param {number} userId - The id of the user.
 *
 * @returns {string} rank id of the user.
 */
export async function getRank(userId: number) {
  let user: any = await Users.findOne({ where: { id: userId } });

  if (!user) {
    throw new ClientNotFoundError(
      "Client",
      `Couldn't find user.`,
      `Couldn't find user ${userId}, who are you?`
    );
  }

  return user.rank;
}

/**
 * Used to demote or promote a user.
 *
 * @param {number} userId - The id of a user.
 * @param {string} rank - A valid rank id.
 */
export async function setRank(userId: number, rank: string) {
  if (
    rank !== "civilian" &&
    rank !== "police_officer" &&
    rank !== "police_admin"
  ) {
    throw new ClientNotAcceptableError(
      "Client",
      "Rank id not acceptable",
      `The rank id must be either 'civilian', 'police_officer', or 'police_admin'`
    );
  }

  await Users.update({ rank }, { where: { id: userId }, fields: ["rank"] });
}

/**
 * Used to remove a user from the database.
 *
 * @param {number} userId - The id of a user.
 */
export async function remove(userId: number) {
  await Users.destroy({ where: { id: userId } });
  if (!authManager.hasHandler(userId)) return;
  authManager.remove(userId);
}

/**
 * Used to get the user's username only.
 *
 * @param accountId - The id of a user.
 *
 * @returns {string} the users username or an error.
 */
export async function getUsername(accountId: number) {
  let userModel = await Users.findOne({
    where: { id: accountId },
    attributes: ["username"],
  });

  if (!userModel) {
    throw new ClientNotFoundError(
      "Client",
      `Couldn't find user`,
      `Couldn't find user ${accountId}`
    );
  }

  return (userModel.toJSON() as any).username;
}
