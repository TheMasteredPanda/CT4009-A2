import { Router, Request, Response } from "express";
import * as actions from "../actions/reports";
import {
  handleInternalError,
  ClientBadRequestError,
} from "../utils/errorhandler";

const router = Router();

/**
 * @api {post} /reports/create                Create a report.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/reports
 *
 * @apiDescription                            Create a report. This is a report on a
 *                                            registered bike stolen.
 *
 * @apiParam (Query Param) {string} bikeId    The id of the bike stolen.
 * @apiParam (Query Param) {string} content   The report description.
 * @apiParam (Query Param) {string} placeId   The google maps place id of the location of the theft.
 *
 * @apiError {BadRequest} 400                 Either the query didn't include 'bikeId' or
 *                                            the body didn't include 'content' and/or
 *                                            'placeId'
 *
 * @apiSuccess {Success} id                    The id of the newly created report.
 */
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

  if (!body.hasOwnProperty("placeId")) {
    res.error.client.badRequest(
      "Client",
      "Body parameter not found",
      `Body parameter 'placeId' was not found.`
    );
    return;
  }

  actions
    .create(
      req.user.id,
      Number(query.bikeId),
      body.placeId as string,
      body.content
    )
    .then((id) => res.status(200).send({ id }))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /reports                                 Get an array of reports.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/reports
 *
 * @apiDescription                                      Get an array of reports. If there are no search
 *                                                      parameters all reports will be fetched.
 *
 * @apiParam (Query Param) {string | number} author     Either the username or id of the user who
 *                                                      authored the report.
 * @apiParam (Query Param) {number} open                Whether to fetch open (1) or closed (0) reports.
 * @apiParam (Query Param) {number} startDate           Fetch all reports from that day onwards.
 * @apiParam (Query Param) {number} endDate             Fetch all reports closed from that day backwards.
 * @apiParam (Query Param) {number} bikeId              Fetch one or more bikes.
 */
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
    req.query.open =
      Number(req.query.open) === 1 ? (true as any) : (false as any);
  }

  actions
    .getReportIds(req.query)
    .then((ids) => {
      res.status(200).send({ ids });
    })
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {get} /reports/report                  Get a report.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/reports
 *
 * @apiDescription                              Get all information on a report. If a
 *                                              bikeId is supplied it will find the first
 *                                              open report of the bike if available, other
 *                                              -wise null.
 *
 * @apiParam (Query Param) {number} reportId    The id of the report to fetch.
 * @apiParam (Query Param) {number} bikeId      The bike id of a report to fetch.
 */
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

/**
 * @api {post} /reports/comments/create               Create a report comment.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/reports
 *
 * @apiDescription                                    Create a report comment.
 *
 * @apiParam (Query Param) {number} reportId          The id of the report the comment
 *                                                    belongs to.
 * @apiParam (Query Param) {string} type              The type of comment this comment is (
 *                                                    either 'civilian' or 'police')
 * @apiParam (Body Param) {string} comment            The content of the comment.
 *
 * @apiError {BadRequest} 400                         Either the query parameters do not include
 *                                                    'type' and/or 'reportId' or the body
 *                                                    does not include 'comment'.
 *
 * @apiSuccess {Success} id                           The id of the newly created comment.
 */
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

/**
 * @api {get} /reports/comments                   Fetch report comments.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/reports
 *
 * @apiDescription                                Fetch an array of comments of a particular
 *                                                type ('police' or 'civilian')
 *
 * @apiParam (Query Param) {number} reportId      The id of the report the comments belong to.
 * @apiParam (Query Param) {string} type          The type of comments to fetch
 *
 * @apiError {BadRequest} 400                     The query parameters did not include 'reportId'
 *                                                or 'type'.
 *
 * @apiSuccess {Success} comments                 A list of comments fetched.
 */
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

/**
 * @api {post} /reports/close                   Close a report.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/reports
 *
 * @apiDescription                              Close a report.
 *
 * @apiParam (Query Param) {string} reportId    The id of the report to close.
 *
 * @apiError {BadRequest} 400                   The query parameters did not include 'reportId'
 *
 * @apiSuccess {Success} {void}                    A 200 status code.
 */
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
