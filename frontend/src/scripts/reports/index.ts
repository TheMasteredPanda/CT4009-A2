import "../master/index";
$(document).ready(() => {
  $('select[name="select_search_type[]"]').formSelect();
  $('select[name="search_by_open"]').formSelect();
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

//https://stackoverflow.com/questions/52452763/materialize-textarea-tag-is-not-scrollable-on-fixed-height

