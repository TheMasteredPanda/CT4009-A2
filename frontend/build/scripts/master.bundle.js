"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var axios_1=require("axios");function testFunc(e){return"test"}function sayHello(e){return"Hello "+e}console.log(sayHello(name)),axios_1.default.post("/test/world",{}).then(function(e){console.log(e)}),exports.default=Axios;