import "../master/index";

document.addEventListener("DOMContentLoaded", () => {
  $('.sidenav').sidenav();
});

$('div[name="close_sidenav_button"]').click((e) => {
  $('#mainSidenav').sidenav('close')
//  instance.close();
});

$('div[name="logout_button"]').click((e) => {
  console.log("Clicked.");
  $.post({
    url: "/index.php",
    data: { logout: true },
  }).done((res) => {
    $("body").html(res);
  });
});