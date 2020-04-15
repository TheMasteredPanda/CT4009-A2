const sass = require("gulp-sass");
const rename = require("gulp-rename");
const through2 = require("through2");
const utils = require("./gulputils");
const fs = require("fs");
const gulp = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const patternImport = new RegExp(
  /import(?:["'\s]*([\w*${}\n\r\t, ]+)from\s*)?["'\s]["'\s](.*[@\w_-]+)["'\s].*;$/,
  "mg"
);

function getPackage(importString) {
  let splitImportString = importString.split(" ");
  return splitImportString[splitImportString.length - 1]
    .replace('"', "")
    .replace('";', "");
}

gulp.task("setup", (cb) => {
  if (!fs.existsSync("output")) {
    fs.mkdirSync("output");
  }

  if (!fs.existsSync("output/scripts")) {
    fs.mkdirSync("output/scripts");
  }

  if (!fs.existsSync("output/scripts/copy")) {
    fs.mkdirSync("output/scripts/copy");
  }

  if (!fs.existsSync("output/scripts/ts1")) {
    fs.mkdirSync("output/scripts/ts1");
  }

  if (!fs.existsSync("output/scripts/ts2")) {
    fs.mkdirSync("output/scripts/ts2");
  }

  if (!fs.existsSync("output/scripts/ts3")) {
    fs.mkdirSync("output/scripts/ts3");
  }

  if (!fs.existsSync("output/php")) {
    fs.mkdirSync("output/php");
  }

  if (!fs.existsSync("output/php/copy")) {
    fs.mkdirSync("output/php/copy");
  }

  if (!fs.existsSync("output/php/php1")) {
    fs.mkdirSync("output/php/php1");
  }

  if (!fs.existsSync("output/php/php2")) {
    fs.mkdirSync("output/php/php2");
  }

  cb();
});

gulp.task("copy", async () => {
  let packages = fs.readdirSync(`src/scripts`);

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src/scripts");
    let paths = utils.flatten(tree);
    await new Promise((resolve) => {
      gulp
        .src(paths, { base: `src/scripts/${package}` })
        .pipe(gulp.dest(`output/scripts/copy/${package}`))
        .on("end", () => resolve());
    });
  }

  return null;
});

/**
 * Removes all duplicate node package imports. Leaves the imports to the file whose content is
 * highest on the list as that height determines the way in which the content will be
 * concatinated
 */
gulp.task("ts-1", async () => {
  let packages = fs.readdirSync("output/scripts/copy");

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`output/scripts/copy/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(
      `output/scripts/copy/${package}/${index}`,
      "output/scripts"
    );
    let paths = utils.flatten(tree);
    let imports = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path.includes(package)) continue;
      let pathSplit = path.split("output/scripts/copy");
      let relativePath = "output/scripts/ts1";
      utils.mkdirs([pathSplit[1]], relativePath);

      await new Promise((resolve) => {
        fs.readFile(path, (err, data) => {
          if (err) throw err;
          let code = data.toString();

          while ((match = patternImport.exec(code)) != null) {
            let package = getPackage(match[0]);
            if (
              (match[0].includes('"../') &&
                packages.some((localPackage) =>
                  match[0].includes(localPackage)
                )) ||
              imports.includes(package)
            )
              continue;
            code = code.replace(match[0], "");
            imports.push(package);
          }

          fs.writeFile(
            path.replace("output/scripts/copy", "output/scripts/ts1"),
            code,
            () => {
              resolve();
            }
          );
        });
      });
    }
  }

  return null;
});

/**
 * Takes out locally imported modules to be bundled imports. Will be added later when they're about to be bundled.
 */
gulp.task("ts-2", async (cb) => {
  let packages = fs.readdirSync("src/scripts");
  let localModulePackages = {};

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src");
    let paths = utils
      .flatten(tree)
      .map((path) => path.replace("src/scripts", "output/scripts/ts1"));
    paths.reverse();
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path.includes(package)) continue;
      let pathSplit = path.split("output/scripts/ts1");
      let relativePath = "output/scripts/ts2";
      utils.mkdirs([pathSplit[1]], relativePath);

      await new Promise((resolve) => {
        fs.readFile(path, (err, data) => {
          if (err) throw err;
          let code = data.toString();

          while ((match = patternImport.exec(code)) != null) {
            for (let i = 0; i < packages.length; i++) {
              const localPackage = packages[i];

              if (!match[0].includes(localPackage)) continue;
              if (!localModulePackages.hasOwnProperty(package))
                localModulePackages[package] = [];
              if (!localModulePackages[package].includes(localPackage)) {
                localModulePackages[package].push(localPackage);
                code = code.replace(match[0], "");
              }
            }
          }

          fs.writeFile(
            path.replace("output/scripts/ts1", "output/scripts/ts2"),
            code,
            () => {
              resolve();
            }
          );
        });
      });
    }

    await fs.writeFile(
      "output/mappedImports.json",
      JSON.stringify(localModulePackages),
      () => {
        cb();
      }
    );
  }
});

/**
 * Takes the mapped imports fro mthe json file made above and inserts the specified local modules into the first file in the array.
 */
gulp.task("ts-3", async () => {
  let packages = fs.readdirSync("src/scripts");
  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];

    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src");
    let paths = utils
      .flatten(tree)
      .map((path) => path.replace("src/scripts", "output/scripts/ts2"));

    paths.reverse();
    let data = fs.readFileSync("output/mappedImports.json", {
      encoding: "utf8",
    });
    let object = JSON.parse(data);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path.includes(package)) continue;
      let pathSplit = path.split("output/scripts/ts2");
      let relativePath = "output/scripts/ts3";
      utils.mkdirs([pathSplit[1]], relativePath);

      if (!object.hasOwnProperty(package)) {
        await new Promise((resolve) => {
          fs.readFile(path, (err, data) => {
            if (err) throw err;
            let code = data.toString();
            fs.writeFile(
              path.replace("output/scripts/ts2", "output/scripts/ts3"),
              code,
              () => {
                resolve();
              }
            );
          });
        });
        continue;
      }

      await new Promise((resolve) => {
        fs.readFile(path, (err, data) => {
          if (err) throw err;
          let code = data.toString();
          let imports = object[package];
          let string = "";

          for (let i = 0; i < imports.length; i++) {
            const importValue = imports[i];
            string = string + `import "./${importValue}.bundle.js"\n`;
          }

          code = string + code;
          fs.writeFile(
            path.replace("output/scripts/ts2", "output/scripts/ts3"),
            code,
            () => {
              resolve();
            }
          );
        });
      });
    }
  }

  return null;
});

gulp.task("ts-4", async () => {
  let packages = fs.readdirSync("src/scripts");

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src");
    let paths = [...new Set(utils.flatten(tree))]
      .map((path) => path.replace(`src/scripts`, "output/scripts/ts3"))
      .sort((a, b) => (a.includes("node_modules") ? -1 : 1))
      .reverse();

    console.log(paths);
    await new Promise((resolve) => {
      const tsProject = ts.createProject("tsconfig.json");
      gulp
        .src(paths)
        .pipe(concat(`${package}.bundle.ts`))
        .pipe(tsProject())
        .pipe(rename(`${package}.bundle.js`))
        .pipe(uglify())
        .pipe(gulp.dest("build/scripts"))
        .on("end", () => {
          resolve();
        });
    });
  }

  return null;
});

gulp.task("clean", (cb) => {
  fs.rmdirSync("output", { recursive: true });
  cb();
});

gulp.task("sass-compile", async () => {
  let packages = fs
    .readdirSync("src/styles")
    .filter((path) => fs.lstatSync(`src/styles/${path}`).isDirectory());

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/styles/${package}`)
      .filter((path) => path.endsWith(".scss"))[0];
    let tree = utils.tree(`src/styles/${package}/${index}`, "src/styles");
    let paths = utils.flatten(tree);
    paths.reverse();
    await new Promise((resolve) => {
      gulp
        .src(paths)
        .pipe(sass())
        .pipe(concat(`${package}.bundle.css`))
        .pipe(gulp.dest(`build/styles`))
        .on("end", () => {
          resolve();
        });
    });
  }

  return null;
});

gulp.task("php-copy", (cb) => {
  let paths = utils.map("src/php");
  gulp
    .src(paths)
    .pipe(gulp.dest("build"))
    .on("end", () => cb());
});

gulp.task(
  "default",
  gulp.series(
    "setup",
    "copy",
    "ts-1",
    "ts-2",
    "ts-3",
    "ts-4",
    "sass-compile",
    "php-copy",
    "clean"
  )
);
