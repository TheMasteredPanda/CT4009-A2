"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authManager = __importStar(require("../../src/managers/authManager"));
const databaseManager = __importStar(require("../../src/managers/databaseManager"));
const app_1 = require("../../src/app");
const supertest_1 = __importDefault(require("supertest"));
const request = supertest_1.default("http://localhost:4000");
beforeAll((done) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield app_1.start();
    done();
}));
afterEach((done) => __awaiter(void 0, void 0, void 0, function* () {
    let models = databaseManager.sequelize().models;
    yield models.users_contacts.drop();
    yield models.users.drop();
    yield authManager.flushAll();
    yield done();
}));
beforeEach((done) => __awaiter(void 0, void 0, void 0, function* () {
    yield databaseManager.sequelize().sync();
    done();
}));
afterAll((done) => __awaiter(void 0, void 0, void 0, function* () {
    let models = databaseManager.sequelize().models;
    yield models.users_contacts.drop();
    yield models.users.drop();
    yield app_1.shutdown();
    done();
}));
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
            if (err)
                throw err;
            expect(data.body).toBeDefined();
            expect(data.body.id).toBeDefined();
            expect(data.body.token).toBeDefined();
            request
                .post(`/user/logout?userId=${data.body.id}`)
                .set("Authorization", `Bearer ${data.body.token}`)
                .end((err, data2) => {
                if (err)
                    throw err;
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
            if (err)
                throw err;
            request
                .post(`/user/logout?userId=${data.body.id}`)
                .set("authorization", `Bearer ${data.body.token}`)
                .end((err, data) => {
                if (err)
                    throw err;
                request
                    .post("/user/login")
                    .send({ username: "johndoe", password: "passwd1" })
                    .end((err, data) => {
                    if (err)
                        throw err;
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
            if (err)
                throw err;
            request
                .post(`/user/valid?userId=${res.body.id}`)
                .send({ jwt: res.body.token })
                .end((err, res) => {
                if (err)
                    throw err;
                expect(res.body).toBe(true);
                done();
            });
        });
    });
});
