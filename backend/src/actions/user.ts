import bcrypt, { hash } from "bcrypt";
import * as databaseManager from "../managers/databaseManager";
import * as authManager from "../managers/authManager";
import Users from "../schemas/User.schema";
import Contacts from "../schemas/Contacts.schema";
import * as config from "../utils/config";
import {
  ServerGenericError,
  ClientUnauthorizedError,
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";

/**
 * This script contains all functions that will be used in the endpoints/users.ts script.
 */

export interface UserContact {
  id: number;
  contact_value: string;
  contact_type: string;
  contact_hierarchy_position: string;
}

export interface User {
  id: number;
  username: string;
  password: Promise<string>; //Wouldn't be proper to store the password in memory, for security reasons.
  contacts: UserContact[];
}

export async function exists(userId: string): Promise<boolean> {
  let result = await Users.findOne({ where: { id: userId } });
  return result ? true : false;
}

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

export async function register(params: any) {
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
    userId: user.id,
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

export async function verify(token: string, userId: number) {
  if (!authManager.hasHandler(userId)) return false;
  let handler = authManager.get(userId);
  return await handler.verify(token);
}

export function logout(userId: number) {
  if (!authManager.hasHandler(userId)) return;
  authManager.remove(userId);
}

export async function getRank(userId: string) {
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

export async function setRank(userId: string, rank: string) {
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

export async function remove(userId: number) {
  await Users.destroy({ where: { id: userId } });
  if (!authManager.hasHandler(userId)) return;
  authManager.remove(userId);
}
