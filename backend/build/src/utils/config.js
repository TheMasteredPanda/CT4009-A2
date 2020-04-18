"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
let configObject;
function create() {
    let config = {
        mariadb: {
            username: "root",
            password: "password",
            host: "127.0.0.1",
            port: 27017,
            database: "test",
            dialect: "mysql",
            timezone: "Etc/GMT0",
            pool: {
                min: 5,
                max: 10,
            },
        },
        server: {
            port: 3000,
        },
        auth: {
            secretExp: "5m",
            refreshExp: "5m",
            refreshOffset: "2m",
        },
    };
    fs_1.writeFileSync("config.json", JSON.stringify(config, null, 4));
    configObject = JSON.parse(fs_1.readFileSync("config.json").toString());
}
exports.create = create;
function set(cfgObject) {
    configObject = cfgObject;
}
exports.set = set;
function exists() {
    return fs_1.existsSync("config.json");
}
exports.exists = exists;
function remove() {
    fs_1.unlinkSync("config.json");
}
exports.remove = remove;
function get() {
    if (configObject === null || configObject === undefined) {
        configObject = JSON.parse(fs_1.readFileSync("config.json").toString());
    }
    return configObject;
}
exports.get = get;
