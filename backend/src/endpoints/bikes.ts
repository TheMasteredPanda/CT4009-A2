import * as actions from "../actions/bikes";
import { Router, Request, Response } from "express";
import { handleInternalError } from "../utils/errorhandler";

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

  if (!body.hasOwnProperty("wheel_size")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not fouond",
      `Body parameter 'wheel_size' not found.`
    );
    return;
  }

  if (!body.hasOwnProperty("gear_count")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'gear_count' not found.`
    );
    return;
  }

  if (!body.hasOwnProperty("images")) {
    res.error.client.badRequest(
      "Client",
      "Parameter not found",
      `Body parameter 'images' not found.`
    );
    return;
  }

  actions
    .register(body)
    .then((id) => res.status(200).send(id))
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
    .then((bike) => res.status(200).send(bike))
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
