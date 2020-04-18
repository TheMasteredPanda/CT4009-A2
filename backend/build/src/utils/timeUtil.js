"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fromString(s) {
    if (s === undefined) {
        throw new Error("Got an undefined string as a string time value.");
    }
    let timeUnit = s.charAt(s.length - 1).toLowerCase();
    let timeValue = s.toLowerCase().replace(timeUnit, "");
    let value = -1;
    if (timeUnit === "h") {
        value = Number(timeValue) * 120 * 1000;
    }
    if (timeUnit === "m") {
        value = Number(timeValue) * 60 * 1000;
    }
    if (timeUnit === "s") {
        value = Number(timeValue) * 1000;
    }
    return value;
}
exports.fromString = fromString;
