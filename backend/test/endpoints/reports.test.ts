import * as fs from "fs";
import { start, shutdown } from "../../src/app";
import * as databaseManager from "../../src/managers/databaseManager";
import supertest from "supertest";
import * as authManager from "../../src/managers/authManager";
import { ModelCtor, Model } from "sequelize/types";
import { endianness } from "os";
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
          reject(err);
          return;
        }

        expect(res.status).toBe(200);
        resolve(res.body);
      });
  });
}

function createBikeEntry(authPayload: any) {
  return new Promise((resolve, reject) => {
    request
      .post(`/bikes/register?bikeId=${authPayload.id}`)
      .send({ brand: "Test Brand", wheel_size: 24.3, gear_count: 8 })
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

describe("Testing Report Endpoints", () => {
  it("/reports/create", (done) => {
    createJohnDoe().then((authPayload: any) => {
      createBikeEntry(authPayload).then((bikeId: any) => {
        request
          .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
          .set({ content: "Test Report" })
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

  it("/reports", (done) => {
    createJohnDoe().then((authPayload: any) => {
      createBikeEntry(authPayload).then((bikeId: any) => {
        request
          .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
          .send({ content: "Test Report" })
          .set("Authorization", `Bearer ${authPayload.token}`)
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            request
              .get(`/reports?userId=${authPayload.id}`)
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

  it("/reports/report", (done) => {
    createJohnDoe().then((authPayload: any) => {
      createBikeEntry(authPayload).then((bikeId: any) => {
        request
          .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
          .set("Authorization", `Bearer ${authPayload.token}`)
          .send({ content: "Test Report" })
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            request
              .get(
                `/reports/report?userId=${authPayload.id}&reportId=${res.body.id}`
              )
              .set("Authorizatin", `Bearer ${authPayload.token}`)
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

  it("/reports/comments/create", (done) => {
    createJohnDoe().then((authPayload: any) => {
      createBikeEntry(authPayload).then((bikeId: any) => {
        request
          .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
          .send({ content: "Test Report" })
          .set("Authorization", `Bearer ${authPayload.token}`)
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            request
              .post(
                `/reports/comments/create?userId=${authPayload.id}&bikeId=${bikeId}`
              )
              .set("Authorization", `Bearer ${authPayload.token}`)
              .send({ comment: "This is a test comment", type: "civilian" })
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

  it("/reports/comments", (done) => {
    createJohnDoe().then((authPayload: any) => {
      createBikeEntry(authPayload).then((bikeId: any) => {
        request
          .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
          .send({ content: "Test Reports" })
          .set("Authorization", `Bearer ${authPayload.token}`)
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            let reportId = res.body.id;
            request
              .post(
                `/reports/comments/create?userId=${authPayload.id}&bikeId=${bikeId}`
              )
              .send({ comment: "This is a test comment.", type: "civilian" })
              .set("Authorization", `Bearer ${authPayload.token}`)
              .end((err, res) => {
                if (err) throw err;
                expect(res.status).toBe(200);
                expect(res.body).toBeDefined();
                request
                  .get(
                    `/reports/comments?userId=${authPayload.id}&reportId=${reportId}&type=civilian`
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

  it("/reports/close", (done) => {
    createJohnDoe().then((authPayload: any) => {
      createBikeEntry(authPayload).then((bikeId: any) => {
        request
          .post(`/reports/create?userId=${authPayload.id}&bikeId=${bikeId}`)
          .send({ content: "Test Content" })
          .set("Authorization", `Bearer ${authPayload.token}`)
          .end((err, res) => {
            if (err) throw err;
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            request
              .post(`/reports/close?userId=${authPayload.id}&bikeId=${bikeId}`)
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
