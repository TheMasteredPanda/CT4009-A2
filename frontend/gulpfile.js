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

  if (!fs.existsSync("output/copy")) {
    fs.mkdirSync("output/copy");
  }

  if (!fs.existsSync("output/ts1")) {
    fs.mkdirSync("output/ts1");
  }

  if (!fs.existsSync("output/ts2")) {
    fs.mkdirSync("output/ts2");
  }

  if (!fs.existsSync("output/ts3")) {
    fs.mkdirSync("output/ts3");
  }

  if (!fs.existsSync("output/imports")) {
    fs.mkdirSync("output/imports");
  }

  cb();
});

gulp.task("copy", (cb) => {
  let packages = fs.readdirSync(`src/scripts`);
  let promises = [];

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src/scripts");
    let paths = utils.flatten(tree);
    promises.push(
      new Promise((resolve) => {
        gulp
          .src(paths, { base: `src/scripts/${package}` })
          .pipe(gulp.dest(`output/copy/${package}`))
          .on("end", () => resolve());
      })
    );
  }

  Promise.all(promises).then(() => cb());
});

/**
 * Removes all duplicate node package imports. Leaves the imports to the file whose content is
 * highest on the list as that height determines the way in which the content will be
 * concatinated
 */
gulp.task("ts-1", (cb) => {
  let packages = fs.readdirSync("output/copy");
  let promises = [];

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`output/copy/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`output/copy/${package}/${index}`, "output/copy");
    let paths = utils.flatten(tree);
    let imports = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path.includes(package)) continue;
      let pathSplit = path.split("output/copy");
      let subSplit = pathSplit[1].split("/");
      let relativePath = "output/ts1";

      for (let i = 0; i < subSplit.length - 1; i++) {
        const directory = subSplit[i];
        relativePath = relativePath + `/${directory}`;
        if (!fs.existsSync(relativePath)) {
          fs.mkdirSync(relativePath);
        }
      }

      promises.push(
        new Promise((resolve) => {
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
              path.replace("output/copy", "output/ts1"),
              code,
              () => {
                resolve();
              }
            );
          });
        })
      );
    }
  }

  Promise.all(promises).then(() => cb());
});

/**
 * Takes out locally imported modules to be bundled imports. Will be added later when they're about to be bundled.
 */
gulp.task("ts-2", (cb) => {
  let packages = fs.readdirSync("src/scripts");
  let promises = [];
  let localModulePackages = {};

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src");
    let paths = utils
      .flatten(tree)
      .map((path) => path.replace("src/scripts", "output/ts1"));
    paths.reverse();
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path.includes(package)) continue;
      let pathSplit = path.split("output/ts1");
      let subSplit = pathSplit[1].split("/");
      let relativePath = "output/ts2";

      for (let i = 0; i < subSplit.length - 1; i++) {
        const directory = subSplit[i];
        relativePath = relativePath + `/${directory}`;
        if (!fs.existsSync(relativePath)) {
          fs.mkdirSync(relativePath);
        }
      }

      promises.push(
        new Promise((resolve) => {
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

            fs.writeFile(path.replace("output/ts1", "output/ts2"), code, () => {
              resolve();
            });
          });
        })
      );
    }

    Promise.all(promises).then(() => {
      fs.writeFile(
        "output/mappedImports.json",
        JSON.stringify(localModulePackages),
        () => {
          cb();
        }
      );
    });
  }
});

/**
 * Takes the mapped imports fro mthe json file made above and inserts the specified local modules into the first file in the array.
 */
gulp.task("ts-3", (cb) => {
  let packages = fs.readdirSync("src/scripts");
  let promises = [];

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src");
    let paths = utils
      .flatten(tree)
      .map((path) => path.replace("src/scripts", "output/ts2"));

    paths.reverse();

    fs.readFile("output/mappedImports.json", (err, data) => {
      if (err) throw err;
      let object = JSON.parse(data);

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (!path.includes(package)) continue;
        let pathSplit = path.split("output/ts2");
        let subSplit = pathSplit[1].split("/");
        let relativePath = "output/ts3";

        for (let i = 0; i < subSplit.length - 1; i++) {
          const directory = subSplit[i];
          relativePath = relativePath + `/${directory}`;
          if (!fs.existsSync(relativePath)) {
            fs.mkdirSync(relativePath);
          }
        }

        if (!object.hasOwnProperty(package)) {
          promises.push(
            new Promise((resolve) => {
              fs.readFile(path, (err, data) => {
                if (err) throw err;
                let code = data.toString();
                fs.writeFile(
                  path.replace("output/ts2", "output/ts3"),
                  code,
                  () => {
                    resolve();
                  }
                );
              });
            })
          );
          continue;
        }

        promises.push(
          new Promise((resolve) => {
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
                path.replace("output/ts2", "output/ts3"),
                code,
                () => {
                  resolve();
                }
              );
            });
          })
        );
      }
    });
  }

  Promise.all(promises).then(() => {
    cb();
  });
});

gulp.task("ts-4", (cb) => {
  let packages = fs.readdirSync("src/scripts");
  let promises = [];

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];
    let tree = utils.tree(`src/scripts/${package}/${index}`, "src");
    let paths = [...new Set(utils.flatten(tree))]
      .map((path) => path.replace(`src/scripts`, "output/ts3"))
      .reverse();

    promises.push(
      new Promise((resolve) => {
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
      })
    );
  }

  Promise.all(promises).then(() => {
    cb();
  });
});

gulp.task("clean", (cb) => {
  fs.rmdir("output", () => {
    cb();
  });
});

gulp.task(
  "default",
  gulp.series("setup", "copy", "ts-1", "ts-2", "ts-3", "ts-4", "clean")
);
