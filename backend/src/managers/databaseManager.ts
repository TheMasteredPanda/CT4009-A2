import * as fs from "fs";
import { Sequelize } from "sequelize";
import * as configUtils from "../utils/config";

/**
 * A manager to manager the loading, table to table relations, and unloading of the Sequelize client.
 */
let client: Sequelize | null = null;

/**
 * Connects to the server.
 *
 * This will throw a connection error if the server cannot be connected to.
 * It will also throw an error if the configuration file does not exist.
 *
 */
export async function load() {
  if (!configUtils.exists() && process.env.NODE_ENV !== "development") {
    throw new Error(`DatabaseManager: Configuration file does not exist.`);
  }

  let configFile: configUtils.ConfigFile = configUtils.get();
  client = new Sequelize(configFile.mariadb as any);

  try {
    await client.authenticate();
    console.log(
      `DatabaseManager: Connected to server ${configFile.mariadb.host}:${
        configFile.mariadb.port
      }${
        configFile.mariadb.database !== ""
          ? `@${configFile.mariadb.database}`
          : ""
      }`
    );
  } catch (err) {
    throw err;
  }
}

/**
 * Creates the associatoins between Sequelize models. This is
 * translated into the references on the server.
 * (One to One, One to Many, and Many to Many references.)
 */
export async function createAssociations() {
  let promises = [];

  let models = fs.readdirSync("schemas");

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    promises.push(import(`../schemas/${model}`));
  }

  await Promise.all(promises);
  if (!client) {
    throw new Error(`DatabaseManager: Cannot use client.`);
  }
  let Users = client.models.users;
  let Contacts = client.models.users_contacts;
  let Bikes = client.models.bikes;
  let Reports = client.models.reports;
  let ReportsComments = client.models.reports_comments;
  let BikeImages = client.models.bike_images;
  let InvestigationImages = client.models.investigation_images;
  let RegistryImages = client.models.registry_images;

  Contacts.belongsTo(Users, {
    foreignKey: { name: "user_id", allowNull: false },
    onDelete: "cascade",
  });
  Reports.belongsTo(Users, {
    foreignKey: { name: "author", allowNull: false },
    onDelete: "cascade",
  });
  Reports.hasMany(ReportsComments, {
    foreignKey: { name: "report_id", allowNull: false },
    onDelete: "cascade",
  });
  Bikes.belongsTo(Users, {
    foreignKey: { name: "user_id", allowNull: false },
    onDelete: "cascade",
  });
  Reports.belongsTo(Bikes, {
    foreignKey: { name: "bike_id", allowNull: false },
    onDelete: "cascade",
  });
  BikeImages.belongsToMany(Bikes, {
    through: RegistryImages,
    onDelete: "cascade",
    foreignKey: { name: "image_id", allowNull: false },
    otherKey: { name: "bike_id", allowNull: false },
  });
}

/**
 * Returns the sequelize instance.
 */
export function sequelize(): Sequelize {
  if (client == null) {
    throw new Error(
      `DatabaseManager: Sequelize instance is not yet initialized.`
    );
  }

  return client;
}

/**
 * Closes the sequelize connection pool and lets the sequelize instance be GC'ed.
 */
export async function unload() {
  if (client == null) {
    throw new Error(`DatabaseManager: Sequelize instance does not exist.`);
  }

  let configFile: configUtils.ConfigFile = configUtils.get();

  try {
    await client.close();
    console.log(
      `DatabaseManager: Closed client previously connecting to ${
        configFile.mariadb.host
      }:${configFile.mariadb.port}${
        configFile.mariadb.database !== ""
          ? `@${configFile.mariadb.database}`
          : ""
      }`
    );

    client = null;
  } catch (err) {
    throw err;
  }
}
