import "../master/index";
import { getUrlQuery } from "../master/index";

$('.create_comment_form input[type="submit"]').click((e) => {
  e.preventDefault();
  let investigationId = getUrlQuery().investigationId;
  let comment = $('.create_comment_form input[name="comment"]').val();

  if (comment === "") return;
  $.post({
    url: `http://localhost:3000/actions/create_investigation_comment.php?investigationId=${investigationId}`,
    data: { comment },
  }).done((res) => {
    $("body").html(res);
  });
});

$('input[name="add_investigator_button"]').click((e) => {
  let investigationId = getUrlQuery().investigationId;
  let username = $('input[name="add_investigator_name"]').val();

  $.get(
    `http://localhost:3000/actions/add_investigator.php?investigationId=${investigationId}&username=${username}`
  ).done((res) => {
    $("body").html(res);
  });
});

$(".view_update_evidence_container").ready(() => {
  $(".view_update_evidence_container .carousel").carousel({ fullWidth: true });
});
