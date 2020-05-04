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

$('button[name="admin_account_search_button"]').click((e) => {
  console.log("Clicked");
  let searchValue: string = $(
    'input[name="admin_accounts_search"]'
  ).val() as string;
  let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //From https://emailregex.com/
  let entries = $(".account_entry");

  if (searchValue === "") {
    $.post({
      url:
        "http://localhost:3000/pages/police/admin_panel.php?section=accounts",
    }).done((res) => {
      $("body").html(res);
    });
    return;
  }
  if (emailRegex.test(searchValue)) {
    let ids = entries
      .map((i) => {
        let element = entries[i];

        return {
          email: $(element).attr("data-search-email"),
          id: $(element).attr("data-entry-id"),
        };
      })
      .get()
      .filter((entry) => entry.email)
      .filter((entry) => entry.email.startsWith(searchValue))
      .map((entry) => entry.id);
    $.post({
      url:
        "http://localhost:3000/pages/police/admin_panel.php?section=accounts",
      data: {
        accounts: ids.map((id) => Number(id)),
      },
    }).done((res) => {
      $("body").html(res);
    });
  } else {
    let ids = entries
      .map((i) => {
        let element = entries[i];

        return {
          username: $(element).attr("data-search-username"),
          id: $(element).attr("data-entry-id"),
        };
      })
      .get()
      .filter((entry) => {
        if (!entry.username) return false;
        return entry.username.startsWith(searchValue);
      })
      .map((entry) => entry.id);

    $.post({
      url:
        "http://localhost:3000/pages/police/admin_panel.php?section=accounts",
      data: {
        accounts: ids.map((id) => Number(id)),
      },
    }).done((res) => {
      $("body").html(res);
    });
  }
});
