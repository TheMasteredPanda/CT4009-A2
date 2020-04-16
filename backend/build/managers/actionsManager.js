"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
let actions = {};
let loaded = false;
function isLoaded() {
    return loaded;
}
exports.isLoaded = isLoaded;
function load() {
    return new Promise((resolve, reject) => {
        let paths = fs.readdirSync(`actions`).map((path) => {
            if (fs.lstatSync(`actions/${path}`).isDirectory()) {
                return `actions/${path}/${fs
                    .readdirSync(`actions/${path}`)
                    .filter((path) => path.endsWith(".ts"))[0]}`;
            }
            return `actions/${path}`;
        });
        let promises = [];
        let names = [];
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            let pathSplit = path.split("/");
            let name = pathSplit[pathSplit.length - 1].split(".")[0];
            promises.push(Promise.resolve().then(() => __importStar(require(`../${path}`))).then((module) => {
                actions[name] = module;
                names.push(name);
            }));
        }
        return Promise.all(promises)
            .then(() => (loaded = true))
            .then(() => resolve(names));
    }).catch(console.error);
}
exports.load = load;
function unload() {
    let names = Object.keys(actions);
    for (let i = 0; i < names.length; i++) {
        const key = names[i];
        const value = actions[key];
        if (value.hasOwnProperty("unload")) {
            value.unload();
        }
        else {
            console.log(`Action module ${key} does not have an exported function named 'unload'.`);
        }
        delete actions[key];
    }
    return Object.keys(actions).length === 0;
}
exports.unload = unload;
function get(name) {
    let value = actions[name];
    if (!value) {
        throw new Error(`Action under name ${name} does not exist.`);
    }
    return value;
}
exports.get = get;
