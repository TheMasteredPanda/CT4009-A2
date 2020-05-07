import { Router, Request, Response } from "express";
import * as actions from "../actions/user";
import * as authManager from "../managers/authManager";
import { handleInternalError } from "../utils/errorhandler";

/**
 * This script contains all user specific endpoints, that includes:
 * -  Authentication and Authorisation Endpoints
 * -  Login and Registering Endpoints
 * -  Account Endpoints
 */
const router = Router();

router.post("/user/login", (req: Request, res: Response) => {
  let body = req.body;

  if (!body.hasOwnProperty("username")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Parameter 'username' was not found.`,
      { parameter: "username" }
    );
    return;
  }

  if (!body.hasOwnProperty("password")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Parameter 'password' was not found.`,
      { parameter: "password" }
    );
    return;
  }

  actions
    .login(body.username, body.password)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err: any) => handleInternalError(res, err));
});

router.post("/user/register", (req: Request, res: Response) => {
  let body = req.body;

  if (!body.hasOwnProperty("username")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Parameter 'username' was not found`,
      { parameter: "username" }
    );
    return;
  }

  if (!body.hasOwnProperty("password")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Parameter 'password' was not found.`,
      { parameter: "password" }
    );
    return;
  }

  if (!body.hasOwnProperty("email")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Parameter 'email' was not found.`,
      { parameter: "email" }
    );
    return;
  }

  actions
    .register(body)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => handleInternalError(res, err));
});

router.post("/user/delete", (req: Request, res: Response) => {
  actions
    .remove(req.user.id)
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

router.post("/user/verify", (req: Request, res: Response) => {
  let body = req.body;
  let query: any = req.query;

  if (!body.hasOwnProperty("jwt") || !body.jwt) {
    res.error.client.badRequest(
      "Parameters",
      "Parameter not found",
      `Body parameter 'jwt' was not found.`
    );
    return;
  }

  if (!query.hasOwnProperty("userId") || !query.userId) {
    res.error.client.badRequest(
      "Parameters",
      "Parameter not found",
      `Query parameter 'userId' was not found.`
    );
    return;
  }

  actions.verify(body.jwt, query.userId).then((verified) => {
    res.status(200).send(verified);
  });
});

router.post("/user/logout", (req: Request, res: Response) => {
  let query: any = req.query;

  if (!query.hasOwnProperty("userId")) {
    res.error.client.badRequest(
      "Parameters",
      "Parameter not found",
      `Query parameter 'userId' was not found.`
    );
    return;
  }

  actions.logout(query.userId);
  res.sendStatus(200);
});

router.post("/user/refresh", (req: Request, res: Response) => {
  if (!authManager.hasHandler(req.user.id)) {
    res.error.client.unauthorized(
      "Auth",
      "User has no handler",
      `User ${req.user.id} has no auth handler, who are you?`
    );
    return;
  }

  if (!req.headers.authorization) {
    res.error.server.generic(
      "Auth",
      "Unreachable point reached",
      `An assumed unreachable point in the code has been reached in /user/refresh`
    );
    return;
  }

  let handler = authManager.get(req.user.id);
  handler
    .refresh(req.headers.authorization.split(" ")[1])
    .then((value: any) => {
      let jwt = value as authManager.JWT;
      res.status(200).send(jwt.token);
    });
});

router.get("/user/rank", (req: Request, res: Response) => {
  actions.getRank(req.user.id).then((rank) => {
    res.status(200).send(rank);
  });
});

router.get("/user/rank/set", (req: Request, res: Response) => {
  let body = req.body;

  if (!body.hasOwnProperty("rank")) {
    res.error.client.badRequest(
      "Client",
      "Parameters not found",
      `Body parameter 'rank' not found.`
    );
    return;
  }

  actions
    .setRank(req.user.id, body.rank)
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

router.get("/user/name", (req: Request, res: Response) => {
  let accountId = req.query.accountId;

  if (!accountId) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'accountId' was not found.`
    );
    return;
  }

  actions
    .getUsername(Number(accountId))
    .then((username) => res.status(200).send({ username }))
    .catch((err) => handleInternalError(res, err));
});

export default router;
