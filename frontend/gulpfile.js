const rename = require("gulp-rename");
const through2 = require("through2");
const utils = require("./gulputils");
const fs = require("fs");
const gulp = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const ts = require("gulp-typescript");

const patternImport = new RegExp(
  /import(?:["'\s]*([\w*${}\n\r\t, ]+)from\s*)?["'\s]["'\s](.*[@\w_-]+)["'\s].*;$/,
  "mg"
);

let matchedImports = [];

gulp.task("ts", (cb) => {
  let packages = fs.readdirSync("./src/scripts/");
  let promises = [];
  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    let index = fs
      .readdirSync(`./src/scripts/${package}`)
      .filter((path) => path.endsWith(".ts"))[0];

    let tree = utils.tree(`./src/scripts/${package}/${index}`);
    let paths = utils.flatten(tree);
    paths.reverse();
    promises = [
      new Promise((resolve) => {
        gulp
          .src(paths, { base: `./src/scripts/${package}` })
          .pipe(
            through2.obj((file, _, cb) => {
              if (file.isBuffer()) {
                let pathSplit = file.path.split("/");
                let name = pathSplit[pathSplit.length - 1];
                let code = file.contents.toString();
                while ((match = patternImport.exec(code)) != null) {
                  if (matchedImports.includes(match[0])) {
                    code = code.replace(match[0], "");
                  } else {
                    matchedImports.push(match[0]);
                  }
                }

                file.contents = Buffer.from(code);
              }

              cb(null, file);
            })
          )
          .pipe(gulp.dest(`output/${package}`))
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        console.log("Resolved, onton next promise.");
        let outputDirs = fs.readdirSync(`output/${package}`);
        let tree = utils.tree(
          `output/${package}/${
            outputDirs.filter((path) => path.endsWith(".ts"))[0]
          }`
        );
        let paths = utils.flatten(tree);
        console.log("Outputting paths");
        paths.reverse();
        console.log(paths);
        gulp
          .src(paths)

          .pipe(concat(`${package}.bundle.ts`))
          .pipe(ts())
          .pipe(uglify())
          .pipe(rename(`${package}.bundle.js`))
          .pipe(gulp.dest("build"))
          .on("end", resolve);
      }),
    ];
  }

  Promise.all(promises)
    .catch(console.error)
    .then(() => cb());
});

gulp.task("default", gulp.series("ts"));
