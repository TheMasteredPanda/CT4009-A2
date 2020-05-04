import { Request, Response, Router } from "express";
import { handleInternalError } from "../utils/errorhandler";
import * as userActions from "../actions/user";
import * as adminActions from "../actions/admin";

const router = Router();

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

router.get("/admin/accounts/delete", (req: Request, res: Response) => {
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
