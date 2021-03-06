import Bikes from "../schemas/Bikes.schema";
import BikeImages from "../schemas/BikeImages.schema";
import RegistryImages from "../schemas/RegistryImages.schema";
import { Model } from "sequelize/types";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import * as fs from "fs";
import { ClientNotFoundError } from "../utils/errorhandler";

/**
 * A suite of functions managing the storing of bike information and images.
 */

/**
 * Bike types enums.
 */
export enum BikeType {
  ROAD = "road",
  MOUNTAIN = "mountain",
  HYBRID_OR_COMMUTER = "hybrid_or_commuter",
  CYCLOCROSS = "cyclocross",
  FOLDING = "folding",
  ELECTRIC = "electric",
  TOURING = "touring",
  WOMENS = "womens",
}

/**
 * Brake types enums.
 */
export enum BrakeType {
  SPOON = "spoon",
  DUCK = "duck",
  RIM = "rim",
  DISC = "disc",
  DRUM = "drum",
  COASTER = "coaster",
  DRAG = "drag",
  BAND = "band",
  MECHANICAL = "mechanical",
  HYDRAULIC = "hydraulic",
  HYBRID = "hybrid",
  VBRAKE = "v-brake",
  CANTILEVER = "cantilever",
}

/**
 * Suspension types enum.
 */
export enum SuspensionType {
  FRONT = "front",
  REAR = "rear",
  SEATPOST = "seatpost",
  SADDLE = "saddle",
  STEM = "stem",
  HUB = "hub",
  NONE = "none",
}

/**
 * The gender the bike was designed for.
 */
export enum BikeGender {
  WOMENS = "womens",
  MENS = "mens",
  BOYS = "boys",
  GIRLS = "girls",
  UNISEX = "unisex",
}

/**
 * The age the bike was made for.
 */
export enum AgeGroup {
  TODDLER = "toddler",
  CHILDREN = "children",
  ADULT = "adult",
}

interface RegisterBikeOptions {
  userId: number;
  partNumber: string;
  brand: string;
  modal: string;
  type: BikeType;
  wheelSize: number;
  colours: string[];
  gearCount: number;
  brakeType: BrakeType;
  suspension: SuspensionType;
  gender: BikeGender;
  ageGroup: AgeGroup;
}

interface UpdateBikeOptions {
  partNumber?: string;
  brand?: string;
  model?: string;
  type?: BikeType;
  wheelSize?: number;
  colours?: string[] | string;
  gearCount?: number;
  brakeType?: BrakeType;
  suspension?: SuspensionType;
  gender?: BikeGender;
  ageGroup?: AgeGroup;
}

if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

/**
 * Registers a bike.
 *
 * @param param0 - The parameters of required to register a bike.
 *
 * @returns {string} the id of most recently stored bike.
 */
export async function register({
  userId,
  brand,
  wheelSize,
  gearCount,
  type = BikeType.HYBRID_OR_COMMUTER,
  partNumber = "N/A",
  modal = "N/A",
  colours = [],
  brakeType = BrakeType.VBRAKE,
  suspension = SuspensionType.NONE,
  gender = BikeGender.UNISEX,
  ageGroup = AgeGroup.ADULT,
}: RegisterBikeOptions): Promise<string> {
  let csvColours = colours.join(", ");
  let bike: any = await Bikes.create({
    user_id: userId,
    part_number: partNumber,
    brand,
    modal,
    type,
    wheel_size: wheelSize,
    colours: csvColours,
    gear_count: gearCount,
    brake_type: brakeType,
    suspension,
    gender,
    age_group: ageGroup,
  });

  return bike.id;
}

/**
 * Stores the url of an image for a registered bike entry in the relevent database.
 *
 * @param {string} bikeId - The id of the bike.
 * @param {string} url - The url of the image.
 *
 * @returns {object} the most recently inserted image.
 */
export async function addImage(bikeId: number, url: string) {
  let model: any = await BikeImages.create({ uri: url });
  let image: any = await RegistryImages.create({
    bike_id: bikeId,
    image_id: model.toJSON().id,
  });
  return image.toJSON();
}

/**
 * Deletes a registered bike image.
 *
 * @param {string} imageId - The id of the image.
 */
export async function removeImage(imageId: number) {
  let model = await RegistryImages.findOne({ where: { image_id: imageId } });

  if (!model)
    new ClientNotFoundError(
      "Client",
      `Couldn't find resgistry image ${imageId}.`
    );

  await RegistryImages.destroy({ where: { image_id: imageId } });
  await BikeImages.destroy({ where: { id: imageId } });
}

/**
 * Removes a registered bike entry.
 *
 * @param {string} bikeId - The id of the bike to unregister.
 */
export async function unregister(bikeId: string) {
  await Bikes.destroy({ where: { id: bikeId } });
}

/**
 * Get a registered bike.
 *
 * @param {string} bikeId - The id of the bike.
 *
 * @returns {object} all information on the registered bike and it's images.
 */
export async function getRegisteredBike(bikeId: string) {
  let bike: Model | null;

  try {
    bike = await Bikes.findOne({ where: { id: bikeId } });
  } catch (err) {
    throw err;
  }

  if (!bike) throw new Error(`Couldn't find bike ${bikeId}`);

  let imageIds = [];
  let images = [];

  try {
    let result: Model<any, any>[] = await RegistryImages.findAll({
      where: { bike_id: bikeId },
    });

    for (let i = 0; i < result.length; i++) {
      const entry = result[i];
      let data = entry.toJSON();
      imageIds.push(data);
    }

    if (imageIds.length > 0) {
      for (let i = 0; i < imageIds.length; i++) {
        const entry: any = imageIds[i];
        let result: Model<any, any> | null = await BikeImages.findOne({
          where: { id: entry.image_id },
        });
        if (!result) continue;
        let data = result.toJSON();
        images.push(data);
      }
    }
  } catch (err) {
    throw err;
  }

  let data: any = bike.toJSON();
  data.images = images;

  return data;
}

/**
 * Get all registered bike ids under a user.
 *
 * @param {string} userId - The owner of the bike.
 *
 * @returns {string[]} an array of bike ids.
 */
export async function getAllRegisteredBikes(userId: number) {
  let bikes: Model[] | null;

  try {
    bikes = await Bikes.findAll({ where: { user_id: userId } });
  } catch (err) {
    throw err;
  }

  if (!bikes) throw new Error(`User ${userId} doesn't have any bikes.`);

  let bikeIds = [];

  for (let i = 0; i < bikes.length; i++) {
    const bike = bikes[i];
    let data: any = bike.toJSON();
    bikeIds.push(data.id);
  }

  return bikeIds;
}

/**
 * Updates a registered bike entry.
 *
 * @param {string} bikeId - The id of the bike.
 * @param {object} data - The data to update to the registered bike entry.
 */
export async function updateRegisteredBike(
  bikeId: number,
  data: UpdateBikeOptions
) {
  let bike: Model | null;
  let colourString;

  if (data.hasOwnProperty("colours") && typeof data.colours === "object") {
    colourString = data.colours?.join(", ");

    delete data.colours;
    data.colours = colourString;
  }

  try {
    bike = await Bikes.findOne({ where: { id: bikeId } });
  } catch (err) {
    throw err;
  }

  if (!bike) throw new Error(`Couldn't find ${bikeId}.`);

  await Bikes.update(data, { where: { id: bikeId } });
  let result = await Bikes.findOne({ where: { id: bikeId } });
  return result?.toJSON();
}
