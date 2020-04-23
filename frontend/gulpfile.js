const utils = require("./gulputils");
const fs = require("fs");
const gulp = require("gulp");
const sass = require("gulp-sass");
const webpack = require("webpack");
const gWebpack = require("gulp-webpack");
const webpackConfig = require("./webpack.config.js");
const concat = require("gulp-concat");
const connect = require("gulp-connect-php");
const browserSync = require("browser-sync");

gulp.task("webpack", () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(new Error(stats.compilation.errors.join("\n")));
      }
      resolve();
    });
  });
});

gulp.task("sass", async (cb) => {
  let packages = fs.readdirSync("src/styles");
  let promises = [];

  for (let i = 0; i < packages.length; i++) {
    const package = packages[i];
    promises.push(
      new Promise((resolve, reject) => {
        let tree = utils.tree(
          `src/styles/${package}/index.scss`,
          `src/styles/${package}`
        );
        let flatten = utils.flatten(tree).reverse();

        gulp
          .src(flatten)
          .pipe(sass())
          .pipe(concat(`${package}.bundle.css`))
          .pipe(gulp.dest("build/styles"))
          .on("end", () => resolve());
      })
    );
  }

  await Promise.all(promises);
  cb();
});

gulp.task("php", (cb) => {
  let paths = utils.map("src/php");

  gulp
    .src(paths, { base: "src/php" })
    .pipe(gulp.dest("build"))
    .on("end", () => cb());
});

gulp.task("server", (cb) => {
  connect.server({ base: "build" }, () => {
    browserSync({
      proxy: "127.0.0.1:8000",
    });

    gulp.watch("src/scripts/**/*", gulp.series("webpack"));
    gulp.watch("src/styles/**/*", gulp.series("sass"));
    gulp.watch("src/php/**/*", gulp.series("php"));
    cb();
  });
});

gulp.task("default", gulp.series("webpack", "sass", "php", "server"));
