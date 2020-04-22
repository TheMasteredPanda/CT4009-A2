import "../master/index";

$('a[name="create_account_button"]').click((e) => {
  $.post({
    url: "/login.php",
    data: { login: "" },
  }).done((response) => {
    $("body").html(response);
  });
});

$('a[name="log_into_account_button"]').click((e) => {
  $.post({
    url: "/login.php",
    data: { login: true },
  }).done((res) => {
    $("body").html(res);
  });
});

$('a[name="forgot_creds_button"]').click((e) => {
  console.log("Clicked");
  $.post({
    url: "/login.php",
    data: { forgotCreds: true },
  }).done((res) => {
    $("body").html(res);
  });
});

$('.register_form').submit((e) => {
  e.preventDefault();
  let username = $('input[name="username"]').val();
  let password = $('input[name="password"').val();
  let retypePassword = $('input[name="passwordRetype"]').val();
  let email = $('input[name="email"]').val();
  
})