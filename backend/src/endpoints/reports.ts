import { Router, Request, Response } from "express";
import * as actions from "../actions/reports";
import {
  handleInternalError,
  ClientBadRequestError,
} from "../utils/errorhandler";

const router = Router();

router.post("/reports/create", (req: Request, res: Response) => {
  let body = req.body;
  let query = req.query;

  if (!query.hasOwnProperty("bikeId")) {
    res.error.client.badRequest(
      "Client",
      "Query parameter not found.",
      `Query parameter 'bikeId' was not found.`
    );
    return;
  }

  if (!body.hasOwnProperty("content")) {
    res.error.client.badRequest(
      "Client",
      "Body parameter not found.",
      `Body parameter 'content' was not found.`
    );
    return;
  }

  actions
    .create(req.user.id, Number(query.bikeId), body.content)
    .then((id) => res.status(200).send({ id }))
    .catch((err) => handleInternalError(res, err));
});

router.post("/reports", (req: Request, res: Response) => {
  let author: string | number;

  if (req.query.author) {
    author = Number(req.query.author);

    if (isNaN(author)) {
      author = req.query.author as string;
    }

    req.query.author = author as any;
  }

  if (req.query.open) {
    req.query.open = Number(req.query.open) === 1 ? true as any : false as any;
  }


  actions
    .getReportIds(req.query)
    .then((ids) => {
      console.log(ids);
      res.status(200).send({ ids });
    })
    .catch((err) => handleInternalError(res, err));
});

router.get("/reports/report", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.reportId && !query.bikeId) {
    throw new ClientBadRequestError(
      "Client",
      "Query parameter not found",
      `Query parameter 'reportId' and 'bikeId' was not found.`
    );
  }

  let reportId = 0;
  let bikeId = 0;

  if (query.reportId) {
    reportId = Number(query.reportId);
  } else {
    bikeId = Number(query.bikeId);
  }
  actions
    .getReport(reportId, bikeId)
    .then((report) => {
      res.status(200).send({ report });
    })
    .catch((err) => handleInternalError(res, err));
});

router.post("/reports/comments/create", (req: Request, res: Response) => {
  let query = req.query;
  let body = req.body;

  if (!query.reportId) {
    res.error.client.badRequest(
      "Client",
      "Query parameter not found",
      `Query parameter 'reportId' was not found.`
    );
    return;
  }

  if (!query.type) {
    res.error.client.badRequest(
      "Client",
      "Query parameter not found",
      `Query parameter 'type' was not found.`
    );
    return;
  }

  if (!body.comment) {
    res.error.client.badRequest(
      "Client",
      "Body parameter was not found",
      `Body parameter 'comment' was not found.`
    );
    return;
  }

  actions
    .createComment(
      Number(query.reportId),
      body.comment,
      Number(req.user.id),
      query.type as actions.CommentType
    )
    .then((id) => res.status(200).send({ id }))
    .catch((err) => handleInternalError(res, err));
});

router.get("/reports/comments", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.reportId) {
    res.error.client.badRequest(
      "Client",
      "Query parameter not found",
      `Query parameter 'reportId' was not found.`
    );
    return;
  }

  if (!query.type) {
    res.error.client.badRequest(
      "Client",
      "Query paramter not found",
      `Query parameter 'type' was not found.`
    );
    return;
  }

  actions
    .getComments(Number(query.reportId), query.type as actions.CommentType)
    .then((comments) => res.status(200).send({ comments }))
    .catch((err) => handleInternalError(res, err));
});

router.post("/reports/close", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.reportId) {
    res.error.client.badRequest(
      "Client",
      "Query parameter not found",
      `Query parameter 'reportId' was not found.`
    );
    return;
  }

  actions
    .closeReport(Number(query.reportId))
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

export default router;
