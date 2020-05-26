import "../master/index";
import { getUrlQuery } from "../master/index";

$(document).ready(() => {
  $('select[name="select_search_type[]"]').formSelect();
  $('select[name="search_by_open"]').formSelect();
  $('select[name="police_select_search_type[]').formSelect();
  let modal = getUrlQuery().modal;
  if (!modal) return;

  if (modal === "viewReport") {
    $("#viewReport").modal({ dismissible: false }).modal("open");
  }
});

$(".datepicker").ready(() => {
  $(".datepicker").datepicker();
});

$('select[name="select_search_type[]"]').change((e) => {
  let values = $(e.currentTarget).val();

  $.post({
    url: "http://localhost:3000/reports.php",
    data: { select_search_type: values, search_reports: true },
  }).done((res) => {
    $("body").html(res);
  });
});

$('a[name="close_view_report_button"').ready(() => {
  $('a[name="close_view_report_button"]').click((e: any) => {
    e.preventDefault();
    $("#viewReport").modal("close");
    window.history.pushState(
      { href: "http://localhost:3000/reports.php" },
      "",
      "http://localhost:3000/reports.php"
    );
    setTimeout(() => {
      $("#viewReport").modal("destroy");
    }, 1000);
  });
});

//https://stackoverflow.com/questions/52452763/materialize-textarea-tag-is-not-scrollable-on-fixed-height

$(".search_reports_form").submit((e) => {
  e.preventDefault();
  let searchTypes: string[] = $(
    'select[name="select_search_type[]"]'
  ).val() as string[];
  let data: any = {};

  if (searchTypes.includes("open")) {
    data.open =
      $('input[name="search_by_open"]').is(":checked") === true ? 0 : 1;
  }

  if (searchTypes.includes("author")) {
    data.author = $('input[name="search_by_author"').val();
  }

  let author = $('input[name="civ_author"]').val();

  if (author !== "") {
    data.author = author;
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
      url: "http://localhost:3000/reports.php",
      data: object,
    }).done((res1) => {
      $("body").html(res1);
    });
  });
});

$('form[name="new_report_comment_form"]').ready(() => {
  $('form[name="new_report_comment_form"]').submit((e: any) => {
    e.preventDefault();
    let query = getUrlQuery();

    if (!query.type) {
      query.type = "civilian";
    }

    $.post({
      url: $(e.currentTarget).attr("action"),
      data: {
        new_comment_textarea: $('textarea[name="new_comment_textarea"]').val(),
      },
    }).done((res) => {
      $.post(
        `http://localhost:3000/reports.php?reportId=${query.reportId}&modal=viewReport&placeId=${query.placeId}&type=${query.type}`
      ).done((res) => {
        $("body").html(res);
      });
    });
  });
});
$('button[name="comment_public_section_button"]').click((e: any) => {
  let reportId = getUrlQuery().reportId;
  let url = `http://localhost:3000/reports.php?modal=viewReport&reportId=${reportId}&placeId=${
    getUrlQuery().placeId
  }&type=civilian`;
  $.get(url).done((res) => {
    window.history.pushState({ href: url }, "", url);
    $("body").html(res);
  });
});

$('button[name="comment_private_section_button"]').click((e: any) => {
  let reportId = getUrlQuery().reportId;
  let url = `http://localhost:3000/reports.php?modal=viewReport&reportId=${reportId}&placeId=${
    getUrlQuery().placeId
  }&type=police`;
  $.get(url).done((res) => {
    window.history.pushState({ href: url }, "", url);
    $("body").html(res);
  });
});

let placeId: string | null;

(window as any).initMap = () => {
  $.getJSON("http://localhost:3000/cords.json").done((cords) => {
    let map: any;
    let geocoder = new google.maps.Geocoder();

    if (window.location.toString().includes("report_bike.php")) {
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.864445, lng: -2.244444 },
        zoom: 5,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        fullscreenControl: false,
        minZoom: 9,
      });

      let searchBoxElement = document.getElementById(
        "pac-input"
      ) as HTMLInputElement;
      let searchBox = new google.maps.places.SearchBox(searchBoxElement);
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(
        searchBoxElement
      );
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener("places_changed", () => {
        let places = searchBox.getPlaces();
        let place = places[0];
        geocoder.geocode({ placeId: place.place_id }, (results, status) => {
          if (status === "OK") {
            let isInGloucestershire = false;

            for (let i = 0; i < results[0].address_components.length; i++) {
              const name = results[0].address_components[i].long_name;

              if (name !== "Gloucestershire") {
                continue;
              }

              isInGloucestershire = true;
            }

            if (!isInGloucestershire) {
              alert("Address must be within gloucestershire");
              return;
            }

            map.setCenter(results[0].geometry.location);
            let marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
            });
            placeId = place.place_id;
          }
        });
      });
    }

    if (
      window.location.toString().includes("view_report.php") ||
      window.location.toString().includes("reports.php")
    ) {
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.864445, lng: -2.244444 },
        zoom: 9,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        fullscreenControl: false,
        minZoom: 9,
        draggable: false,
      });

      geocoder.geocode(
        { placeId: getUrlQuery().placeId },
        (results, status) => {
          if (status === "OK") {
            map.setCenter(results[0].geometry.location);
            let marker = new google.maps.Marker({
              map,
              position: results[0].geometry.location,
            });
          }
        }
      );
    }

    let polygon = new google.maps.Polygon({
      paths: cords,
      strokeColor: "#42a5f5",
      strokeOpacity: 0.8,
      strokeWeight: 0.3,
      fillColor: "#42a5f5",
      fillOpacity: 0.45,
    });

    polygon.setMap(map);
  });
};
