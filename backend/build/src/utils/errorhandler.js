"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorResponser(req, res, next) {
    res.error = {
        error: (error) => {
            next(error);
        },
        client: {
            unauthorized: (type, title, detail = "No detail", data) => {
                next(new ClientUnauthorizedError(type, title, detail, data));
            },
            forbidden: (type, title, detail = "No detail", data) => {
                next(new ClientForbiddenError(type, title, detail, data));
            },
            notFound: (type, title, detail = "No detail", data) => {
                next(new ClientNotFoundError(type, title, detail, data));
            },
            methodNotAllowed: (type, title, detail = "No detail", data) => {
                next(new ClientMethodNotAllowedError(type, title, detail, data));
            },
            notAcceptable: (type, title, detail = "No detail", data) => {
                next(new ClientNotAcceptableError(type, title, detail, data));
            },
            badRequest: (type, title, detail = "No detail", data) => {
                next(new ClientBadRequestError(type, title, detail, data));
            },
        },
        server: {
            generic: (type, title, detail = "No detail", data) => {
                next(new ServerGenericError(type, title, detail, data));
            },
            notImplemented: (type, title, detail = "No detail", data) => {
                next(new ServerNotImplementedError(type, title, detail, data));
            },
        },
    };
    next();
}
exports.errorResponser = errorResponser;
function errorHandler(error, req, res, next) {
    if (error === undefined || error === null) {
        next();
        return;
    }
    res.set("Content-Type", "application/problem+json");
    if (error instanceof HttpError) {
        console.log(error);
        res.status(error.status).send(error.serialize());
    }
    else {
        res.sendStatus(500);
    }
}
exports.errorHandler = errorHandler;
class HttpError extends Error {
    constructor(status, type, title, detail = "No detail", data) {
        super(detail);
        this.status = status;
        this.type = type;
        this.title = title;
        this.name = "HttpError";
        this.data = data;
    }
    serialize() {
        let response = {
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
exports.HttpError = HttpError;
class ClientBadRequestError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(400, type, title, detail, data);
        this.name = "ClientBadRequestError";
    }
}
exports.ClientBadRequestError = ClientBadRequestError;
class ClientUnauthorizedError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(401, type, title, detail, data);
        this.name = "ClientUnauthorizedError";
    }
}
exports.ClientUnauthorizedError = ClientUnauthorizedError;
class ClientForbiddenError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(403, type, title, detail, data);
        this.name = "ClientForbiddenError";
    }
}
exports.ClientForbiddenError = ClientForbiddenError;
class ClientNotFoundError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(404, type, title, detail, data);
        this.name = "ClientNotFoundError";
    }
}
exports.ClientNotFoundError = ClientNotFoundError;
class ClientMethodNotAllowedError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(405, type, title, detail, data);
        this.name = "ClientMethodNotAllowedError";
    }
}
exports.ClientMethodNotAllowedError = ClientMethodNotAllowedError;
class ClientNotAcceptableError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(406, type, title, detail, data);
        this.name = "ClientNotAcceptableError";
    }
}
exports.ClientNotAcceptableError = ClientNotAcceptableError;
class ServerGenericError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(500, type, title, detail, data);
        this.name = "ServerGenericError";
    }
}
exports.ServerGenericError = ServerGenericError;
class ServerNotImplementedError extends HttpError {
    constructor(type, title, detail = "No detail", data = null) {
        super(501, type, title, detail, data);
        this.name = "ServerNotImplementedError";
    }
}
exports.ServerNotImplementedError = ServerNotImplementedError;
function handleInternalError(res, err) {
    if (err instanceof HttpError) {
        res.error.error(err);
    }
    else {
        throw err;
    }
}
exports.handleInternalError = handleInternalError;
