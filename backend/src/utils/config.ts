import fs, {
  writeFileSync,
  readFileSync,
  existsSync,
  unlinkSync,
} from "fs";
let configObject;

export function create() {
  let config = {
    mariadb: {
      username: "root",
      password: "password",
      address: "127.0.0.1",
      database: "test",
      pool: {
        min: 5,
        max: 10,
      },
    },
  };

  writeFileSync("config.json", JSON.stringify(config));
  configObject = JSON.parse(readFileSync("config.json").toString());
}

export function exists() {
  return existsSync("config.json");
}

export function remove() {
  unlinkSync("config.json");
}

export function get() {
  if (configObject === null) {
    configObject = JSON.parse(readFileSync("config.json").toString());
  }

  return configObject;
}
