import * as fs from "fs";
let actions: any = {};
/**
 * A manager responsible for loading all action scrippts.
 *
 * An action script is a TypeScript file with defined functions
 * that will be used in it's corresponding endpoint file.
 */

/**
 * If the manager is loaded this value would be true, otherwise false.
 */
let loaded: boolean = false;

/**
 * If the actions are loaded the returning value will be true, otherwise false.
 */
export function isLoaded() {
  return loaded;
}

/**
 * Load all actions under the actions directory. If the action has it's own directory it will
 * assume the first file in that directory is the index file.
 */
export function load() {
  return new Promise((resolve, reject) => {
    let paths = fs.readdirSync(`actions`).map((path: string) => {
      if (fs.lstatSync(`actions/${path}`).isDirectory()) {
        return `actions/${path}/${
          fs
            .readdirSync(`actions/${path}`)
            .filter((path: string) => path.endsWith(".ts"))[0]
        }`;
      }

      return `actions/${path}`;
    });

    let promises: Promise<any>[] = [];
    let names: string[] = [];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let pathSplit = path.split("/");
      let name = pathSplit[pathSplit.length - 1].split(".")[0];
      promises.push(
        import(`../${path}`).then((module) => {
          actions[name] = module;
          names.push(name);
        })
      );
    }

    return Promise.all(promises)
      .then(() => (loaded = true))
      .then(() => resolve(names));
  }).catch(console.error);
}

/**
 * Unload all loaded modules. If successful a boolean value of 'true' should be returned. Otherwise
 * false.
 */
export function unload() {
  let names = Object.keys(actions);

  for (let i = 0; i < names.length; i++) {
    const key = names[i];
    const value = actions[key];

    if (value.hasOwnProperty("unload")) {
      value.unload();
    } else {
      console.log(
        `Action module ${key} does not have an exported function named 'unload'.`
      );
    }

    delete actions[key];
  }

  return Object.keys(actions).length === 0;
}

/**
 * Get an action module from the array. If the specified name does not correspond to an action
 * a error will be thrown.
 *
 * @param name - The name of the action module.
 *
 * @returns {any} an instance of the action module.
 */
export function get(name: string) {
  let value = actions[name];

  if (!value) {
    throw new Error(`Action under name ${name} does not exist.`);
  }

  return value;
}
