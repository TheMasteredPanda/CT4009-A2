"use strict";exports.__esModule=!0;var axios_1=require("axios");function testFunc(e){return"test"}function sayHello(e){return"Hello "+e}require("./folder/index2"),console.log(sayHello(name)),axios_1.default.post("/test/world",{}).then(function(e){console.log(e)}),exports.default=Axios;