import $ from "jquery";
import * as materialize from "materialize-css";
$.fn.extend(materialize);

export function getUrlQuery() {
  let query: { [key: string]: string } = {};
  let hashes = window.location.href
    .slice(window.location.href.indexOf("?") + 1)
    .split("&");

  for (let i = 0; i < hashes.length; i++) {
    const hash = hashes[i];
    let splitHash = hash.split("=");
    query[splitHash[0]] = splitHash[1];
  }

  return query;
}