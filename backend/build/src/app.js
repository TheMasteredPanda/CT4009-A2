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
let server = null;
const app = express_1.default();
function shutdown() {
    return __awaiter(this, void 0, void 0, function* () {
        yield actionManager.unload();
        yield databaseManager.unload();
        yield (server === null || server === void 0 ? void 0 : server.close());
    });
}
exports.shutdown = shutdown;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!configUtils.exists() && process.env.NODE_ENV !== "development") {
            configUtils.create();
            console.log(`Created config.json. Please populate it.`);
            process.exit(0);
        }
        if (process.env.NODE_ENV === "development") {
            configUtils.set({
                mariadb: {
                    username: process.env.TEST_MARIADB_USERNAME,
                    password: process.env.TEST_MARIADB_PASSWORD,
                    host: process.env.TEST_MARIADB_HOST,
                    port: process.env.TEST_MARIADB_PORT,
                    database: process.env.TEST_MARIADB_DATABASE,
                    dialect: "mariadb",
                    timezone: "Etc/GMT0",
                    define: {
                        charset: "utf8",
                        collate: "utf8_unicode_ci",
                    },
                    pool: {
                        min: 5,
                        max: 10,
                    },
                },
                server: {
                    port: process.env.TEST_SERVER_PORT,
                },
                auth: {
                    secretExp: process.env.TEST_SERVER_AUTH_SECRETEXP,
                    refreshExp: process.env.TEST_SERVER_AUTH_REFRESHEXP,
                    refreshOffset: process.env.TEST_SERVER_AUTH_REFRESHOFFSET,
                },
            });
        }
        yield databaseManager.load();
        yield databaseManager.createAssociations();
        yield databaseManager.sequelize().sync();
        app.use(errorhandler_1.errorResponser);
        app.use(cors_1.default());
        app.use(body_parser_1.default.json());
        let scriptRoutes = fileUtils
            .map("endpoints")
            .filter((path) => path.endsWith(".js"));
        for (let i = 0; i < scriptRoutes.length; i++) {
            const route = scriptRoutes[i];
            yield Promise.resolve().then(() => __importStar(require(`./${route}`))).then((module) => {
                console.log(`Loaded Endpoint: ${route.split("endpoints/")[1]}`);
                app.use(module.default);
            });
        }
        let names = yield actionManager.load();
        console.log(`Successfully Loaded Action Modules: ${names.length > 0 ? names.join(", ") : "None"}`);
        app.use(errorhandler_1.errorHandler);
        server = app.listen(configUtils.get().server.port, () => {
            console.log(`Server online.`);
        });
    });
}
exports.start = start;
if (process.env.NODE_ENV !== "development") {
    start();
}
