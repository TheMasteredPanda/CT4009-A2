"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function map(directory) {
    function walk(path, paths) {
        for (let i = 0; i < paths.length; i++) {
            const subPath = paths[i];
            if (fs_1.default.lstatSync(`${path}/${subPath}`).isDirectory()) {
                paths = walk(`${path}/${subPath}`, paths);
            }
            else {
                paths.push(`${path}/${subPath}`);
            }
        }
        return paths;
    }
    let rootFiles = fs_1.default.readdirSync(directory);
    let paths = [];
    for (let i = 0; i < rootFiles.length; i++) {
        const file = rootFiles[i];
        if (fs_1.default.lstatSync(`${directory}/${file}`).isDirectory()) {
            paths = walk(`${directory}/${file}`, paths);
        }
        else {
            paths.push(`${directory}/${file}`);
        }
    }
    return paths;
}
exports.map = map;
