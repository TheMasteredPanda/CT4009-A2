import axios from "axios";
import "./folder/index2";
function sayHello(name: string) {
  return `Hello ${name}`;
}
console.log(sayHello(name));

axios.post("/test/world", {}).then((res) => {
  console.log(res);
});
