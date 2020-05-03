$('.create_officer_account_form input[name="retypePassword"]').change((e) => {
  console.log("Changed.");
  let password = $('input[name="password"]').val();

  if (password !== $(e.currentTarget).val()) {
    (e.currentTarget as HTMLSelectElement).setCustomValidity("wrong");
  } else {
    (e.currentTarget as HTMLSelectElement).setCustomValidity("");
  }
});

$(document).ready(() => {
  let query = window.location.search;
  if (!query) return;

  let map = query
    .split("?")[1]
    .split("&")
    .map((string) => string.split("="))
    .map((array) => `{"${array[0]}": "${array[1]}"}`)
    .map((decoded) => JSON.parse(decoded));

  let params: { [key: string]: string } = {};

  for (let i = 0; i < map.length; i++) {
    const entry = map[i];
    let key: string = Object.keys(entry)[0];
    params[key] = entry[key];
  }

  if (params.username) {
    if (params.username === "unacceptable") {
      alert("Username already taken.");
    } else {
      alert("Username must be a value.");
    }
  }

  if (params.email) {
    if (params.email === "unacceptable") {
      alert("Email address is already being used.");
    } else {
      alert("Email address must be a value.");
    }
  }

  if (params.password) {
    alert("Password must be a value.");
  }
});
