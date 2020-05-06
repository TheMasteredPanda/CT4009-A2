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
  await databaseManager.sync();
  done();
});

afterEach(async (done) => {
  await databaseManager.drop();
  await authManager.flushAll();
  await done();
});

afterAll(async (done) => {
  await databaseManager.drop();
  await authManager.flushAll();
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
