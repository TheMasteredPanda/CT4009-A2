import { Request, Response } from "express";
import * as actions from "../actions/user";

const dmz = [
  "/user/register",
  "/user/login",
  "/user/verify",
  "/images",
]; /*Demilitarized endpoints, used to stop requests to these endpoints 
  from being processed through the middleware below.*/

/**
 * Uses the 'userId' query parameter to fetch user informaton and
 * store it in the request object for future reference.
 */
export default function (req: Request, res: Response, next: Function) {
  if (dmz.some((endpoint) => req.url.startsWith(endpoint))) {
    next();
    return;
  }

  let query = req.query;

  if (!query.hasOwnProperty("userId") || !query.userId) {
    res.error.client.badRequest(
      "Auth",
      "No `userId` query param",
      "Request must have `userId` paramater with user id."
    );
    return;
  }

  let userId = query.userId as string;

  actions
    .exists(Number(userId))
    .then((exists: boolean) => {
      if (!exists) {
        res.error.client.notFound(
          "Client",
          "User not found",
          `User under id ${userId} was not found.`
        );
        return;
      }

      return actions.get(userId);
    })
    .then((value) => {
      if (!value) {
        res.error.server.generic(
          "Server",
          "User id undefined",
          `Couldn't fetch user ${userId} from MariaDB Server.`
        );
        return;
      }

      let user = value as actions.User;

      req.user = user;
      next();
    });
}
