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

/**
 * @api {post} /user/login                      Log a user in.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                              Allows a user with an account
 *                                              to authenticate and access the system.
 *
 * @apiParam (Body Param) {string} username     The name of the account
 * @apiParam (Body Param) {string} password     The password of the account.
 * @apiParam (Body Param) {string} email        The email address of the account.
 *
 * @apiError {BadRequest} 400                   Either the body didn't include 'username',
 *                                              'password', or 'email'.
 *
 * @apiSuccess {Success} {object}               An authentication payload containing a JWT,
 *                                              JWT claims, refresh token, and user id.
 */
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

/**
 * @api {post} /user/register                 Register a user.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                            Registers a user with the system.
 *
 * @apiParam (Body Param) {string} username   The name of the account.
 * @apiParam (Body Param) {string} password   The password of the account.
 * @apiParam (Body Param) {string} email      The email address of the account.
 *
 * @apiError {BadRequest} 400                 Either the body didn't include 'username'
 *                                            'password', or 'email'
 * @apiError {Unacceptable} 406               The username has already been taken.
 *
 * @apiSuccess {Success} {object}             An authentication payload containing a JWT,
 *                                            JWT claims, and a refresh token.
 *
 */
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

/**
 * @api {post} /user/delete             Delete a user from the system.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                      Deletes a user account form the system.
 *
 * @apiSuccess {Success} {void}         A 200 status code.
 */
router.post("/user/delete", (req: Request, res: Response) => {
  actions
    .remove(req.user.id)
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /user/change/password              Changes a users password.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                                Changes a users passcode a new one provided
 *                                                in the request.
 *
 * @apiParam (Body Param) {string} newPassword    The new passcode for the user.
 *
 * @apiError {BadRequest} 400                     The query parameters did not include 'newPassword'
 *
 * @apiSuccess {Success} {void}                   A 200 status code.
 */
router.post("/user/change/password", (req: Request, res: Response) => {
  console.log("Hit /user/change/password");
  console.log(req.body);
  if (!req.body.hasOwnProperty("newPassword")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'newPassword' was not found.`
    );
    return;
  }

  actions
    .change(req.user.id, req.body.newPassword as string)
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /user/verify                 Verify auth payload.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/users
 *
 * @apiDescription                          Verifies a auth payload. More specifically
 *                                          The JWT of the payload to ensure that it is
 *                                          still valid.
 *
 * @apiParam (Body Param) {string} jwt      The json web token.
 * @apiParam (Query Param) {string} userId  The user id the JWT was issued to.
 *
 * @apiError {BadRequest} 400               Either the body didn't include 'jwt' or the query
 *                                          parameters didn't include 'userId'.
 *
 * @apiSuccess {Sucess} {boolean}           Returns true if verified, otherwise false.
 */
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

/**
 * @api {post} /user/logout               Log a user out.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                        Logs a user out of the system, disposing
 *                                        of their users key rotation instance.
 *
 * @apiParam (Query Param) userId         The id of the user logging out.
 *
 * @apiError {BadRequest} 400             The query parmaeters didn't include 'userId'
 *
 * @apiSuccess {Success} {void}           A 200 status code.
 */
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

/**
 * @api {post} /user/refresh              Refresh a users auth payload.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                        Generates a new auth payload providing the
 *                                        refresh token given is valid for the user.
 *
 * @apiError {Unauthorized} 401           There is no auth rotation instance for the user.
 * @apiError {Generic} 500                An unreachable point.
 *
 * @apiSuccess {Success} {object}         A new auth payload.
 */
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

/**
 * @api {get} /user/rank              Get a users rank.
 * @apiVerison 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                    Fetches the rank the user has.
 *
 * @apiSuccess {Success} {string}     The rank of the user.
 */
router.get("/user/rank", (req: Request, res: Response) => {
  let accountId = 0;

  if (req.query.hasOwnProperty("accountId")) {
    accountId = Number(req.query.accountId);
  } else {
    accountId = req.user.id;
  }

  actions.getRank(accountId).then((rank) => {
    res.status(200).send(rank);
  });
});

/**
 * @api {post} /user/rank/set             Set a user rank.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescriptipon                       Sets a usersa rank, providing the rank
 *                                        given in the body is a valid rank id.
 *
 * @apiParam (Body Param) rank            The rank to set.
 *
 * @apiError {BadRequest} 400             The body parameter did not include 'rank'.
 *
 * @apiSucess {Success} {void}            A 200 status code.
 */
router.post("/user/rank/set", (req: Request, res: Response) => {
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

/**
 * @api {get} /user/name                        Fetch a users username.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/user
 *
 * @apiDescription                              Fetches the name of an account.
 *
 * @apiParam (Query Param) {string} accountId   The id of the account to fetch the
 *                                              name of.
 *
 * @apiError {BadRequest} 400                   The query parameters did not include
 *                                              'accountId'
 *
 * @apiSuccess {Success} {string} username      The username requested.
 */
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
