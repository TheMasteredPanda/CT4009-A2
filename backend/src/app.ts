import express from "express";
import fs from "fs";
import * as fileUtils from "./utils/files";
import * as actionManager from "./managers/actionsManager";
import * as configUtils from "./utils/config";

const app = express();
let scriptRoutes = fileUtils
  .map("endpoints")
  .filter((path: string) => path.endsWith(".ts"));
let promises = [];

for (let i = 0; i < scriptRoutes.length; i++) {
  const route = scriptRoutes[i];

  promises.push(
    import(route).then((module) => {
      app.use(module);
    })
  );
}

configUtils.exists();

if (configUtils.exists()) {
}

new Promise((resolve) => {
  if (!configUtils.exists()) {
    configUtils.create();
    console.log(`Created config.json. Please populate it.`);
    process.exit(0);
    return;
  }

  return actionManager.load();
}).then((names: string[]) => {
  console.log(`Successfully Loaded Action Modules: ${names.join(", ")}`);
  return Promise.all(promises);
});
