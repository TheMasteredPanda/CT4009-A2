import * as databaseManager from "../../src/managers/databaseManager";
import { start, shutdown } from "../../src/app";
import { ModelCtor, Model } from "sequelize/types";
import * as authManager from "../../src/managers/authManager";
import supertest from "supertest";
import bcrypt from "bcrypt";

const request = supertest("http://localhost:4000");

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
  let hashedPassword = await bcrypt.hash(
    process.env.OWNER_ACCOUNT_PASSWORD,
    10
  );
  await databaseManager.sequelize().models.users.create({
    username: process.env.OWNER_ACCOUNT_USERNAME,
    password: hashedPassword,
    rank: "police_admin",
  });
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
  await authManager.flushAll();;
  await shutdown();
  done();
});

function login() {
  return new Promise((resolve, reject) => {
    request
      .post("/user/login")
      .send({
        username: "owner",
        password: "passwd",
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        }

        expect(res.status).toBe(200);
        resolve(res.body);
      });
  });
}

describe("Testing Admin Endpoints", () => {
  it("/admin/accounts/create", (done) => {
    login().then((authPayload: any) => {
      request
        .post(`/admin/accounts/create?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({
          username: "joans",
          password: "passwd",
          email: "joans@gmail.com",
        })
        .end((err, res) => {
          if (err) {
            throw err;
          }
          expect(res.status).toBe(200);
          done();
        });
    });
  });

  it("/admin/accounts", (done) => {
    login().then((authPayload: any) => {
      request
        .post(`/admin/accounts?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .end((err, res) => {
          if (err) {
            throw err;
          }

          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();
          done();
        });
    });
  });

  it("/admin/accounts/account", (done) => {
    login().then((authPayload: any) => {
      request
        .post(`/admin/accounts/create?userId=${authPayload.id}`)
        .send({
          username: "johndoe",
          password: "password1",
          email: "johndoe@gmail.com",
        })
        .set("Authorization", `Bearer ${authPayload.token}`)
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();
          let id = res.body.id;
          request
            .get(
              `/admin/accounts/account?userId=${authPayload.id}&accountId=${id}`
            )
            .set("Authorization", `Bearer ${authPayload.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);
              expect(res.body).toBeDefined();
              done(0);
            });
        });
    });
  });

  it("/admin/accounts/delete", (done) => {
    login().then((authPayload: any) => {
      request
        .post(`/admin/accounts/create?userId=${authPayload.id}`)
        .send({
          username: "johndoe",
          password: "password1",
          email: "johndoe@gmail.com",
        })
        .set("Authorization", `Bearer ${authPayload.token}`)
        .end((err, res) => {
          if (err) {
            throw err;
          }

          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();
          let id = res.body.id;
          request
            .post(
              `/admin/accounts/delete?userId=${authPayload.id}&accountId=${id}`
            )
            .set("Authorization", `Bearer ${authPayload.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);
              done();
            });
        });
    });
  });
});
