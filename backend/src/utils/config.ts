import fs, { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs";
let configObject: ConfigFile;

/**
 * A utility file for creating, deleting, and parsing the configuration file.
 */

/**
 * A small interface. Illustrated out of convenience rather than necessity.
 *
 * This is a object reprentation of the information stored in the config.json file.
 */
export interface ConfigFile {
  /**
   * MariaDB client values.
   */
  mariadb: {
    /**
     * The username of the account sequelize will use to connect to the server.
     */
    username: string;
    /**
     * The password of the account sequelize will use to connect to the server.
     */
    password: string;
    /**
     * The adress of the server sequelize will use to attempt to connect to the server.
     */
    host: string;
    /**
     * The port number the server is on.
     */
    port: number;
    /**
     * The specific database the sequelize client will use for this app.
     */
    database: string;
    /**
     * The dialect of the server (in this case mariadb)
     */
    dialect: string;
    /**
     * The timezone of the system running this app. In England this is Etc/GMT0
     */
    timezone: string;
    /**
     * Values for the connection pool.
     */
    pool: {
      /**
       * Minimum number of actual connections allowed open.
       */
      min: number;
      /**
       * Maximum number of actual connections allowed open.
       */
      max: number;
    };
  };
  server: {
    port: number;
  };
  auth: {
    secretExp: string;
    refreshExp: string;
    refreshOffset: string;
  };
}

/**
 * Creates a configuration file. This function will also load the newly created configuration
 * file into memory.
 */
export function create() {
  let config = {
    mariadb: {
      username: "root",
      password: "password",
      host: "127.0.0.1",
      port: 27017,
      database: "test",
      dialect: "mysql",
      timezone: "Etc/GMT0",
      pool: {
        min: 5,
        max: 10,
      },
    },
    server: {
      port: 3000,
    },
    auth: {
      secretExp: "5m",
      refreshExp: "5m",
      refreshOffset: "2m",
    },
  };

  writeFileSync("config.json", JSON.stringify(config, null, 4));
  configObject = JSON.parse(readFileSync("config.json").toString());
}

/**
 * Sets the config object. Used for testing the server.
 * @param cfgObject - The object the configObject will be.
 */
export function set(cfgObject: any) {
  configObject = cfgObject;
}
/**
 * To check if a configuration file already exists.
 *
 * @returns {boolean} true if exists, otherwise false.
 */
export function exists() {
  return existsSync("config.json");
}

/**
 * Removes the configuration file.
 */
export function remove() {
  unlinkSync("config.json");
}

/**
 * Returns the parsed configuration file data. If the configuration file
 * has not yet been loaded into memory this function will lazily do so.
 *
 * @returns {ConfigFile} the configuration file data, parsed in JSON.
 */
export function get() {
  if (configObject === null || configObject === undefined) {
    configObject = JSON.parse(readFileSync("config.json").toString());
  }

  return configObject;
}
