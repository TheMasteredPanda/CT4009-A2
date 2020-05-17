import "../master/index";
import { getUrlQuery } from "../master/index";

$(document).ready(() => {
  let modal = getUrlQuery().modal;
  if (!modal) return;
  $(`#${modal}`).modal({ dismissible: false });
  $(`#${modal}`).modal("open");
});

$(".change_password_form").ready(() => {
  $('input[name="retype_new_password"]').change((e) => {
    let newPassword = $('input[name="new_password"]').val();
    let newPasswordRetype = $('input[name="retype_new_password"]').val();

    if (newPassword !== newPasswordRetype) {
      (e.currentTarget as HTMLInputElement).setCustomValidity("wrong");
    } else {
      (e.currentTarget as HTMLInputElement).setCustomValidity("");
    }
  });

});
