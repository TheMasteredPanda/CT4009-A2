import _ from "lodash";
import Users from "../schemas/User.schema";
import Contacts from "../schemas/Contacts.schema";
import Bikes from "../schemas/Bikes.schema";
import RegistryImages from "../schemas/RegistryImages.schema";
import BikeImages from "../schemas/BikeImages.schema";
import bcrypt from "bcrypt";
import {
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";
import { Model } from "sequelize";
/**
 * All functions for executing the features of the admin panel.
 */

/**
 * Creates a new officer account. When you register account via the user system,
 * the rank you're assigned is 'civilian', this procedure however gives the account
 * a 'police_officer' rank.
 *
 * @param {string} username - The name for the account.
 * @param {string} password - The password for the account.
 * @param {string} email  - The email address for the account.
 *
 * @return {string} the id of the newly created account.
 */
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
    user_id: user.id,
    contact_value: email,
    contact_type: "email",
    contact_hierarchy_position: 1,
  });
  return user.id;
}

/**
 * Fetches all account information. If there are no ids in the invocation
 * of this method then it will fetch all account information from the database,
 * save for the password.
 *
 * @param ids - A list of ids.
 *
 * @returns {object[]} an array of user objects.
 */
export async function getAllAccounts(ids: number[] = []) {
  let users: Model<any, any>[];
  let contacts: Model<any, any>[];

  if (ids.length > 0) {
    users = await Users.findAll({
      where: { id: ids },
      attributes: ["id", "username"],
    });

    contacts = await Contacts.findAll({
      where: { user_id: ids },
      attributes: ["user_id", "contact_value"],
    });
  } else {
    users = await Users.findAll({
      attributes: ["id", "username"],
    });

    contacts = await Contacts.findAll({
      attributes: ["user_id", "contact_value"],
    });
  }

  return _.map(users, (user) => {
    let userObject: any = user.toJSON();
    let userContacts = _.filter(contacts, (contact) => {
      return (contact.toJSON() as any).user_id == userObject.id;
    }).map((model: any) => model.toJSON());

    userObject.contacts = userContacts;
    return userObject;
  });
}

/**
 * Gets all information on one account.
 *
 * @param userId - The id of an account.
 *
 * @return {object} returns an object of a user.
 */
export async function getAccountDetails(userId: number) {
  let user = await Users.findOne({ where: { id: userId } });
  let contacts = await Contacts.findAll({
    where: { user_id: userId },
    attributes: ["contact_value"],
  });
  let bikes = await Bikes.findAll({ where: { user_id: userId } });

  if (!user) {
    throw new ClientNotFoundError(
      "Client",
      "User not found",
      `Couldn't find user ${userId}.`,
      { parameters: ["userId"] }
    );
  }

  let object: any = user.toJSON();
  object.contacts = _.map(contacts, (contact) => contact.toJSON());
  object.bike_count = bikes.length;
  object.reports_count = 0;
  object.investigations_count = 0;
  return object;
}

/**
 * Gets all information on registered bikes, including their images.
 *
 * @returns {object[]} returns an array of bikes.
 */
export async function getAllRegisteredBikes() {
  let bikeIds = await Bikes.findAll({ attributes: ["id"] });
  return _.map(bikeIds, (bike: any) => bike.toJSON().id);
}

/**
 * Deletes an account.
 *
 * @param userId - An id of an account.
 */
export async function deleteAccount(userId: number) {
  let bikes = await Bikes.findAll({ where: { user_id: userId } });
  let bikeIds = bikes.map((bike) => (bike.toJSON() as any).id);
  let registryImageEntries = await RegistryImages.findAll({
    where: { bike_id: bikeIds },
  });
  let imageIds = registryImageEntries.map(
    (entry) => (entry.toJSON() as any).image_id
  );
  await RegistryImages.destroy({ where: { image_id: imageIds } });
  await BikeImages.destroy({ where: { id: imageIds } });
  await Bikes.destroy({ where: { user_id: userId } });
  await Contacts.destroy({ where: { user_id: userId } });
  await Users.destroy({ where: { id: userId } });
}
