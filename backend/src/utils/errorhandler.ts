import { Request, Response } from "express";
/**
 * Adds the errorhandler utilitiy to the response object before the request
 * is routed to the targeted endpoint.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The callback function.
 */
export function errorResponser(req: any, res: any, next: any) {
  res.error = {
    error: (error: HttpError) => {
      next(error);
    },
    client: {
      unauthorized: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ClientUnauthorizedError(type, title, detail, data));
      },
      forbidden: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ClientForbiddenError(type, title, detail, data));
      },
      notFound: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ClientNotFoundError(type, title, detail, data));
      },
      methodNotAllowed: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ClientMethodNotAllowedError(type, title, detail, data));
      },
      notAcceptable: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ClientNotAcceptableError(type, title, detail, data));
      },
      badRequest: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ClientBadRequestError(type, title, detail, data));
      },
    },
    server: {
      generic: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ServerGenericError(type, title, detail, data));
      },
      notImplemented: (
        type: string,
        title: string,
        detail: string = "No detail",
        data: any
      ) => {
        next(new ServerNotImplementedError(type, title, detail, data));
      },
    },
  };

  next();
}

/**
 * Handles any errors created by the utilitiy.
 *
 * @param {Error} error - An error.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object
 * @param {Fuction} next - The callback function.
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: Function
) {
  if (error === undefined || error === null) {
    next();
    return;
  }
  res.set("Content-Type", "application/problem+json");
  if (error instanceof HttpError) {
    console.log(error);
    res.status(error.status).send(error.serialize());
  } else {
    res.sendStatus(500);
  }
}

/**
 * A typescript interface extending the express request class, including the error
 * responder utility added in the middleware above.
 */
declare global {
  namespace Express {
    interface Request {
      user: any;
    }

    interface Response {
      error: {
        error(error: HttpError): void;
        client: {
          unauthorized(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
          forbidden(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
          notFound(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
          methodNotAllowed(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
          notAcceptable(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
          badRequest(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
        };
        server: {
          generic(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
          notImplemented(
            type: string,
            title: string,
            detail?: string,
            data?: any
          ): void;
        };
      };
    }
  }
}

export class HttpError extends Error {
  status: number;
  type: string;
  title: string;
  data: any;
  constructor(
    status: number,
    type: string,
    title: string,
    detail: string = "No detail",
    data: any | null
  ) {
    super(detail);
    this.status = status;
    this.type = type;
    this.title = title;
    this.name = "HttpError";
    this.data = data;
  }

  serialize() {
    let response: any = {
      status: this.status,
      type: this.type,
      title: this.title,
      data: this.data ? JSON.stringify(this.data) : "",
    };

    if (this.message != "No detail") {
      response.detail = this.message;
    }

    return response;
  }
}

export class ClientBadRequestError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(400, type, title, detail, data);
    this.name = "ClientBadRequestError";
  }
}
export class ClientUnauthorizedError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(401, type, title, detail, data);
    this.name = "ClientUnauthorizedError";
  }
}

export class ClientForbiddenError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(403, type, title, detail, data);
    this.name = "ClientForbiddenError";
  }
}

export class ClientNotFoundError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(404, type, title, detail, data);
    this.name = "ClientNotFoundError";
  }
}

export class ClientMethodNotAllowedError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(405, type, title, detail, data);
    this.name = "ClientMethodNotAllowedError";
  }
}

export class ClientNotAcceptableError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(406, type, title, detail, data);
    this.name = "ClientNotAcceptableError";
  }
}

export class ServerGenericError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(500, type, title, detail, data);
    this.name = "ServerGenericError";
  }
}

export class ServerNotImplementedError extends HttpError {
  constructor(
    type: string,
    title: string,
    detail = "No detail",
    data: any | null = null
  ) {
    super(501, type, title, detail, data);
    this.name = "ServerNotImplementedError";
  }
}

export function handleInternalError(res: Response, err: Error) {
  if (err instanceof HttpError) {
    res.error.error(err);
  } else {
    throw err;
  }
}
