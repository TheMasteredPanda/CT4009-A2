import * as actions from "../actions/bikes";
import { Router, Request, Response } from "express";
import { handleInternalError } from "../utils/errorhandler";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) =>
    cb(
      null,
      (Math.random() + 1).toString(36).substring(7) +
        Date.now() +
        path.extname(file.originalname)
    ),
});

const upload = multer({ storage: storage }).any();

const router = Router();

router.post("/bike/register", (req: Request, res: Response) => {
  let body = req.body;
  if (!body.hasOwnProperty("brand")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'brand' not found.`
    );
    return;
  }

  if (!body.hasOwnProperty("wheelSize")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not fouond",
      `Body parameter 'wheel_size' not found.`
    );
    return;
  }

  if (!body.hasOwnProperty("gearCount")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'gear_count' not found.`
    );
    return;
  }

  body.userId = req.user.id;
  actions
    .register(body)
    .then((id) => {
      res.status(200).send({ id });
    })
    .catch((err) => handleInternalError(res, err));
});

router.post("/bike/images/upload", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("bikeId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'bikeId' was not found.`
    );
    return;
  }

  let promises: Promise<any>[] = [];

  upload(req, res, (err) => {
    if (err) throw err;

    for (let i = 0; i < req.files.length; i++) {
      const file = (req.files as any[])[i];
      promises.push(actions.addImage(Number(query.bikeId), file.path));
    }

    Promise.all(promises)
      .then((models) => {
        let result: any[] = [];

        for (let j = 0; j < models.length; j++) {
          const model: any = models[j];
          result.push(model);
        }

        res.status(200).send(result);
      })
      .catch((err) => handleInternalError(res, err));
  });
});

router.post("/bike/images/delete", (req: Request, res: Response) => {
  let body = req.body;

  if (!body.hasOwnProperty("imageIds")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found.",
      `Body parameter 'imageIds' was not found.`
    );
    return;
  }

  let promises: Promise<any>[] = [];

  for (let i = 0; i < body.imageIds.length; i++) {
    const imageId = body.imageIds[i];
    promises.push(actions.removeImage(Number(imageId)));
  }

  Promise.all(promises)
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

router.get("/bike/bikes", (req: Request, res: Response) => {
  actions
    .getAllRegisteredBikes(req.user.id)
    .then((bikeIds) => res.status(200).send(bikeIds))
    .catch((err) => handleInternalError(res, err));
});

router.get("/bike", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("bikeId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parameter 'bikeId' was not found.`
    );
    return;
  }

  actions
    .getRegisteredBike(query.bikeId as string)
    .then((bike) => {
      res.status(200).send(bike);
    })
    .catch((err) => handleInternalError(res, err));
});

router.post("/bike/unregister", (req: Request, res: Response) => {
  let query = req.query;

  if (!query.hasOwnProperty("bikeId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parmaeter 'bikeId' was not found.`
    );
    return;
  }

  actions
    .unregister(query.bikeId as string)
    .then(() => res.sendStatus(200))
    .catch((err) => handleInternalError(res, err));
});

router.post("/bike/update", (req: Request, res: Response) => {
  let query = req.query;
  let body = req.body;

  if (!query.hasOwnProperty("bikeId")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Query parmeter 'bikeId' was not found.`
    );
    return;
  }

  if (!body) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Can't update a registered bike with no body.`
    );
    return;
  }

  actions
    .updateRegisteredBike(query.bikeId as string, body)
    .then((updatedBike) => res.status(200).send(updatedBike));
});

export default router;
