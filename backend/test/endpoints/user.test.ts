import * as authManager from "../../src/managers/authManager";
import * as databaseManager from "../../src/managers/databaseManager";
import { start, shutdown } from "../../src/app";
import supertest from "supertest";
import { ModelCtor, Model } from "sequelize/types";

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

describe("Testing Auth Endpoints: ", () => {
  it("/user/register with all expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) {
          fail(err);
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.token).toBeDefined();
        done();
      });
  }, 2000);

  it("/user/register with some parameters", async (done) => {
    request
      .post("/user/register")
      .send({ username: "johndoe", email: "johndoe@gmail.com" })
      .expect(400)
      .end((err, res) => {
        if (err) throw err;
        expect(res.status).toBe(400);
        request
          .post("/user/register")
          .send({ username: "johndoe", password: "password1" })
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(400);

            request
              .post("/user/register")
              .send({ username: "johndoe", email: "johndoe@gmail.com" })
              .expect(400)
              .end((err, res) => {
                if (err) throw err;
                expect(res.status).toBe(400);
                done();
              });
          });
      });
  });

  it("/user/logout with all expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, data) => {
        if (err) throw err;
        expect(data.body).toBeDefined();
        expect(data.body.id).toBeDefined();
        expect(data.body.token).toBeDefined();

        request
          .post(`/user/logout?userId=${data.body.id}`)
          .set("Authorization", `Bearer ${data.body.token}`)
          .end((err, data2) => {
            if (err) throw err;
            expect(data2.status).toBe(200);
            done();
          });
      });
  });

  it("/user/logout with without the query parmaeter `userId`", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) throw err;
        request
          .post("/user/logout")
          .set("Authorization", `Bearer ${res.body.token}`)
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(400);
            done();
          });
      });
  });

  it("/user/login with all expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "passwd1",
        email: "johndoe@gmail.com",
      })
      .end((err, data) => {
        if (err) throw err;
        request
          .post(`/user/logout?userId=${data.body.id}`)
          .set("authorization", `Bearer ${data.body.token}`)
          .end((err, data) => {
            if (err) throw err;
            request
              .post("/user/login")
              .send({ username: "johndoe", password: "passwd1" })
              .end((err, data) => {
                if (err) throw err;
                expect(data.body.id).toBeDefined();
                expect(data.body.token).toBeDefined();
                done();
              });
          });
      });
  });

  it("/user/login with some expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) throw err;
        request
          .post(`/user/logout?userId=${res.body.id}`)
          .set("Authorization", `Bearer ${res.body.token}`)
          .end((err, res) => {
            if (err) throw err;
            request
              .post(`/user/login`)
              .send({ uername: "johndoe" })
              .expect(400)
              .end((err, res) => {
                if (err) throw err;
                expect(res.status).toBe(400);
                done();
              });
          });
      });
  });

  it("/user/verify with all expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) throw err;
        request
          .post(`/user/verify?userId=${res.body.id}`)
          .send({ jwt: res.body.token })
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).toBe(true);
            done();
          });
      });
  });

  it("/user/verify with some expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) throw err;
        let token = res.body.token;
        request
          .post(`/user/logout?userId=${res.body.id}`)
          .set("Authorization", `Bearer ${res.body.token}`)
          .end((err, res) => {
            if (err) throw err;
            request
              .post(`/user/verify`)
              .send({ jwt: token })
              .expect(400)
              .end((err, res) => {
                if (err) throw err;
                expect(res.status).toBe(400);
                done();
              });
          });
      });
  });

  it("/user/refresh with all expected parameters", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) throw err;
        let untilExpiry = res.body.refreshToken.nbf - 1000 - Date.now();

        console.log(
          `Waiting ${(untilExpiry / 1000).toFixed(
            0
          )} seconds to get a new token.`
        );
        setTimeout(() => {
          console.log("Refreshing token.");
          request
            .post(`/user/refresh?userId=${res.body.id}`)
            .set("Authorization", `Bearer ${res.body.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.body).toBeDefined();
              done();
            });
        }, untilExpiry);
      });
  }, 100000);
});
