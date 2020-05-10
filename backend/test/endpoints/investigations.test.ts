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
          return;
        }

        expect(res.status).toBe(200);
        resolve(res.body);
      });
  });
}

function createJohnDoe() {
  return new Promise((resolve, reject) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "password1",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) {
          console.log("Failed to create john doe.");
          reject(err);
          return;
        }

        expect(res.status).toBe(200);
        resolve(res.body);
      });
  });
}
function createReport(authPayload: any, bikeId: number) {
  return new Promise((resolve, reject) => {
    request
      .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
      .send({ content: "Test Report" })
      .set("Authorization", `Bearer ${authPayload.token}`)
      .end((err, res) => {
        if (err) {
          reject(err);
          return;
        }

        expect(res.status).toBe(200);
        resolve(res.body.id);
      });
  });
}

function createBike(authPayload: any) {
  return new Promise((resolve, reject) => {
    request
      .post(`/bike/register?userId=${authPayload.id}`)
      .send({ brand: "Test Brand", wheelSize: 24, gearCount: 8 })
      .set("Authorization", `Bearer ${authPayload.token}`)
      .end((err, res) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(res.body);
        expect(res.status).toBe(200);
        resolve(res.body.id);
      });
  });
}

describe("Testing Investigation Endpoints", () => {
  it("/investigations/create", (done) => {
    createJohnDoe().then((johnAuth: any) => {
      console.log("Created john doe.");
      createBike(johnAuth).then((bikeId: any) => {
        console.log("Created bike.");
        createReport(johnAuth, bikeId).then((reportId: any) => {
          console.log("Created report.");
          login().then((authPayload: any) => {
            console.log("Logged into admin account.");
            request
              .post(
                `/investigations/create?userId=${authPayload.id}&reportId=${reportId}`
              )
              .set("Authorization", `Bearer ${authPayload.token}`)
              .end((err, res) => {
                if (err) throw err;

                if (res.status !== 200) {
                  fail(res.body);
                }

                expect(res.body).toBeDefined();
                done();
              });
          });
        });
      });
    });
  });

  it("/investigations", (done) => {
    createJohnDoe().then((johnAuth: any) => {
      createBike(johnAuth).then((bikeId: any) => {
        createReport(johnAuth, bikeId).then((reportId: any) => {
          login().then((authPayload: any) => {
            request
              .post(
                `/investigations/create?userId=${authPayload.id}&reportId=${reportId}`
              )
              .set("Authorization", `Bearer ${authPayload.token}`)
              .end((err, res) => {
                if (err) throw err;
                request
                  .post(`/investigations?userId=${authPayload.id}`)
                  .set("Authorization", `Bearer ${authPayload.token}`)
                  .end((err, res) => {
                    if (err) throw err;
                    expect(res.status).toBe(200);
                    expect(res.body).toBeDefined();
                    done();
                  });
              });
          });
        });
      });
    });
  });

  it("/investigations/investigation", (done) => {
    createJohnDoe().then((johnAuth: any) => {
      createBike(johnAuth).then((bikeId: any) => {
        createReport(johnAuth, bikeId).then((reportId: any) => {
          login().then((authPayload: any) => {
            request
              .post(
                `/investigations/create?userId=${authPayload.id}&reportId=${reportId}`
              )
              .set("Authorization", `Bearer ${authPayload.token}`)
              .end((err, res) => {
                if (err) throw err;
                request
                  .post(
                    `/investigations/investigation?userId=${authPayload.id}&investigationId=${res.body.id}`
                  )
                  .set("Authorization", `Bearer ${authPayload.token}`)
                  .end((err, res) => {
                    if (err) throw err;
                    expect(res.status).toBe(200);
                    expect(res.body).toBeDefined();
                    done();
                  });
              });
          });
        });
      });
    });
  });

  it("/investigations/close", (done) => {
    createJohnDoe().then((johnAuth: any) => {
      createBike(johnAuth).then((bikeId: any) => {
        createReport(johnAuth, bikeId).then((reportId: any) => {
          login().then((authPayload: any) => {
            request
              .post(
                `/investigations/create?userId=${authPayload.id}&reportId=${reportId}`
              )
              .set("Authorization", `Bearer ${authPayload.token}`)
              .end((err, res) => {
                if (err) throw err;
                request
                  .post(
                    `/investigations/close?userId=${authPayload.id}&investigationId=${res.body.id}`
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
    });
  });
});
