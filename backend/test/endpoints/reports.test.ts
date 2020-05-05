import * as fs from "fs";
import { start, shutdown } from "../../src/app";
import * as databaseManager from "../../src/managers/databaseManager";
import supertest from "supertest";
import * as authManager from "../../src/managers/authManager";
import { ModelCtor, Model } from "sequelize/types";
let request = supertest("http://localhost:4000");

beforeAll(async (done) => {
  process.env.TEST_MARIADB_USERNAME = "root";
  process.env.TEST_MARIADB_PASSWORD = "passwd";
  process.env.TEST_MARIADB_HOST = "172.17.0.2";
  process.env.TEST_MARIADB_PORT = "3306";
  process.env.TEST_MARIADB_DATABASE = "test";
  process.env.TEST_SERVER_PORT = "4000";
  process.env.TEST_SERVER_AUTH_SECRETEXP = "60s";
  process.env.TEST_SERVER_AUTH_REFRESHEXP = "20s";
  process.env.TEST_SERVER_AUTH_REFRESHOFFSET = "20s";
  process.env.OWNER_ACCOUNT_USERNAME = "owner";
  process.env.OWNER_ACCOUNT_PASSWORD = "passwd";

  process.chdir(process.cwd() + `/build/src`);
  await start();
  done();
});

beforeEach(async (done) => {
  await databaseManager.sequelize().sync();
  done();
});

afterEach(async (done) => {
  let models: {
    [key: string]: ModelCtor<Model<any, any>>;
  } = databaseManager.sequelize().models;

  await models.users_contacts.drop();
  await models.registry_images.drop();
  await models.investigation_images.drop();
  await models.reports.drop();
  await models.reports_comments.drop();
  await models.bike_images.drop();
  await models.bikes.drop();
  await models.users.drop();
  await authManager.flushAll();
  await done();
});

afterAll(async (done) => {
  let models: {
    [key: string]: ModelCtor<Model<any, any>>;
  } = databaseManager.sequelize().models;
  await models.users_contacts.drop();
  await models.registry_images.drop();
  await models.investigation_images.drop();
  await models.reports.drop();
  await models.reports_comments.drop();
  await models.bike_images.drop();
  await models.bikes.drop();
  await models.users.drop();
  await authManager.flushAll();
  await shutdown();
  done();
});
