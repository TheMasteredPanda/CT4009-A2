import "../master/index";

$(document).ready(() => {
  $("#mainSidenav").sidenav();
  $("#adminPanelSidenav").sidenav({ edge: "right" });
});

$('div[name="close_sidenav_button"]').click((e) => {
  $("#mainSidenav").sidenav("close");
  //  instance.close();
});

$('div[name="close_admin_sidenav_button"]').click((e) => {
  $("#adminPanelSidenav").sidenav("close");
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
