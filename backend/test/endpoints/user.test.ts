import * as authManager from "../../src/managers/authManager";
import * as databaseManager from "../../src/managers/databaseManager";
import Docker from "dockerode";
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
  process.env.TEST_SERVER_AUTH_SECRETEXP = "5m";
  process.env.TEST_SERVER_AUTH_REFRESHEXP = "2m";
  process.env.TEST_SERVER_AUTH_REFRESHOFFSET = "1m";

  process.chdir(process.cwd() + `/build/src`);
  await start();
  done();
});

afterEach(async (done) => {
  let models: {
    [key: string]: ModelCtor<Model<any, any>>;
  } = databaseManager.sequelize().models;

  await models.users_contacts.drop();
  await models.users.drop();
  await authManager.flushAll();
  await done();
});

beforeEach(async (done) => {
  await databaseManager.sequelize().sync();
  done();
});

afterAll(async (done) => {
  let models: {
    [key: string]: ModelCtor<Model<any, any>>;
  } = databaseManager.sequelize().models;
  await models.users_contacts.drop();
  await models.users.drop();
  await shutdown();
  done();
});

describe("Testing Auth Endpoints: ", () => {
  it("/user/register", (done) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) {
          throw err;
        }

        expect(res.body).toBeDefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.token).toBeDefined();
        done();
      });
  });

  it("/user/logout", (done) => {
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

  it("/user/login", (done) => {
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

  it("/user/valid", (done) => {
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
          .post(`/user/valid?userId=${res.body.id}`)
          .send({ jwt: res.body.token })
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).toBe(true);
            done();
          });
      });
  });
});
