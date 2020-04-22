const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: () => {
    let packages = fs.readdirSync("./src/scripts");
    let entryPoints = {};

    for (let i = 0; i < packages.length; i++) {
      const package = packages[i];
      let index = fs
        .readdirSync(`./src/scripts/${package}`)
        .filter((path) => path.endsWith("index.ts"))[0];
      entryPoints[package] = `./src/scripts/${package}/${index}`;
    }

    return entryPoints;
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "build/scripts"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
};
