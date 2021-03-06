import * as path from "path";
import express from "express";
import * as fileUtils from "./utils/files";
import * as actionManager from "./managers/actionsManager";
import * as databaseManager from "./managers/databaseManager";
import * as configUtils from "./utils/config";
import { errorResponser, errorHandler } from "./utils/errorhandler";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "http";
import bcrypt from "bcrypt";
import { Model, ModelCtor } from "sequelize/types";

let server: Server | null = null;
const app = express();

/**
 * Main file. Aka the 'index' script. Starts the server in the following process:
 * - Creates express app.
 * - Loads up endpoints.
 * - Create config file (if necessary).
 * - Loads up database manager.
 * - Loads up action manager.
 * - Starts http server.
 */

export async function shutdown() {
  await actionManager.unload();
  await databaseManager.unload();
  await server?.close();
}

export async function start() {
  console.log(process.env.NODE_ENV);
  if (!configUtils.exists() && process.env.NODE_ENV !== "development") {
    configUtils.create();
    console.log(`Created config.json. Please populate it.`);
    process.exit(0);
  }

  if (process.env.NODE_ENV === "development") { //For development purposes the config is populated by environment variables set in each test unit.
    configUtils.set({
      mariadb: {
        username: process.env.TEST_MARIADB_USERNAME,
        password: process.env.TEST_MARIADB_PASSWORD,
        host: process.env.TEST_MARIADB_HOST,
        port: process.env.TEST_MARIADB_PORT,
        database: process.env.TEST_MARIADB_DATABASE,
        dialect: "mariadb",
        timezone: "Etc/GMT0",
        define: {
          charset: "utf8",
          collate: "utf8_unicode_ci",
        },
        logging: false,
        pool: {
          min: 5,
          max: 10,
        },
      },
      server: {
        port: process.env.TEST_SERVER_PORT,
      },
      auth: {
        secretExp: process.env.TEST_SERVER_AUTH_SECRETEXP,
        refreshExp: process.env.TEST_SERVER_AUTH_REFRESHEXP,
        refreshOffset: process.env.TEST_SERVER_AUTH_REFRESHOFFSET,
      },
      ownerAccount: {
        username: process.env.OWNER_ACCOUNT_USERNAME,
        password: process.env.OWNER_ACCOUNT_PASSWORD,
      },
    });
  }

  await databaseManager.load();
  await databaseManager.createAssociations();
  await databaseManager.sync();

  let Users: ModelCtor<Model<any, any>> = await new Promise(
    (resolve, reject) => {
      import("./schemas/User.schema")
        .then((schema) => resolve(schema.default as any))
        .catch(reject);
    }
  );

  let ownerAccount = await Users.findOne({
    where: { username: configUtils.get().ownerAccount.username },
  });

  /**
   * Creates the owners account. This is the only police_admin account on the entire system.
   */
  if (!ownerAccount) {
    let hashedPassword = await bcrypt.hash(
      configUtils.get().ownerAccount.password,
      10
    );
    await Users.create({
      username: configUtils.get().ownerAccount.username,
      password: hashedPassword,
      rank: "police_admin",
    });
  }

  app.use(errorResponser);
  app.use(cors()); //Middleware for Connect/Express
  app.use(bodyParser.json()); //Middleware for parsing request body content to json.

  await import("./utils/userMiddleware").then((module) =>
    app.use(module.default)
  );
  await import("./utils/authMiddleware").then((module) =>
    app.use(module.default)
  );
  let scriptRoutes = fileUtils
    .map("endpoints")
    .filter((path: string) => path.endsWith(".js"));

  for (let i = 0; i < scriptRoutes.length; i++) {
    const route = scriptRoutes[i];

    await import(`./${route}`).then((module) => {
      console.log(`Loaded Endpoint: ${route.split("endpoints/")[1]}`);
      app.use(module.default);
    });
  }

  let names: string[] = await actionManager.load();
  console.log(
    `Successfully Loaded Action Modules: ${
      names.length > 0 ? names.join(", ") : "None"
    }`
  );

  app.use("/images", express.static(path.join(__dirname, "images")));
  app.use(errorHandler);

  server = app.listen(configUtils.get().server.port, () => {
    console.log(`Server online. Port: ${configUtils.get().server.port}`);
  });
}

if (process.env.NODE_ENV !== "development") {
  start();
}
