const fs = require("fs");
const dependencyTree = require("dependency-tree");
const patternDImport = new RegExp(
  /import\((?:["'\s]*([\w*{}\n\r\t, ]+)\s*)?["'\s](.*([@\w_-]+))["'\s].*\);$/,
  "mg"
);

module.exports.tree = function (entryPoint, directory) {
  return dependencyTree({
    filename: entryPoint,
    directory: directory,
    tsConfig: "./tsconfig.json",
  });
};

module.exports.flatten = function (tree) {
  let sticks = [];

  function walk(branch, sticks) {
    let subSticks = sticks.concat(Object.keys(branch));
    if (Object.values(branch).length !== 0) {
      for (let i = 0; i < Object.values(branch).length; i++) {
        const subBranch = Object.values(branch)[i];
        subSticks = walk(subBranch, subSticks);
      }
    }
    return subSticks;
  }

  sticks = sticks.concat(Object.keys(tree));

  for (let i = 0; i < Object.values(tree).length; i++) {
    const branch = Object.values(tree)[i];
    sticks = walk(branch, sticks);
  }

  return sticks;
};

module.exports.stripImportDuplications = function (path) {
  let data = fs.readFileSync(path, { encoding: "utf8" });
  console.log(data);
};

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

module.exports.sleep = function (n) {
  msleep(n * 1000);
};

module.exports.mkdirs = function (paths, relativePath) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    let splitPath = path.split("/");

    for (let j = 0; j < splitPath.length - 1; j++) {
      const directory = splitPath[j];
      relativePath += `/${directory}`;

      if (!fs.existsSync(relativePath)) {
        fs.mkdirSync(relativePath);
      }
    }
  }
};

/**
 * Maps an entire directory out.
 */
module.exports.map = function (directory) {
  function walk(currentPath, paths) {
    let files = fs.readdirSync(currentPath);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (fs.lstatSync(`${currentPath}/${file}`).isDirectory()) {
        paths = walk(`${currentPath}/${file}`, paths);
      } else {
        paths.push(`${currentPath}/${file}`);
      }
    }

    return paths;
  }

  let paths = [];
  let rootFiles = fs.readdirSync(directory);

  for (let i = 0; i < rootFiles.length; i++) {
    const rootFile = rootFiles[i];

    if (fs.lstatSync(`${directory}/${rootFile}`).isDirectory()) {
      paths = walk(direcotry + `/${rootFile}`);
    } else {
      paths.push(directory + `/${rootFile}`);
    }
  }

  return paths;
};
