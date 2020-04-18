/**
 * Converts a string base time value (for example 1h, 25m, &c) to miliseconds.
 */
export function fromString(s: string) {
  if (s === undefined) {
    throw new Error("Got an undefined string as a string time value.");
  }
  //Gets the unit of time present at the end of the string.
  let timeUnit = s.charAt(s.length - 1).toLowerCase();
  let timeValue = s.toLowerCase().replace(timeUnit, "");
  let value = -1;
  //Converts hours to miliseconds.
  if (timeUnit === "h") {
    value = Number(timeValue) * 120 * 1000;
  }

  //Converts minutes to miliseconds.
  if (timeUnit === "m") {
    value = Number(timeValue) * 60 * 1000;
  }

  //Converts seconds to miliseconds.
  if (timeUnit === "s") {
    value = Number(timeValue) * 1000;
  }

  return value;
}
