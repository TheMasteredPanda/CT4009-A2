import "../master/index";

document.addEventListener("DOMContentLoaded", () => {
  let elements = document.querySelectorAll(".sidenav");
  M.Sidenav.init(elements);
});

$('div[name="close_sidenav_button"]').click((e) => {
  let instance = M.Sidenav.getInstance(document.getElementById("mainSidenav"));
  instance.close();
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
