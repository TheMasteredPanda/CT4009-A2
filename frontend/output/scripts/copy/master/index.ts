import "./folder/index2";

import axios from "axios";

function sayHello(name: string) {
  return `Hello ${name}`;
}
console.log(sayHello(name));

axios.post("/test/world", {}).then((res: any) => {
  console.log(res);
});
