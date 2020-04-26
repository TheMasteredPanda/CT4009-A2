"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const actions = __importStar(require("../actions/user"));
const authManager = __importStar(require("../managers/authManager"));
const errorhandler_1 = require("../utils/errorhandler");
const router = express_1.Router();
const dmz = [
    "/user/register",
    "/user/login",
    "/user/verify",
];
const authDmz = ["/user/refresh"];
router.use((req, res, next) => {
    console.log(req.originalUrl);
    if (dmz.some((endpoint) => req.url.startsWith(endpoint))) {
        next();
        return;
    }
    let query = req.query;
    if (!query.hasOwnProperty("userId")) {
        res.error.client.badRequest("Auth", "No `userId` query param", "Request must have `userId` paramater with user id.");
        return;
    }
    let userId = query.userId;
    actions
        .exists(userId)
        .then((exists) => {
        if (!exists) {
            res.error.client.notFound("Client", "User not found", `User under id ${userId} was not found.`);
            return;
        }
        return actions.get(userId);
    })
        .then((value) => {
        if (!value) {
            res.error.server.generic("Server", "User id undefined", `Couldn't fetch user ${userId} from MariaDB Server.`);
            return;
        }
        let user = value;
        req.user = user;
        next();
    });
});
router.use((req, res, next) => {
    if (dmz.some((endpoint) => req.url.startsWith(endpoint)) ||
        authDmz.some((endpoint) => req.url.startsWith(endpoint))) {
        next();
        return;
    }
    let headers = req.headers;
    if (!headers.hasOwnProperty("authorization")) {
        res.error.client.badRequest("Auth", "No Authorization Header");
        return;
    }
    let value = headers.authorization;
    if (!value) {
        res.error.client.badRequest("Auth", "Invalid Authorization Value", `The Authorization header was found, but the value is ${value}`);
        return;
    }
    if (!value.startsWith("Bearer")) {
        res.error.client.badRequest("Auth", "Missing Bearer Prefix", "Authorization value is missing `Bearer` prefix.");
        return;
    }
    if (value.split(" ").length !== 2) {
        res.error.client.badRequest("Auth", "Incorrectly Formatted Authorization Value", "Authorization value must be formatted as `Bearer: <jwt>`.");
        return;
    }
    let jwt = value.split(" ")[1];
    if (!authManager.hasHandler(req.user.id)) {
        res.error.client.unauthorized("Auth", "User unknown", `There is no auth handler for user ${req.user.id}, who are you?`);
        return;
    }
    let handler = authManager.get(req.user.id);
    handler.verify(jwt).then((verfied) => {
        if (!verfied) {
            res.error.client.unauthorized("Auth", "Verification failure", `The JWT given could not be vertified with the auth handler for ${req.user.id}`);
            return;
        }
        next();
    });
});
router.post("/user/login", (req, res) => {
    let body = req.body;
    console.log("Hit /user/login");
    console.log(body);
    if (!body.hasOwnProperty("username")) {
        res.error.client.badRequest("Client", "Parameter not found", `Parameter 'username' was not found.`, { parameter: "username" });
        return;
    }
    if (!body.hasOwnProperty("password")) {
        res.error.client.badRequest("Client", "Parameter not found", `Parameter 'password' was not found.`, { parameter: "password" });
        return;
    }
    actions
        .login(body.username, body.password)
        .then((data) => {
        res.status(200).send(data);
    })
        .catch((err) => errorhandler_1.handleInternalError(res, err));
});
router.post("/user/register", (req, res) => {
    let body = req.body;
    if (!body.hasOwnProperty("username")) {
        res.error.client.badRequest("Client", "Parameter not found", `Parameter 'username' was not found`, { parameter: "username" });
        return;
    }
    if (!body.hasOwnProperty("password")) {
        res.error.client.badRequest("Client", "Parameter not found", `Parameter 'password' was not found.`, { parameter: "password" });
        return;
    }
    if (!body.hasOwnProperty("email")) {
        res.error.client.badRequest("Client", "Parameter not found", `Parameter 'email' was not found.`, { parameter: "email" });
        return;
    }
    actions
        .register(body)
        .then((data) => res.status(200).send(data))
        .catch((err) => errorhandler_1.handleInternalError(res, err));
});
router.post("/user/verify", (req, res) => {
    let body = req.body;
    let query = req.query;
    if (!body.hasOwnProperty("jwt") || !body.jwt) {
        res.error.client.badRequest("Parameters", "Parameter not found", `Body parameter 'jwt' was not found.`);
        return;
    }
    if (!query.hasOwnProperty("userId") || !query.userId) {
        res.error.client.badRequest("Parameters", "Parameter not found", `Query parameter 'userId' was not found.`);
        return;
    }
    actions.verify(body.jwt, query.userId).then((verified) => {
        res.status(200).send(verified);
    });
});
router.post("/user/logout", (req, res) => {
    let query = req.query;
    if (!query.hasOwnProperty("userId")) {
        res.error.client.badRequest("Parameters", "Parameter not found", `Query parameter 'userId' was not found.`);
        return;
    }
    actions.logout(query.userId);
    res.sendStatus(200);
});
router.post("/user/refresh", (req, res) => {
    if (!authManager.hasHandler(req.user.id)) {
        res.error.client.unauthorized("Auth", "User has no handler", `User ${req.user.id} has no auth handler, who are you?`);
        return;
    }
    if (!req.headers.authorization) {
        res.error.server.generic("Auth", "Unreachable point reached", `An assumed unreachable point in the code has been reached in /user/refresh`);
        return;
    }
    let handler = authManager.get(req.user.id);
    handler
        .refresh(req.headers.authorization.split(" ")[1])
        .then((value) => {
        let jwt = value;
        res.status(200).send(jwt.token);
    });
});
router.get("/user/rank", (req, res) => {
    actions.getRank(req.user.id).then((rank) => {
        res.status(200).send(rank);
    });
});
router.get("/user/rank/set", (req, res) => {
    let body = req.body;
    if (!body.hasOwnProperty("rank")) {
        res.error.client.badRequest("Client", "Parameters not found", `Body parameter 'rank' not found.`);
        return;
    }
    actions
        .setRank(req.user.id, body.rank)
        .then(() => res.sendStatus(200))
        .catch((err) => errorhandler_1.handleInternalError(res, err));
});
exports.default = router;
