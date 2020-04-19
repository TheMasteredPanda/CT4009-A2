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
const bcrypt_1 = __importDefault(require("bcrypt"));
const authManager = __importStar(require("../managers/authManager"));
const User_schema_1 = __importDefault(require("../schemas/User.schema"));
const Contacts_schema_1 = __importDefault(require("../schemas/Contacts.schema"));
const errorhandler_1 = require("../utils/errorhandler");
function exists(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield User_schema_1.default.findOne({ where: { id: userId } });
        return result ? true : false;
    });
}
exports.exists = exists;
function get(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let userInfo = yield User_schema_1.default.findOne({ where: { id: userId } });
        let userContacts = yield Contacts_schema_1.default.findAll({ where: { id: userId } });
        if (userInfo === null || userContacts === null) {
            return null;
        }
        else {
            let user = userInfo.toJSON();
            let contacts = JSON.parse(JSON.stringify(userContacts));
            user.contacts = contacts;
            return user;
        }
    });
}
exports.get = get;
function register(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let usernameExists = yield User_schema_1.default.findOne({
            where: { username: params.username },
        });
        if (usernameExists) {
            throw new errorhandler_1.ClientNotAcceptableError("Client", "Username already taken", `The username ${params.username} has already been taken`, { username: params.username });
        }
        let hash = yield bcrypt_1.default.hash(params.password, 10);
        let model = yield User_schema_1.default.create({ username: params.username, password: hash });
        let user = model.toJSON();
        yield Contacts_schema_1.default.create({
            userId: user.id,
            contact_value: params.email,
            contact_type: "email",
            contact_hierarchy_position: 1,
        });
        let handler = authManager.create(user.id);
        let jwtEntry = yield handler.generateJWT({
            username: user.username,
            id: user.id,
        });
        let refreshToken = handler.getRefreshToken();
        return {
            token: jwtEntry.token,
            id: user.id,
            refreshToken: {
                token: refreshToken.token,
                nbf: refreshToken.nbf,
                exp: refreshToken.exp,
            },
        };
    });
}
exports.register = register;
function login(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let model = yield User_schema_1.default.findOne({ where: { username } });
        if (!model)
            throw new errorhandler_1.ClientNotFoundError("Client", "User not found", `Couldn't find user ${username}`);
        let user = model.toJSON();
        let valid;
        try {
            valid = yield bcrypt_1.default.compare(password, user.password);
        }
        catch (err) {
            throw err;
        }
        if (!valid) {
            throw new errorhandler_1.ClientUnauthorizedError("Client", "Unable to authorise user", `Passwords are not identical.`);
        }
        let handler = authManager.create(user.id);
        let jwt = yield handler.generateJWT({ username: user.username, id: user.id });
        let refreshToken = handler.getRefreshToken();
        return {
            token: jwt.token,
            id: user.id,
            refreshToken: {
                token: refreshToken.token,
                exp: refreshToken.exp,
                nbf: refreshToken.nbf,
            },
        };
    });
}
exports.login = login;
function verify(token, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!authManager.hasHandler(userId))
            return false;
        let handler = authManager.get(userId);
        return yield handler.verify(token);
    });
}
exports.verify = verify;
function logout(userId) {
    if (!authManager.hasHandler(userId))
        return;
    authManager.remove(userId);
}
exports.logout = logout;
