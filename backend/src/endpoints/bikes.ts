import * as actions from "../actions/bikes";
import * as adminActions from "../actions/admin";
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

/**
 * @api {post} /bike/register         Register a bike.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bike
 * @apiDescription                    Register a bike on the system.
 *
 * @apiParam (Body Param) {string} brand       The brand of the bike.
 * @apiParam (Body Param) {number} wheelSize   The diameter of the bike wheels.
 * @apiParam (Body Param) {number} partNumber  The part number of the bike.
 * @apiParam (Body Param) {string} modal       The modal of the bike.
 * @apiParam (Body Param) {string} type        The type of bike.
 * @apiParam (Body Param) {string[]} colours     An array of colours the bike is primarily in.
 * @apiParam (Body Param) {string} brakeType   The brake type of the bike.
 * @apiParam (Body Param) {string} suspension  The suspension type of the bike.
 * @apiParam (Body Param) {string} gender      The bike's gender (who the bike was made for)
 * @apiParam (Body Param) {string} ageGroup    The age group of the bike.
 * @apiParam (Body Param) {number} user_id     The user who registered the bike.
 *
 * @apiParamExample Example:
 *      {
 *        "brand": "Test Brand" ,
 *        "wheelSize": 23,
 *        "partNumber": "4ed54sa",
 *        "modal": "Test Modal",
 *        "type": "Test Type",
 *        "colours": "['grey', 'blue', 'green']"
 *        "brakeType": "type",
 *        "suspension": "testSuspension",
 *        "gender": "male",
 *        "ageGroup": "toddler",
 *        "userId": 2
 *      }
 *
 * @apiError {BadRequest} 400                  Either the brand, wheelSize, gearCount was not found in the body.
 *
 * @apiSuccess {Success} id                    The newly created id for the bike entry.
 */
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

/**
 * @api {post} /bike/images/upload          Upload an image to a registered bike entry.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bikes
 *
 * @apiDescription                          Upload an image for a registered bike entry.
 *
 * @apiParam (Query Param) bikeId           The id of the bike the image belongs to.
 * @apiParam (Body Param) multpart/form     The images, in multipart/form types.
 *
 * @apiError {BadRequest} 400               The bikeId was not found in the query.
 *
 * @apiSuccess {Success} ids                The ids of the images uploaded.
 */
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

/**
 * @api {post} /bike/images/delete          Delete bike images.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bikes
 *
 * @apiDescription                          Delete registered bike images.
 *
 * @apiParam (Body Param) imageIds          A list of image ids. These ids correspond to
 *                                          the images that will be deleted.
 *
 * @apiError {BadRequest} imageIds          The ids of images.
 *
 * @apiSuccess {Success} {void}             A 200 status code.
 */
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

/**
 * @api {get} /bike/bikes         Get an array of bikes.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bikes      An array of bikes.
 *
 * @apiDescription                Get an array of bike ids owned by the user.
 *
 * @apiSuccess {Success} bikeIds  The ids of bikes.
 */
router.get("/bike/bikes", (req: Request, res: Response) => {
  let query = req.query;
  let accountId;

  if (query.hasOwnProperty("accountId")) {
    if (req.user.rank !== "police_admin") {
      res.error.client.unauthorized(
        "Auth",
        "Access denied.",
        `You do not have access to use this endpoint in this way.`
      );
      return;
    }
    accountId = query.accountId;
  } else {
    accountId = req.user.id;
  }

  actions
    .getAllRegisteredBikes(accountId)
    .then((bikeIds) => res.status(200).send(bikeIds))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {get} /bike/bikes/all         Get all bikes.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bikes
 *
 * @apiDescripition                   Get a list of all bike ids.
 *
 * @apiError {Unauthorized} 401       If a civilian attempts to use this endpoint they will be denied.
 *
 * @apiSuccess {Success} bikeIds      An array of bike ids.
 */
router.get("/bike/bikes/all", (req: Request, res: Response) => {
  if (req.user.rank === "civilian") {
    res.error.client.unauthorized(
      "Auth",
      "Access denied.",
      `You do not have access to this endpoint.`
    );
    return;
  }

  adminActions
    .getAllRegisteredBikes()
    .then((bikeIds) => res.status(200).send(bikeIds))
    .catch((err) => handleInternalError(res, err));
});

/**
 * @api {get} /bike         Get bike information
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bike
 *
 * @apiDescription          Get a bikes information, including images.
 *
 * @apiError {BadRequest} 400 The bikeId query was not found.
 *
 * @apiSuccess {Success} bike A bike object.
 */
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

/**
 * @api {post} /bike/unregister         Unregister a bike.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bike
 *
 * @apiDescription                      Deletes a bike from the database.
 *
 * @apiParam (Body Param) bikeId        The id of the bike to delete.
 *
 * @apiError {BadRequest} 400           The bike id was not found in the query.
 *
 * @apiSuccess {Success} {void}         A 200 status code.
 */
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

/**
 * @api {post} /bike/update           Update a bike entry.
 * @apiVersion 0.1.0
 * @apiGroup endpoints/bike
 *
 * @apiDescription                    Updates a bike entry with the data in the body.
 *
 * @apiParam (Query Param) bikeId      The id of the bike to update.
 * @apiParam (Body Param) {string} brand       The brand of the bike.
 * @apiParam (Body Param) {number} wheelSize   The diameter of the bike wheels.
 * @apiParam (Body Param) {number} partNumber  The part number of the bike.
 * @apiParam (Body Param) {string} modal       The modal of the bike.
 * @apiParam (Body Param) {string} type        The type of bike.
 * @apiParam (Body Param) {string[]} colours     An array of colours the bike is primarily in.
 * @apiParam (Body Param) {string} brakeType   The brake type of the bike.
 * @apiParam (Body Param) {string} suspension  The suspension type of the bike.
 * @apiParam (Body Param) {string} gender      The bike's gender (who the bike was made for)
 * @apiParam (Body Param) {string} ageGroup    The age group of the bike.
 * @apiParam (Body Param) {number} user_id     The user who registered the bike.
 *
 * @apiParamExample Example:
 *      {
 *        "brand": "Test Brand" ,
 *        "wheelSize": 23,
 *        "partNumber": "4ed54sa",
 *        "modal": "Test Modal",
 *        "type": "Test Type",
 *        "colours": "['grey', 'blue', 'green']"
 *        "brakeType": "type",
 *        "suspension": "testSuspension",
 *        "gender": "male",
 *        "ageGroup": "toddler",
 *      }
 *
 */
router.post("/bike/update", (req: Request, res: Response) => {
  let query = req.query;
  let body = req.body;
  console.log(body);

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
    .updateRegisteredBike(Number(query.bikeId), body)
    .then((updatedBike) => res.status(200).send(updatedBike));
});

export default router;
