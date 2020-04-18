import fs from "fs";
/**
 * A collection of functions specific to managing and interfacing with files.
 */

/**
 * Maps a directory recursively relative to the root directory.
 *
 * @param {string} directory - The root directory.
 *
 * @returns {string[]} an array.
 */
export function map(directory: string) {
  function walk(path: string, paths: string[]) {
    for (let i = 0; i < paths.length; i++) {
      const subPath = paths[i];

      if (fs.lstatSync(`${path}/${subPath}`).isDirectory()) {
        paths = walk(`${path}/${subPath}`, paths);
      } else {
        paths.push(`${path}/${subPath}`);
      }
    }

    return paths;
  }

  let rootFiles = fs.readdirSync(directory);
  let paths: string[] = [];

  for (let i = 0; i < rootFiles.length; i++) {
    const file = rootFiles[i];

    if (fs.lstatSync(`${directory}/${file}`).isDirectory()) {
      paths = walk(`${directory}/${file}`, paths);
    } else {
      paths.push(`${directory}/${file}`);
    }
  }

  return paths;
}
