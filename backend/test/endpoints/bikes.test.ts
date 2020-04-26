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
  await models.users.drop();
  await models.bikes.drop();
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
  it.only("/biking/register", (done) => {
    createJohnDoe().then((authPayload: any) => {
      console.log(authPayload);
      request
        .post(`/bike/register?userId=${authPayload.id}`)
        .set("Authorization", `Bearer ${authPayload.token}`)
        .send({ brand: "Test Brand", wheel_size: 24.3, gear_count: 8 })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();
          done();
        });
    });
  });

  it("/bike/bikes", (done) => {
    createJohnDoe().then((authPayload: any) => {
      let images = [
        fs.readFileSync("../assets/bike_1.jpg").toString("utf8"),
        fs.readFileSync("../assets/bike_2.jpg").toString("utf8"),
      ];
      request
        .post(`http://localhost:4000/bike/register?userId=${authPayload.id}`)
        .send({ brand: "Test Brand", wheel_size: 24.3, gear_count: 8, images })
        .end((err, res) => {
          if (err) throw err;

          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();

          request
            .get(`http://localhost:4000/bike/bikes?userId=${authPayload.id}`)
            .end((err, bikesRes) => {
              if (err) throw err;
              expect(bikesRes.status).toBe(200);
              expect(bikesRes.body).toBeDefined();
              expect(bikesRes.body[0]).toBe(res.body);
              done();
            });
        });
    });
  });

  it("/bike", (done) => {
    createJohnDoe().then((authPayload: any) => {
      let images = [
        fs.readFileSync("../assets/bike_1.jpg").toString("utf8"),
        fs.readFileSync("../assets/bike_2.jpg").toString("utf8"),
      ];
      request
        .post(`http://localhost:4000/bike/register?userId=${authPayload.id}`)
        .send({ brand: "Test Brand", wheel_size: 24.8, gear_count: 8, images })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();

          request
            .get(
              `http://localhost:4000/bike?userId=${authPayload.id}&bikeId=${res.body}`
            )
            .end((err, bikeRes) => {
              if (err) throw err;
              expect(bikeRes.status).toBe(200);
              expect(bikeRes.body).toBeDefined();
              expect(bikeRes.body.id).toBe(res.body);
              done();
            });
        });
    });
  });

  it("/bike/unregister", (done) => {
    createJohnDoe().then((authPayload: any) => {
      let images = [
        fs.readFileSync("../assets/bike_1.jph").toString("utf8"),
        fs.readFileSync("../assets/bike_2.jph").toString("utf8"),
      ];

      request
        .post(`http://localhost:4000/bike/register?userId=${authPayload.id}`)
        .send({ brand: "Test Brand", wheel_size: 24.8, gear_count: 8, images })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();
          request
            .post(
              `http://localhost:4000/bike/unregister?userId=${authPayload.id}&bikeId=${res.body}`
            )
            .end((err, res) => {
              if (err) throw err;
              expect(res.status).toBe(200);
              done();
            });
        });
    });
  });

  it("/bike/update", (done) => {
    createJohnDoe().then((authPayload: any) => {
      let images = [
        fs.readFileSync("../assets/bike.jpg").toString("utf8"),
        fs.readFileSync("../assets/bike_2.jpg").toString("utf8"),
      ];
      request
        .post(`http://localhost:4000/bike/register?userId=${authPayload.id}`)
        .send({ brand: "Test Brand", wheel_size: 24.8, gear_count: 8, images })
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();

          request
            .post(
              `http://localhost:4000/bike/update?userId=${authPayload.id}&bikeId=${res.body}`
            )
            .send({ brand: "Revving" })
            .end((err, updatedRes) => {
              if (err) throw err;
              expect(updatedRes.status).toBe(200);
              expect(updatedRes.body.id).toBe(res.body.id);
              done();
            });
        });
    });
  });
});
