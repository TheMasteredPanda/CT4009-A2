import { Router, Request, Response } from "express";
import * as actions from "../actions/investigations";
import multer from "multer";
import path from "path";
import { handleInternalError } from "..//utils/errorhandler";

const router = Router();
const storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    cb(
      null,
      (Math.random() + 1).toString(36).substring(7) +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage }).any();

/**
 * @api {post} /invesigations/create          Create an investigation.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                            Creates an investigation from a report id and the
 *                                            user id of the officer launching the investigation.
 *                                            The officer will be the primary investigator of the
 *                                            investigation.
 *
 * @apiParam (Query Param) {string} reportId  The id of the report that will be investigated.
 *
 * @apiError {BadRequest} 400                 The query parameter 'reportId' was not found.
 *
 * @apiSuccess {Success} id                   The id of the newly created investigation.
 */
router.post("/investigations/create", (req: Request, res: Response) => {
  let query: any = req.query;

  if (!query.hasOwnProperty("reportId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'reportId' was not found.`
    );
    return;
  }

  actions
    .create(query.reportId, req.user.id)
    .then((id: any) => {
      res.status(200).send({ id });
    })
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /investigations                          Get an array of investigations.
 * @apiVersion 0.1.0
 * @apiGroup endpionts/investigations                   Get an array of investigations.
 *
 * @apiParam (Query Param) {string} reportAuthor        The username of the user who author the report
 *                                                      the investigation is on.
 *
 * @apiParam (Query Param) {bolean} open                A boolean that determines whether the investigation search
 *                                                      is inclusively open (true) or closed (false)
 *
 * @apiSuccess {Success} ids                            A set of investigation ids that fit the search parameters. Or
 *                                                      all investigation ids if no search params are given.
 */
router.post("/investigations", (req: Request, res: Response) => {
  let query = req.query;

  if (query.open) {
    query.open = Number(query.open) === 1 ? (true as any) : (false as any);
  }

  actions
    .getInvestigations(query)
    .then((ids) => res.status(200).send({ ids }))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {get} /investigations/investigation             Get investigation information.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiParam (Query Param) {string} invesigationId      An id of the investigation to get the
 *                                                      information for.
 *
 * @apiParam (Query Param) {string} reportId            The id of the report an open invesigation
 *                                                      may be launched upon. This id will be used
 *                                                      to get the investigation id and fetch the information
 *                                                      for that investigation.
 *
 * @apiError {BadRequest} 400                           The query parameter investigationId was not found.
 *
 * @apiSuccess {Success} investigation                  The investigation object.
 */
router.get("/investigations/investigation", (req: Request, res: Response) => {
  let query = req.query;

  if (query.hasOwnProperty("reportId")) {
    actions
      .getInvestigationIdByReport(Number(query.reportId))
      .then((investigationId) => {
        actions
          .getInvestigation(Number(investigationId))
          .then((investigation: any) => {
            res.status(200).send({ investigation });
          })
          .catch((err) => handleInternalError(res, err));
      });
  } else {
    if (!query.hasOwnProperty("investigationId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigationId' was not found.`
      );
      return;
    }

    actions
      .getInvestigation(Number(query.investigationId))
      .then((investigation: any) => {
        res.status(200).send({ investigation });
      })
      .catch((err) => handleInternalError(res, err));
  }
});

router.get(
  "/investigations/investigation/comments",
  (req: Request, res: Response) => {
    let query = req.query;

    if (!query.hasOwnProperty("investigationId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigationId' not found.`
      );
      return;
    }

    if (!query.hasOwnProperty("type")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'type' not found.`
      );
      return;
    }

    return actions
      .getInvestigationComments(
        Number(query.investigationId),
        query.type as string
      )
      .then((comments) => res.status(200).send({ comments }))
      .catch((err) => handleInternalError(res, err));
  }
);

/**
 * @api {post} /investigations/close                        Close an investigation.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                          Close an investigation.
 *
 * @apiParam (Query Param) {string} investigationId         The id of the investigation to close.
 *
 * @apiError {BadRequest} 400                               The query parameter 'investigationId' was
 *                                                          not found.
 *
 * @apiSuccess {Success} {void}                             A 200 status code.
 */
router.post("/investigations/close", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("investigationId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'investigationId' was not found.`
    );
    return;
  }

  actions
    .close(Number(query.investigationId))
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /investigations/investigators/add                    Add an investigator.
 * @apiVersion 0.1.0
 * @apiGroup endpionts/investigations
 *
 * @apiDescription                                                  Add an investigator to the investigation.
 *
 * @apiParam (Query Param) {string} investigationId                 An id of an investigation.
 * @apiParam (Query Param) {string} username                        The username of the user to add as an investigator.
 *
 * @apiError {BadRequest} 400                                       Either the query did not include parameters 'investigationId'
 *                                                                  and/or 'username'
 *
 * @apiSuccess {Success} id                                         The id of the newly created investigator entry.
 */
router.post(
  "/investigations/investigators/add",
  (req: Request, res: Response) => {
    let query = req.query;

    if (!query.hasOwnProperty("investigationId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigationId' was not found.`
      );
      return;
    }

    if (!query.hasOwnProperty("username")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'username' was not found.`
      );
      return;
    }

    actions
      .addInvestigator(Number(query.investigationId), query.username as string)
      .then((id: any) => res.status(200).send({ id }))
      .catch((err) => handleInternalError(res, err));
  }
);

/**
 * @api {post} /investigations/investigators/remove         Remove an investigator
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                          Remove an investigator from an investigation.
 *                                                          This will only work if there is more than one
 *                                                          investigator.
 *
 * @apiPraram (Query Param) {string} investigationId        The id of the investigation.
 *
 * @apiError {BadRequest} 400                               The query didn't include 'investigationId' or
 *                                                          'investigatorId'
 *
 * @apiSuccess {Success} {void}                               A 200 status code.
 */
router.post(
  "/investigations/investigators/remove",
  (req: Request, res: Response) => {
    let query = req.query;

    if (!query.hasOwnProperty("investigationId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigationId' was not found.`
      );
      return;
    }

    if (!query.hasOwnProperty("investigatorId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigatorId' was not found.`
      );
      return;
    }

    actions
      .removeInvestigator(
        Number(query.investigationId),
        Number(query.investigatorId)
      )
      .then(() => res.sendStatus(200))
      .catch((err) => handleInternalError(res, err));
  }
);

/**
 * @api {post} /investigations/comments/create                  Add investigation comment.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                              Add a comment to a investigation.
 *
 * @apiParam (Body Param) {string}  comment                     The content of the comment.
 * @apiParam (Query Param) {string} investigationId             The id of the investigation to add the comment to.
 *
 * @apiError {BadRequest} 400                                   Either the body didn't include 'comment' or the query
 *                                                              didn't include 'investigationId'.
 *
 * @apiSuccess {Succes} id                                      The id of the newly created comment.
 */
router.post(
  "/investigations/comments/create",
  (req: Request, res: Response) => {
    let query = req.query;
    let body = req.body;
    if (!body.hasOwnProperty("comment")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Body parameter 'comment' was not found.`
      );
      return;
    }

    if (!query.hasOwnProperty("investigationId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigationId' was not found.`
      );
      return;
    }

    if (!query.hasOwnProperty("type")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'type' not found.`
      );
      return;
    }

    let investigationId = Number(query.investigationId);
    actions
      .createComment(
        body.comment,
        req.user.id,
        investigationId,
        query.type as string
      )
      .then((id) => res.status(200).send({ id }))
      .catch((err) => handleInternalError(res, err));
  }
);

/**
 * @api {post} /investigations/comments/remove                    Remove a comment from an ivnestigation.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                                Remove a comment from an investigation.
 *
 * @apiParam (Query Param) {string} commentId                     The id of the comment to delete.
 *
 * @apiError {BadRequest} 400                                     The query did not include 'commentId'
 *
 * @apiSucces {Success} {void}                                    A 200 status code.
 */
router.post(
  "/investigations/comments/remove",
  (req: Request, res: Response) => {
    let query = req.query;

    if (!query.hasOwnProperty("commentId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'commentId' was not found.`
      );
      return;
    }

    actions
      .removeComment(Number(query.commentId))
      .then(() => res.sendStatus(200))
      .catch((err) => handleInternalError(res, err));
  }
);

/**
 * @api {post} /investigations/update/add                   Add an investigation update.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                          Add an investigation update.
 *
 * @apiParam (Query Param) {string} investigationId         The id of the investigation to add the update to.
 * @apiParam (Body Param) {string} content                  The update description.
 *
 * @apiError {BadRequest} 400                               Either the query didn't include 'investigationId' or
 *                                                          the body didn't include 'content'.
 *
 * @apiSuccess {Success} id                                 The id to the newly created update.
 */
router.post("/investigations/update/add", (req: Request, res: Response) => {
  let query = req.query;
  let body = req.body;

  if (!query.hasOwnProperty("investigationId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'investigationId' was not found`
    );
    return;
  }

  if (!body.hasOwnProperty("content")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'content' was not found.`
    );
    return;
  }

  actions
    .addUpdate(Number(query.investigationId), req.user.id, body.content)
    .then((id) => res.status(200).send({ id }))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /investigations/update/hide                   Hide an update.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                           Hide an update on an investigation.
 *
 * @apiParam (Query Param) {string} updateId                 The id of the update.
 *
 * @apiError {BadRequest} 400                               The query paramaters didn't include 'updateId'
 *
 * @apiSuccess {Success} {void}                             A 200 status code.
 */
router.post("/investigations/update/hide", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("updateId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'updateId' was not found.`
    );
    return;
  }

  actions
    .hideUpdate(Number(query.updateId))
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {post} /investigations/evidence/upload                    Upload evidenc to an update.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/investigations
 *
 * @apiDescription                                                Upload images as evidnece coressponding to evidence.
 *
 * @apiParam (Query Param) {string} updateId                      The id of the update entry the evidence coressponds to.
 * @apiParam (Body Param) multipart/form                          The images formatted in multipart/form
 *
 * @apiError {BadRequest} 400                                     The query parameters did not include 'updateId'.
 *
 * @apiSuccess {Success} ids                                      An array of ids coressponding to investigation image entries.
 */
router.post(
  "/investigations/evidence/upload",
  (req: Request, res: Response) => {
    let query = req.query;

    if (!query.hasOwnProperty("updateId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'updateId' was not found.`
      );
      return;
    }

    let updateId = Number(query.updateId);
    console.log(updateId);
    upload(req, res, (err) => {
      if (err) throw err;

      let promises: Promise<any>[] = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = (req.files as any)[i];
        promises.push(actions.addImage(updateId, file.path));
      }

      Promise.all(promises)
        .then((models) => {
          let result: any[] = [];

          for (let i = 0; i < models.length; i++) {
            const model: any = models[i];
            result.push(model);
          }

          res.status(200).send(result);
        })
        .catch((err) => handleInternalError(res, err));
    });
  }
);

export default router;
