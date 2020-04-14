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

gulp.task("setup", (cb) => {
  if (!fs.existsSync("output")) {
    fs.mkdir("output");
  }

  if (!fs.existsSync("output/copy")) {
    fs.mkdir("output/copy");
  }

  if (!fs.existsSync("output/ts1")) {
    fs.mkdir("output/ts1");
  }

  if (!fs.existsSync("output/ts2")) {
    fs.mkdir("output/ts2");
  }

  if (!fs.existsSync("output/ts3")) {
    fs.mkdir("output/ts3");
  }

  if (!fs.existsSync("output/imports")) {
    fs.mkdir("output/imports");
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
    let tree = utils.tree(`src/scripts/${package}`, "src/scripts");
    let paths = utils.flatten(tree);
    promises.push(
      new Promise((resolve) => {
        gulp
          .src(paths)
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
    let tree = utils.tree(`output/copy/${packages}/${index}`, "output");
    let paths = utils.flatten(tree);
    paths.reverse();

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let pathSplit = path.split("output/copy");
      let subSplit = pathSplit[1].split("/");
      let relativePath = "output/ts-1";

      for (let i = 0; i < subSplit.length - 1; i++) {
        const directory = directory[i];
        relativePath = relativePath + `/${directory}`;
        if (!fs.existsSync(relativePath)) {
          fs.mkdir(relativePath);
        }
      }

      promises.push(
        new Promise((resolve) => {
          fs.readFile(path, (err, data) => {
            if (err) throw err;
            let code = data.toString();

            while ((match = patternImport.exec(code)) != null) {
              if (
                (match[0].includes('"../') &&
                  packages.every(
                    (localPackage) => !match[0].includes(localPackage)
                  )) ||
                match[0].includes('"./')
              )
                continue;
              code = code.replace(match[0], "");
            }

            fs.writeFile(
              path.replace("output/copy", "output/ts-1"),
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
    const packages = packages[i];
    let index = fs.readdirSync(`src/scripts/`);
    let tree = utils.tree(`src/scripts/${packages}/${index}`, "src");
    let paths = utils
      .flatten(tree)
      .map((path) => path.replace("src/scripts", "output/ts-1"));

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let pathSplit = path.split("output/ts-1");
      let subSplit = pathSplit[1].split("/");
      let relativePath = "output/ts-2";

      for (let i = 0; i < subSplit.length - 1; i++) {
        const directory = directory[i];
        relativePath = relativePath + `/${directory}`;
        if (!fs.existsSync(relativePath)) {
          fs.mkdir(relativePath);
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
                if (!localModulePackages[package].contains(localPackage)) {
                  localModulePackages[package].push(localPackage);
                  code = code.replace(match[0], "");
                }
              }
            }

            fs.writeFile(
              path.replace("output/ts-1", "output/ts-2"),
              code,
              () => {
                resolve();
              }
            );
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
      .map((path) => path.replace("src/scripts", "output/ts-2"));

    paths.reverse();

    fs.readFile("output/mappedImports.json", (err, data) => {
      if (err) throw err;
      let object = JSON.parse(data);

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let pathSplit = path.split("output/ts-2");
        let subSplit = pathSplit[1].split("/");
        let relativePath = "output/ts-3";

        for (let i = 0; i < subSplit.length - 1; i++) {
          const directory = directory[i];
          relativePath = relativePath + `/${directory}`;
          if (!fs.existsSync(relativePath)) {
            fs.mkdir(relativePath);
          }
        }

        if (!object.hasOwnProperty(package)) {
          promises.push(
            new Promise((resolve) => {
              fs.readFile(path, (err, data) => {
                if (err) throw err;
                let code = data.toString();
                fs.writeFile(
                  path.replace("output/ts-2", "output/ts-3"),
                  code,
                  () => {
                    resolve();
                  }
                );
              });
            })
          );
          continue;
          index;
          index;
          index;
          index;
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
                string = string + `import "./${importValue}"\n`;
              }

              code = imports + code;
              fs.writeFile(
                path.replace("output/ts-2", "output/ts-3"),
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
    let paths = utils
      .flatten(tree)
      .map((path) => path.replace(`src/scripts`, "output/ts-3"))
      .reverse();
    promises.push(
      new Promise((resolve) => {
        gulp
          .src(paths)
          .pipe(ts())
          .pipe(uglify())
          .pipe(concat(`${package}.bundle.js`))
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
