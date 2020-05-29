import { Request, Response, Router } from "express";
import { handleInternalError } from "../utils/errorhandler";
import * as userActions from "../actions/user";
import * as adminActions from "../actions/admin";

const router = Router();

/**
 * Middleware used to ensure that only admins can access these functions.
 */
router.use((req: Request, res: Response, next: Function) => {
  if (!req.originalUrl.startsWith("/admin")) {
    next();
    return;
  }
  if (req.user.rank !== "police_admin") {
    res.error.client.unauthorized(
      "Auth",
      "Access denied",
      `You cannot access admin functions if you are not an admin.`
    );
    return;
  }

  next();
});

/**
 * @api {post} /admin/accounts/create   Create an officer account.
 * @apiVersion 0.1.0
 * @apiDescription                      Creates a new officer account.
 * @apiGroup endpoints/admin
 *
 * @apiParam (Body Param) username      The name for this account.
 * @apiParam (Body Param) password      The password for this account.
 * @apiParam (Body Param) email         The email address for this account.
 *
 * @apiParamExample Example:
 *      {
 *        "username": "johndoe",
 *        "password": "password1",
 *        "email": "johndoe@gmail.com"
 *      }
 *
 * @apiError {BadRequest} 400           Either the username, password, or email parameter is missing.
 * @apiError {NotAcceptable} 406        The username is taken or the email is already in use.
 *
 * @apiSuccess {Sucess} {string} id     The id of the newly created officer account.
 *
 */
router.post("/admin/accounts/create", (req: Request, res: Response) => {
  let body = req.body;

  if (!body.hasOwnProperty("username")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'username' was not found.`,
      { parameters: ["username"] }
    );
    return;
  }

  if (!body.hasOwnProperty("password")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'password' was not found.`,
      { parameters: ["password"] }
    );
    return;
  }

  if (!body.hasOwnProperty("email")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'email' was not found.`,
      { parameters: ["email"] }
    );
    return;
  }

  adminActions
    .createOfficerAccount(body.username, body.password, body.email)
    .then((id: string) => {
      res.status(200).send({ id });
    })
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /admin/accounts      Fetch all user accounts, or specified accounts.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/admin
 * @apiDescription                  Fetches all users account information, save for their
 *                                  passwords. If an array of ids are specified in the body
 *                                  of this request, then it will fetch all accounts in that
 *                                  array.
 *
 * @apiParam (Body Param) accounts - An array of account ids. Optional.
 *
 * @apiParamExample {json} Example:
 *      {
 *        "accounts": [1,2,3,4,5]
 *      }
 *
 * @apiSuccess {Success} {object[]} An array of accounts.
 */
router.post("/admin/accounts", (req: Request, res: Response) => {
  let accounts = [];

  if (req.body.accounts) {
    accounts = req.body.accounts;
  }

  adminActions
    .getAllAccounts(accounts)
    .then((accounts) => res.status(200).send({ accounts }))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /admin/accounts/search       Search all accounts.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/admin
 *
 * @apiDescription
 */
router.post("/admin/accounts/search", (req: Request, res: Response) => {
  let body = req.body;

  if (body.length === 0) {
    res.error.client.badRequest(
      "Client",
      "Body not found",
      `Body parameters 'username', 'id', and/or 'rank' was not found.`
    );
    return;
  }

  if (
    !body.hasOwnProperty("id") &&
    !body.hasOwnProperty("username") &&
    !body.hasOwnProperty("rank")
  ) {
    res.error.client.badRequest(
      "Client",
      "Parameters not found",
      `Query parameter 'id', 'username', and 'rank' was not found. At least one needs to be present.`
    );
    return;
  }

  adminActions
    .searchAccounts(body)
    .then((ids) => res.status(200).send({ ids }))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /admin/accounts/account      Get account details
 * @apiVersion 0.1.0
 * @apiGroup endpoints/admin
 *
 * @apiDescription                          Fetches information on the account id given
 *                                          In the request. This includes images and
 *                                          contacts
 *
 * @apiParam (Query Param) accountId         The id of the account to fetch information abount.
 *
 * @apiError {BadRequest} 400                The accountId query paramter was not found.
 * @apiError {NotFound} 404                  The accountId does not correlate to a user
 *                                           stored in the database
 *
 * @apiSuccess {Success} {object}            The account object.
 *
 */
router.get("/admin/accounts/account", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("accountId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'accountId' was not found.`
    );
    return;
  }

  adminActions
    .getAccountDetails(Number(query.accountId))
    .then((account) => res.status(200).send({ account }))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /admin/accounts/delete     Delete an account
 * @apiVersion 0.1.0
 * @apiGroup endpoints/admin
 * @apiDescription                        Deletes an account from the database.
 *
 * @apiParam (Body Param) accountId  The id of the account to delete.
 *
 * @apiError {BadRequest} 400             The accountId query parameter was not found.
 *
 * @apiSuccess {Success} {void}           A 200 status code.
 **/
router.post("/admin/accounts/delete", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("accountId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'accountId' was not found.`
    );
    return;
  }

  adminActions
    .deleteAccount(Number(query.accountId))
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});
export default router;
