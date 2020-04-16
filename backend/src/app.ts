import express from "express";
import * as fileUtils from "./utils/files";
import * as actionManager from "./managers/actionsManager";
import * as databaseManager from "./managers/databaseManager";
import * as configUtils from "./utils/config";
import { errorResponser, errorHandler } from "./utils/errorhandler";
/**
 * Main file. Aka the 'index' script. Starts the server in the following process:
 * - Creates express app.
 * - Loads up endpoints.
 * - Create config file (if necessary).
 * - Loads up database manager.
 * - Loads up action manager.
 * - Starts http server.
 */

const app = express();
app.use(errorResponser);
let scriptRoutes = fileUtils
  .map(__dirname + "/endpoints")
  .filter((path: string) => path.endsWith(".ts"));
let promises: Promise<any>[] = [];

for (let i = 0; i < scriptRoutes.length; i++) {
  const route = scriptRoutes[i];

  promises.push(
    import(route).then((module) => {
      app.use(module);
    })
  );
}

if (!configUtils.exists()) {
  configUtils.create();
  console.log(`Created config.json. Please populate it.`);
  process.exit(0);
}

databaseManager
  .load()
  .then(() => databaseManager.createAssociations())
  .then(() => databaseManager.sequelize().sync())
  .then(() => actionManager.load() as Promise<string[]>)
  .then((names: string[]) => {
    console.log(
      `Successfully Loaded Action Modules: ${
        names.length > 0 ? names.join(", ") : "None"
      }`
    );
    return Promise.all(promises);
  })
  .then(() => {
    app.use(errorHandler);
    app.listen(configUtils.get().server.port, () => {
      console.log(`Server online.`);
    });
  })
  .catch(console.error);
