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
const timeUtils = __importStar(require("../utils/timeUtil"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configUtils = __importStar(require("../utils/config"));
const errorhandler_1 = require("../utils/errorhandler");
const errorhandler_2 = require("../utils/errorhandler");
let handlers = {};
function create(userId) {
    if (Object.keys(handlers).includes(String(userId))) {
        throw new errorhandler_1.ServerGenericError("Auth", "Cannot make duplicate handlers", `A auth token handler for ${userId} already exists.`);
    }
    handlers[userId] = new AuthHandler(userId);
    return handlers[userId];
}
exports.create = create;
function hasHandler(userId) {
    return Object.keys(handlers).includes(String(userId));
}
exports.hasHandler = hasHandler;
function remove(userId) {
    if (!Object.keys(handlers).includes(String(userId))) {
        throw new errorhandler_1.ServerGenericError("Auth", "Cannot delete what the user does not have", `Cannot remove auth handlers for ${userId} because user does not have one.`);
    }
    delete handlers[userId];
}
exports.remove = remove;
function get(userId) {
    if (!Object.keys(handlers).includes(String(userId))) {
        throw new errorhandler_1.ServerGenericError("Auth", "Cannot return what the user does not have", `Cannot get the auth handler for ${userId} because the user does not have one.`);
    }
    return handlers[userId];
}
exports.get = get;
function flushAll() {
    handlers = {};
}
exports.flushAll = flushAll;
class AuthHandler {
    constructor(userId) {
        this.id = userId;
        let config = configUtils.get();
        this.secretExp = timeUtils.fromString(config.auth.secretExp);
        this.refreshExp = timeUtils.fromString(config.auth.refreshExp);
        this.refreshOffset = timeUtils.fromString(config.auth.refreshOffset);
        this.secretEntry = this.generateSecret();
        this.refreshToken = this.generateRefreshToken();
        this.jwtEntry = null;
    }
    getRefreshToken() {
        return this.refreshToken;
    }
    generateSecret() {
        let secret = crypto_1.default.randomBytes(48).toString("base64");
        let now = Date.now();
        return {
            token: secret,
            exp: now + this.secretExp,
            nbf: now - 1,
            iat: now,
        };
    }
    generateJWT(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let now = Date.now();
            let token = yield jsonwebtoken_1.default.sign({ payload, refreshToken: this.refreshToken }, this.secretEntry.token, {
                expiresIn: now + this.secretEntry.exp,
            });
            let entry = {
                token,
                exp: this.secretEntry.exp,
                nbf: this.secretEntry.nbf,
                iat: now,
            };
            this.jwtEntry = entry;
            return entry;
        });
    }
    generateRefreshToken() {
        let token = crypto_1.default.randomBytes(48).toString("base64");
        let now = Date.now();
        return {
            token,
            exp: this.secretEntry.exp + this.refreshExp,
            nbf: this.secretEntry.exp -
                this
                    .refreshOffset,
            iat: now,
        };
    }
    verify(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.jwtEntry) {
                throw new errorhandler_1.ServerGenericError("Auth", "JWT Not Found", `There is no JWT entry to reference in memory.`);
            }
            if (token !== this.jwtEntry.token) {
                throw new errorhandler_1.ServerGenericError("Auth", "Json Web Token Mismatch", `The JWT token given is not identical to the authentication token stored.`);
            }
            let decoded;
            try {
                if (this.secretEntry.nbf > Date.now()) {
                    console.log("Secret Entry NBF is bigger than the current date.");
                }
                decoded = yield jsonwebtoken_1.default.verify(token, this.secretEntry.token);
            }
            catch (err) {
                throw err;
            }
            return decoded ? true : false;
        });
    }
    refresh(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let decoded;
            try {
                decoded = yield jsonwebtoken_1.default.verify(token, this.secretEntry.token);
            }
            catch (err) {
                throw err;
            }
            let payload = decoded;
            if (!payload) {
                throw new errorhandler_1.ServerGenericError("Auth", "Payload Error", `Payload is ${payload}`);
            }
            if (payload.refreshToken.token !== this.refreshToken.token) {
                throw new errorhandler_2.ClientNotAcceptableError("Auth", "Payload Error", `Refresh token found in JWT payload is not identical to the payload stored on the server.`);
            }
            let jwtEntry = this.jwtEntry;
            if (!jwtEntry) {
                throw new errorhandler_1.ServerGenericError("Auth", "Auth error", `JWT Entry is ${jwtEntry}`);
            }
            this.secretEntry = this.generateSecret();
            this.refreshToken = this.generateRefreshToken();
            let entry;
            try {
                entry = yield this.generateJWT(JSON.stringify(payload));
            }
            catch (err) {
                throw err;
            }
            this.jwtEntry = entry;
            return entry.token;
        });
    }
}
exports.AuthHandler = AuthHandler;
