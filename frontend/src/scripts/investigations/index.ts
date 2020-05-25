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

  let searchParams: any = { open: open };
  let url = `http://localhost:3000/actions/search_investigations.php?open=${open}`;

  if (reportAuthor) {
    url += `&reportAuthor=${reportAuthor}`;
    searchParams.reportAuthor = reportAuthor;
  }

  $.get(url).done((res) => {
    $.post({
      url: "http://localhost:3000/investigations.php",
      data: { search_result: res, search_params: searchParams },
    }).done((res) => {
      $("body").html(res);
      $('input[name="search_by_open"]').prop(
        "checked",
        open === 0 ? true : false
      );
    });
  });
});

$('a[name="view_investigation_back_button"]').ready(() => {
  $('a[name="view_investigation_back_button"').click((e: any) => {
    e.preventDefault();
    window.history.pushState(
      { href: "http://localhost:3000/investigations.php" },
      "",
      "http://localhost:3000/investigations.php"
    );
    $("#viewInvestigation").modal("close");
  });
});

$(".create_comment_form").submit((e) => {
  e.preventDefault();
  let url = $(e.currentTarget).attr("action");
  let investigationId = getUrlQuery(url).investigationId;
  let type = getUrlQuery(url).type;
  let comment = $('.create_comment_form input[name="comment"]').val();

  if (comment === "") return;
  $.post({
    url: `http://localhost:3000/actions/create_investigation_comment.php?investigationId=${investigationId}&type=${type}`,
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

$(".comment_buttons a").click((e: any) => {
  e.preventDefault();
  let url = $(e.currentTarget).attr("href");
  $.post(url).done((res) => {
    window.history.pushState({ href: url }, "", url);
    $("body").html(res);
  });
});
