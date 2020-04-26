import Bikes from "../schemas/Bikes.schema";
import BikeImages from "../schemas/BikeImages.schema";
import RegistryImages from "../schemas/RegistryImages.schema";
import { Model } from "sequelize/types";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import * as fs from "fs";

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
  model: string;
  type: BikeType;
  wheelSize: number;
  colours: string;
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
  colours?: string;
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
  model = "N/A",
  colours = "[]",
  brakeType = BrakeType.VBRAKE,
  suspension = SuspensionType.NONE,
  gender = BikeGender.UNISEX,
  ageGroup = AgeGroup.ADULT,
}: RegisterBikeOptions): Promise<string> {
  let bike: any = await Bikes.create({
    user_id: userId,
    part_number: partNumber,
    brand,
    model,
    type,
    wheel_size: wheelSize,
    colours,
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
 * @param bikeId - The id of the bike.
 * @param url - The url of the image.
 *
 * @returns {object} the most recently inserted image.
 */
export async function addImage(bikeId: string, url: string) {
  let model: any = await BikeImages.create({ uri: url });
  let image: any = await RegistryImages.create({
    bike_id: bikeId,
    image_id: model.toJSON().id,
  });
  return image.toJSON();
}

export async function removeImage(imageId: string) {
  await BikeImages.destroy({ where: { id: imageId } });
}

/**
 * Removes a registered bike entry.
 *
 * @param bikeId - The id of the bike to unregister.
 */
export async function unregister(bikeId: string) {
  await Bikes.destroy({ where: { id: bikeId } });
}

/**
 * Get a registered bike.
 *
 * @param bikeId - The id of the bike.
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

  let data = bike.toJSON();

  return data;
}

/**
 * Get all registered bike ids under a user.
 *
 * @param userId - The owner of the bike.
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
 * @param bikeId - The id of the bike.
 * @param data - The data to update to the registered bike entry.
 */
export async function updateRegisteredBike(
  bikeId: string,
  data: UpdateBikeOptions
) {
  let bike: Model | null;

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
