import * as fs from "fs";
import { start, shutdown } from "../../src/app";
import * as databaseManager from "../../src/managers/databaseManager";
import supertest from "supertest";
import * as authManager from "../../src/managers/authManager";
import { ModelCtor, Model } from "sequelize/types";
import { getReportIds } from "src/actions/reports";
let request = supertest("http://localhost:4005");

beforeAll(async (done) => {
  process.env.TEST_MARIADB_USERNAME = "root";
  process.env.TEST_MARIADB_PASSWORD = "passwd";
  process.env.TEST_MARIADB_HOST = "172.17.0.2";
  process.env.TEST_MARIADB_PORT = "3306";
  process.env.TEST_MARIADB_DATABASE = "test";
  process.env.TEST_SERVER_PORT = "4005";
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
      .post(`/bike/register?userId=${authPayload.id}&bikeId=${authPayload.id}`)
      .set("Authorization", `Bearer ${authPayload.token}`)
      .send({ brand: "Test Brand", wheelSize: 24, gearCount: 8 })
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
          .send({ content: "Test Report" })
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
              .post(`/reports?userId=${authPayload.id}`)
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
                `/reports/comments/create?userId=${authPayload.id}&reportId=${res.body.id}&bikeId=${bikeId}&type=civilian`
              )
              .set("Authorization", `Bearer ${authPayload.token}`)
              .send({ comment: "This is a test comment" })
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
                `/reports/comments/create?userId=${authPayload.id}&reportId=${reportId}&bikeId=${bikeId}&type=civilian`
              )
              .send({ comment: "This is a test comment." })
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
              .post(
                `/reports/close?userId=${authPayload.id}&reportId=${res.body.id}`
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
