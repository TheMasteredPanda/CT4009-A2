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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const sequelize_1 = require("sequelize");
const configUtils = __importStar(require("../utils/config"));
let client = null;
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!configUtils.exists() && process.env.NODE_ENV !== "development") {
            throw new Error(`DatabaseManager: Configuration file does not exist.`);
        }
        let configFile = configUtils.get();
        client = new sequelize_1.Sequelize(configFile.mariadb);
        try {
            yield client.authenticate();
            console.log(`DatabaseManager: Connected to server ${configFile.mariadb.host}:${configFile.mariadb.port}${configFile.mariadb.database !== ""
                ? `@${configFile.mariadb.database}`
                : ""}`);
        }
        catch (err) {
            throw err;
        }
    });
}
exports.load = load;
function createAssociations() {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = [];
        let models = fs.readdirSync("schemas");
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            promises.push(Promise.resolve().then(() => __importStar(require(`../schemas/${model}`))));
        }
        yield Promise.all(promises);
        if (!client) {
            throw new Error(`DatabaseManager: Cannot use client.`);
        }
        let Users = client.models.users;
        let Contacts = client.models.users_contacts;
        let Bikes = client.models.bikes;
        Users.hasMany(Contacts);
        Contacts.belongsTo(Users, {
            foreignKey: "user_id",
            onDelete: "cascade",
        });
        Users.hasMany(Bikes);
        Bikes.belongsTo(Users, {
            foreignKey: "user_id",
            onDelete: "cascade",
        });
    });
}
exports.createAssociations = createAssociations;
function sequelize() {
    if (client == null) {
        throw new Error(`DatabaseManager: Sequelize instance is not yet initialized.`);
    }
    return client;
}
exports.sequelize = sequelize;
function unload() {
    return __awaiter(this, void 0, void 0, function* () {
        if (client == null) {
            throw new Error(`DatabaseManager: Sequelize instance does not exist.`);
        }
        let configFile = configUtils.get();
        try {
            yield client.close();
            console.log(`DatabaseManager: Closed client previously connecting to ${configFile.mariadb.host}:${configFile.mariadb.port}${configFile.mariadb.database !== ""
                ? `@${configFile.mariadb.database}`
                : ""}`);
            client = null;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.unload = unload;
