import "../master/index";
import { getUrlQuery } from "../master/index";

$(document).ready(() => {
  let modal = getUrlQuery().modal;
  $(`#${modal}`).modal({ dismissible: false });
  $(`#${modal}`).modal("open");
  $(".materialboxed").materialbox();
});

$(".search_investigations_form").submit((e) => {
  e.preventDefault();
  let reportAuthor = $('input[name="report_author"]').val();
  let open = 1;

  if ($('input[name="search_by_open"]').is(":checked")) {
    open = 0;
  }

  let url = `http://localhost:3000/actions/search_investigations.php?open=${open}`;

  if (reportAuthor) {
    url += `&reportAuthor=${reportAuthor}`;
  }

  $.get(url).done((res) => {
    $.post({url: 'http://localhost:3000/investigations.php', data: {search_result: res}}).done((res) => $('body').html(res))
  });
});

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
  e.preventDefault();
  let investigationId = getUrlQuery().investigationId;
  let username = $('input[name="add_investigator_name"]').val();
  $.get(
    `http://localhost:3000/actions/add_investigator.php?username=${username}&investigationId=${investigationId}`
  ).done((res) => {
    $("body").html(res);
  });
});

$(".view_update_evidence_container").ready(() => {
  $(".view_update_evidence_container .carousel").carousel({ fullWidth: true });
});

$('a[name="remove_investigator_button"]').click((e) => {
  let investigationId = getUrlQuery().investigationId;
  let investigatorId = $(e.currentTarget).attr("data-investigator");

  $.get(
    `http://localhost:3000/actions/remove_investigator.php?investigationId=${investigationId}&investigatorId=${investigatorId}`
  ).done((res) => {
    $("body").html(res);
  });
});
