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