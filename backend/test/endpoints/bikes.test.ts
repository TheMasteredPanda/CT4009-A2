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

function createJohnDoe() {
  return new Promise((resolve, reject) => {
    request
      .post("/user/register")
      .send({
        username: "johndoe",
        password: "passwd",
        email: "johndoe@gmail.com",
      })
      .end((err, res) => {
        if (err) reject(err);
        expect(res.status).toBe(200);
        resolve(res.body);
      });
  });
}

//
describe("Testing Bike Endpoints: ", () => {
  it("/bike/register", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({ brand: "Test Brand", wheelSize: 24.3, gearCount: 8 })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();

          request
            .post(
              `/bike/images/upload?userId=${authPayload.id}&bikeId=${res.body.id}`
            )
            .set("Authorization", `Bearer ${authPayload.token}`)
            .attach("testImage", "../test/assets/bike_1.jpg")
            .attach("testImage", "../test/assets/bike_2.jpg")
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);
              expect(res.body).toBeDefined();
              done();
            });
        });
    });
  }, 15000);

  it("/bike/images/delete", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({ brand: "Test Brand", wheelSize: 24.8, gearCount: 8 })
        .end((err, res) => {
          if (err) throw err;
          request
            .post(
              `/bike/images/upload?bikeId=${res.body.id}&userId=${authPayload.id}`
            )
            .set("Authorization", `Bearer ${authPayload.token}`)
            .attach("testImage", "../test/assets/bike_1.jpg")
            .end((err, res) => {
              if (err) throw err;
              console.log(res.body);
              expect(res.status).toBe(200);
              expect(res.body).toBeDefined();
              request
                .post(
                  `/bike/images/delete?userId=${authPayload.id}`
                ).send({imageIds: res.body[0].image_id})
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
  it("/bike/bikes", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({ brand: "Test Bike", wheelSize: 24.8, gearCount: 8 })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body.id).toBeDefined();
          request
            .post(
              `/bike/images/upload?userId=${authPayload.id}&bikeId=${res.body.id}`
            )
            .attach("testImage", "../test/assets/bike_1.jpg")
            .set("Authorization", `Bearer ${authPayload.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);
              expect(res.body).toBeDefined();
              request
                .get(`/bike/bikes?userId=${authPayload.id}`)
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

  it("/bike", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .send({ brand: "Test Brand", wheelSize: 24.8, gearCount: 8 })
        .set("Authorization", `Bearer ${authPayload.token}`)
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body.id).toBeDefined();
          let id = res.body.id;
          request
            .post(
              `/bike/images/upload?userId=${authPayload.id}&bikeId=${res.body.id}`
            )
            .attach("testImage", "../test/assets/bike_1.jpg")
            .set("Authorization", `Bearer ${authPayload.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);
              request
                .get(`/bike?userId=${authPayload.id}&bikeId=${id}`)
                .set("Authorization", `Bearer ${authPayload.token}`)
                .end((err, res) => {
                  if (err) throw err;
                  expect(res.status).toBe(200);
                  expect(res.body).toBeDefined();
                  expect(res.body.id).toBe(id);
                  done();
                });
            });
        });
    });
  });

  it("/bike/unregister", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .send({ brand: "Test Brand", wheelSize: 24.8, gearCount: 8 })
        .set("Authorization", `Bearer ${authPayload.token}`)
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body.id).toBeDefined();
          let id = res.body.id;
          request
            .post(
              `/bike/images/upload?userId=${authPayload.id}&bikeId=${res.body.id}`
            )
            .set("Authorization", `Bearer ${authPayload.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBeDefined();
              request
                .post(`/bike/unregister?userId=${authPayload.id}&bikeId=${id}`)
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

  it("/bike/update", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({ brand: "Test Brand", wheelSize: 24.8, gearCount: 8 })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body.id).toBeDefined();
          let id = res.body.id;
          request
            .post(`/bike/images/upload?userId=${authPayload.id}&bikeId=${id}`)
            .attach("testImage", "../test/assets/bike_1.jpg")
            .set("Authorization", `Bearer ${authPayload.token}`)
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);

              request
                .post(`/bike/update?userId=${authPayload.id}&bikeId=${id}`)
                .set("Authorization", `Bearer ${authPayload.token}`)
                .send({ brand: "Riking" })
                .end((err, res) => {
                  if (err) throw err;
                  expect(res.status).toBe(200);
                  expect(res.body.brand).toBe("Riking");
                  done();
                });
            });
        });
    });
  });
});
