import "../master/index";

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

  if (params.hasOwnProperty("login")) {
    if (params.login === "unauthorized") {
      alert("Failed to log you in.");
      return;
    }

    if (params.login === "notfound") {
      alert("Account not found.");
      return;
    }

    if (params.login === "badrequest") {
      alert("Bad Request: Failed to process request.");
      return;
    }
  }

  if (params.hasOwnProperty("register")) {
    if ((params.register = "badrequest")) {
      alert("Bad Request: Failed to process request.");
      return;
    }

    if (params.username) {
      let value = params.username;
      let helperText = $('.register_form .helper-text[for="username"]');
      let input = $('.register_form input[name="username"]');

      if (value === "unacceptable") {
        helperText.attr("data-error", "Username already taken");
        input.addClass("invalid");
      }
    }
  }
});

$('a[name="create_account_button"]').click((e) => {
  console.log("Clicked");
  $.post({
    url: "/login.php",
    data: { login: "" },
  }).done((response) => {
    ($(".login_form")[0] as HTMLFormElement).reset();
    $("body").html(response);
  });
});

$('a[name="log_into_account_button"]').click((e) => {
  $.post({
    url: "/login.php",
    data: { login: true },
  }).done((res) => {
    ($(".register_form")[0] as HTMLFormElement).reset();
    $("body").html(res);
  });
});

$('a[name="forgot_creds_button"]').click((e) => {
  console.log("Clicked");
  $.post({
    url: "/login.php",
    data: { forgotCreds: true },
  }).done((res) => {
    ($(".login_form")[0] as HTMLFormElement).reset();
    $("body").html(res);
  });
});

$('a[name="forgot_creds_back_button"]').click((e) => {
  $.post({
    url: "/login.php",
    data: { forgotCreds: "" },
  }).done((res) => {
    $("body").html(res);
  });
});

$("form").ready(() => {
  let helpers = $(".helper-text");

  helpers.each((index) => {
    let helper = helpers.get(index);
    let input = $(`input[name="${$(helper).attr("for")}"]`);
    let text = $(helper).html();

    function event() {
      if (!(input[0] as any).checkValidity()) {
        $(helper).html("");
        $(input).addClass("invalid");
      } else {
        $(helper).html(text);
      }
    }

    input.change((e) => event());
    input.click((e) => event());
  });
});

$('.register_form input[name="passwordRetype"]').change((e) => {
  let password = $('.register_form input[name="password"]');
  let passwordRetypeValue = $(e.currentTarget).val();

  if (password.val() !== passwordRetypeValue) {
    (e.currentTarget as HTMLSelectElement).setCustomValidity("wrong");
  } else {
    (e.currentTarget as HTMLSelectElement).setCustomValidity("");
  }
});
