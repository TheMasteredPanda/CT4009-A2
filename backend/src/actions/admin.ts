import _ from "lodash";
import * as databaseManager from "../managers/databaseManager";
import Users from "../schemas/User.schema";
import Contacts from "../schemas/Contacts.schema";
import Bikes from "../schemas/Bikes.schema";
import bcrypt from "bcrypt";
import { ClientNotAcceptableError } from "../utils/errorhandler";
import { Model } from "sequelize";

export async function createOfficerAccount(
  username: string,
  password: string,
  email: string
) {
  let usernameExists = await Users.findOne({ where: { username } });

  if (usernameExists) {
    throw new ClientNotAcceptableError(
      "Client",
      "Username already taken",
      `The username ${username} has already been taken.`,
      { parameters: ["username"] }
    );
  }

  let emailExists = await Contacts.findOne({ where: { contact_value: email } });

  if (emailExists) {
    throw new ClientNotAcceptableError(
      "Client",
      "Email address already in use",
      `The email address ${email} is being used by another account.`,
      { parameters: ["email"] }
    );
  }

  let hashedPassword = await bcrypt.hash(password, 10);
  let userModal = await Users.create({
    username,
    password: hashedPassword,
    rank: "police_officer",
  });
  let user: any = userModal.toJSON();
  await Contacts.create({
    userId: user.id,
    contact_value: email,
    contact_type: "email",
    contact_hierarchy_position: 1,
  });
  return user.id;
}

export async function getAllAccounts() {
  let users: Model<any, any>[] = await Users.findAll({
    attributes: ["id", "username"],
  });

  return _.map(users, (user) => user.toJSON());
}

export async function getAllRegisteredBikes() {
  let bikeIds = await Bikes.findAll({ attributes: ["id"] });
  return _.map(bikeIds, (bike: any) => bike.toJSON().id);
}
