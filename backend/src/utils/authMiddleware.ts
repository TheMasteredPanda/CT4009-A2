import { Request, Response } from "express";
import * as authManager from "../managers/authManager";

const dmz = [
  "/user/register",
  "/user/login",
  "/user/verify",
  "/images",
]; /*Demilitarized endpoints, used to stop requests to these endpoints 
  from being processed through the middleware below.*/
const authDmz = ["/user/refresh"]; //Demilitarized endpoints for the authentication middleware only.

/**
 * Middleware used to authorize users before accessing the endpoint requested.
 * This is to ensure that no unauthorized access to endpoints, save for the dmzed
 * endpoints, are made.
 */
export default function (req: Request, res: Response, next: Function) {
  if (
    dmz.some((endpoint) => req.url.startsWith(endpoint)) ||
    authDmz.some((endpoint) => req.url.startsWith(endpoint))
  ) {
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
    res.error.client.badRequest(
      "Auth",
      "Invalid Authorization Value",
      `The Authorization header was found, but the value is ${value}`
    );
    return;
  }

  if (!value.startsWith("Bearer")) {
    res.error.client.badRequest(
      "Auth",
      "Missing Bearer Prefix",
      "Authorization value is missing `Bearer` prefix."
    );
    return;
  }

  if (value.split(" ").length !== 2) {
    res.error.client.badRequest(
      "Auth",
      "Incorrectly Formatted Authorization Value",
      "Authorization value must be formatted as `Bearer: <jwt>`."
    );
    return;
  }

  let jwt = value.split(" ")[1];

  if (!authManager.hasHandler(req.user.id)) {
    res.error.client.unauthorized(
      "Auth",
      "User unknown",
      `There is no auth handler for user ${req.user.id}, who are you?`
    );
    return;
  }

  let handler: authManager.AuthHandler = authManager.get(req.user.id);

  handler.verify(jwt).then((verfied: any) => {
    if (!verfied) {
      res.error.client.unauthorized(
        "Auth",
        "Verification failure",
        `The JWT given could not be vertified with the auth handler for ${req.user.id}`
      );
      return;
    }

    next();
  });
}
