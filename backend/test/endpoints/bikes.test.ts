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
  await models.report_images.drop();
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
  await models.report_images.drop();
  await models.bike_images.drop();
  await models.bikes.drop();
  await models.users.drop();
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
        .send({ brand: "Test Brand", wheel_size: 24.3, gear_count: 8 })
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

  it("/bike/bikes", (done) => {
    createJohnDoe().then((authPayload: any) => {
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({ brand: "Test Bike", wheel_size: 24.8, gear_count: 8 })
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
        .send({ brand: "Test Brand", wheel_size: 24.8, gear_count: 8 })
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
        .send({ brand: "Test Brand", wheel_size: 24.8, gear_count: 8 })
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
        .send({ brand: "Test Brand", wheel_size: 24.8, gear_count: 8 })
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
