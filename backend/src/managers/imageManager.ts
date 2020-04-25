import * as fs from "fs";
import crypto from "crypto";

/**
 * A manager for managing the storing of images for registered bikes, investigations, and reports.
 */

export enum Directory {
  REGISTRY = 1,
  INVESTIGATIONS = 2,
  REPORTS = 3,
}

if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

if (!fs.existsSync("images/registry")) {
  fs.mkdirSync("images/registry");
}

if (!fs.existsSync("images/investigations")) {
  fs.mkdirSync("images/investigations");
}

if (!fs.existsSync("images/reports")) {
  fs.mkdirSync("images/reports");
}

/**
 * Writes an array of images for a bikey entry into a specific directory for that bike.
 *
 * @param bikeId - The id of the bike.
 * @param images - An array of images in it's raw form.
 */
export async function addBikeImages(
  bikeId: string,
  directory: Directory,
  images: string[]
) {
  let dir =
    directory === Directory.REGISTRY
      ? `images/registry/${bikeId}`
      : directory === Directory.INVESTIGATIONS
      ? `images/investigations/${bikeId}`
      : `images/reports/${bikeId}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let currentImages: string[];

  try {
    currentImages = await new Promise((resolve, reject) =>
      fs.readdir(dir, (err, files) => {
        if (err) reject(err);
        if (files) resolve(files);
      })
    );
  } catch (err) {
    throw err;
  }

  for (let i = 0; i < images.length; i++) {
    const raw = images[i];
    let randomName = crypto.randomBytes(48).toString("base64");

    do {
      randomName = crypto.randomBytes(48).toString("base64");
    } while (currentImages.filter((path: string) => path.includes(randomName)));

    await fs.writeFile(`dir/${randomName}.png`, raw, (err) => {
      if (err) throw err;
    });
  }
}

/**
 * Get all images of the bike in a specific diretory or a set of images in
 * a specific directory if parmaters 'at' and 'to' are defined.
 *
 * @param bikeId - The id of the bike.
 * @param directory - The directory to fetch the images from.
 * @param at  - The starting position of the slice.
 * @param to  - The ending position of the slice.
 *
 * @returns {string[]} an array of images content.
 */
export async function getBikeImages(
  bikeId: string,
  directory: Directory,
  at: number = 0,
  to: number = -1
) {
  let dir =
    directory === Directory.REGISTRY
      ? `images/registry/${bikeId}`
      : directory === Directory.INVESTIGATIONS
      ? `images/investigations/${bikeId}`
      : `images/reports/${bikeId}`;

  if (!fs.existsSync(dir))
    throw new Error(
      `Bike ${bikeId} has no images for directory ${
        directory === Directory.REGISTRY
          ? "registry"
          : directory === Directory.INVESTIGATIONS
          ? "investigations"
          : "reports"
      }.`
    );

  let images: string[];

  try {
    images = await new Promise((resolve, reject) =>
      fs.readdir(dir, (err, files) => {
        if (err) reject(err);
        if (files) resolve(files);
      })
    );
  } catch (err) {
    throw err;
  }

  let requested = images.slice(at, to === -1 ? images.length - 1 : to);

  let imageContent: {
    [key: number]: { filename: string; content: string };
  } = {};

  for (let i = 0; i < requested.length; i++) {
    const entry = requested[i];
    await fs.readFile(`${dir}/${entry}`, (err, data) => {
      if (err) throw err;
      imageContent[i] = { filename: entry, content: data.toString("uft8") };
    });
  }

  return imageContent;
}

/**
 * Deletes images of a bike from a directory.
 *
 * @param bikeId - The id of the bike.
 * @param directory - The directory of to delete from.
 * @param imageNames - The names of the images to delete.
 */
export async function deleteImages(
  bikeId: string,
  directory: Directory,
  imageNames: string[]
) {
  let dir =
    directory === Directory.REGISTRY
      ? `images/registry/${bikeId}`
      : directory === Directory.INVESTIGATIONS
      ? `images/investigations/${bikeId}`
      : `images/reports/${bikeId}`;

  if (!fs.existsSync(dir))
    throw new Error(
      `Bike ${bikeId} has no images in directory ${
        directory === Directory.REGISTRY
          ? "registry"
          : directory === Directory.INVESTIGATIONS
          ? "investigations"
          : "reports"
      }.`
    );

  for (let i = 0; i < imageNames.length; i++) {
    const imageName = imageNames[i];
    await fs.unlink(`${dir}/${imageNames}`, (err) => {
      if (err) throw err;
    });
  }
}

export async function deleteAllImages(bikeId: string, directory: Directory) {
  let dir =
    directory === Directory.REGISTRY
      ? `images/registry/${bikeId}`
      : directory === Directory.INVESTIGATIONS
      ? `images/investigations/${bikeId}`
      : `images/reports/${bikeId}`;

  let images: string[];

  try {
    images = await new Promise((resolve, reject) =>
      fs.readdir(`${dir}/${bikeId}`, (err, files) => {
        if (err) reject(err);
        if (files) resolve(files);
      })
    );
  } catch (err) {
    throw err;
  }

  await deleteImages(bikeId, directory, images);
}

/**
 * Checks if a directory has any images of the specified bike.
 *
 * @param bikeId - The id of the bike.
 * @param directory - The directory to check in.
 *
 * @returns {boolean} true if the directory does, otherwise false.
 */
export function hasImages(bikeId: string, directory: Directory) {
  let dir =
    directory === Directory.REGISTRY
      ? `images/registry/${bikeId}`
      : directory == Directory.INVESTIGATIONS
      ? `images/investigations/${bikeId}`
      : `images/reports/${bikeId}`;
  return fs.existsSync(`${dir}/${bikeId}`);
}
