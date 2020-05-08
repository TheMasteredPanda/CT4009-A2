import "../master/index";
import { getUrlQuery } from "../master/index";
$(document).ready(() => {
  $('select[name="select_search_type[]"]').formSelect();
  $('select[name="search_by_open"]').formSelect();
  $('select[name="police_select_search_type[]').formSelect();
});

$(".datepicker").ready(() => {
  $(".datepicker").datepicker();
});

$('select[name="select_search_type[]"]').change((e) => {
  let values = $(e.currentTarget).val();

  $.post({
    url: "http://localhost:3000/pages/civilian/reports.php",
    data: { select_search_type: values, search_reports: true },
  }).done((res) => {
    $("body").html(res);
  });
});
$('select[name="police_select_search_type[]"]').change((e) => {
  console.log("Called Police Select");
  let values = $(e.currentTarget).val();
  if (!values) return;

  $.post({
    url: "http://localhost:3000/pages/police/reports.php",
    data: { select_search_type: values, search_reports: true },
  }).done((res) => {
    $("body").html(res);
  });
});
//https://stackoverflow.com/questions/52452763/materialize-textarea-tag-is-not-scrollable-on-fixed-height

$(".police_search_reports_form").submit((e) => {
  e.preventDefault();
  let searchTypes: string[] = $(
    'select[name="police_select_search_type[]"]'
  ).val() as string[];
  let data: any = {};

  if (searchTypes.includes("open")) {
    data.open =
      $('input[name="search_by_open"]').is(":checked") === true ? 0 : 1;
  }

  if (searchTypes.includes("author")) {
    data.author = $('input[name="search_by_author"').val();
  }

  if (searchTypes.includes("start_date")) {
    data.startDate = new Date(
      $('input[name="search_by_start_date"]').val() as string
    ).getTime();
  }

  if (searchTypes.includes("end_date")) {
    data.endDate = new Date(
      $('input[name="search_by_end_date"]').val() as string
    ).getTime();
  }

  console.log(data);
  $.post({
    url: "http://localhost:3000/actions/search_reports.php",
    data,
  }).done((res) => {
    console.log(res);
    let object = JSON.parse(res);

    if (object.ids.length === 0) {
      object.ids = "empty";
    }

    $.post({
      url: "http://localhost:3000/pages/police/reports.php",
      data: object,
    }).done((res1) => {
      $("body").html(res1);
    });
  });
});

$('button[name="comment_public_section_button"]').click((e: any) => {
  let reportId = getUrlQuery().reportId;
  $.post({
    url: `http://localhost:3000/pages/police/mobile/view_report.php?reportId=${reportId}`,
    data: { type: "civilian" },
  }).done((res) => {
    console.log("Is done");
    $("body").html(res);
  });
});

$('button[name="comment_private_section_button"]').click((e: any) => {
  console.log("Police comments click");
  let reportId = getUrlQuery().reportId;
  $.post({
    url: `http://localhost:3000/pages/police/mobile/view_report.php?reportId=${reportId}`,
    data: { type: "police" },
  }).done((res) => {
    $("body").html(res);
  });
});
