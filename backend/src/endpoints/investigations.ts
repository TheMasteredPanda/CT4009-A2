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

router.post("/investigations", (req: Request, res: Response) => {
  let query = req.query;

  actions
    .getInvestigations(query)
    .then((ids) => res.status(200).send({ ids }))
    .catch((err) => handleInternalError(res, err));
});

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

    if (!query.hasOwnProperty("investigatorId")) {
      res.error.client.badRequest(
        "Client",
        "Parameter not found",
        `Query parameter 'investigatorId' was not found.`
      );
      return;
    }

    actions
      .addInvestigator(
        Number(query.investigationId),
        Number(query.investigatorId)
      )
      .then((id) => res.status(200).send({ id }))
      .catch((err) => handleInternalError(res, err));
  }
);

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

    actions
      .createComment(body.comment, req.user.id, Number(query.investigationId))
      .then((id) => res.status(200).send({ id }))
      .catch((err) => handleInternalError(res, err));
  }
);

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

router.post("/investigations/archive", (req: Request, res: Response) => {
  res.sendStatus(501);
});

export default router;
