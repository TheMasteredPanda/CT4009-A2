"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUtils = __importStar(require("./utils/files"));
const actionManager = __importStar(require("./managers/actionsManager"));
const databaseManager = __importStar(require("./managers/databaseManager"));
const configUtils = __importStar(require("./utils/config"));
const errorhandler_1 = require("./utils/errorhandler");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
console.log("Process: ");
console.log(process.env.NODE_ENV);
const app = express_1.default();
app.use(errorhandler_1.errorResponser);
app.use(cors_1.default());
app.use(body_parser_1.default());
let scriptRoutes = fileUtils
    .map(__dirname + "/endpoints")
    .filter((path) => path.endsWith(".ts"));
let promises = [];
for (let i = 0; i < scriptRoutes.length; i++) {
    const route = scriptRoutes[i];
    promises.push(Promise.resolve().then(() => __importStar(require(route))).then((module) => {
        app.use(module);
    }));
}
if (!configUtils.exists()) {
    configUtils.create();
    console.log(`Created config.json. Please populate it.`);
    process.exit(0);
}
databaseManager
    .load()
    .then(() => databaseManager.createAssociations())
    .then(() => databaseManager.sequelize().sync())
    .then(() => actionManager.load())
    .then((names) => {
    console.log(`Successfully Loaded Action Modules: ${names.length > 0 ? names.join(", ") : "None"}`);
    return Promise.all(promises);
})
    .then(() => {
    app.use(errorhandler_1.errorHandler);
    app.listen(configUtils.get().server.port, () => {
        console.log(`Server online.`);
    });
})
    .catch(console.error);
