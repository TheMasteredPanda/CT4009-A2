import "../master/index";

(window as any).initMap = () => {
  $.getJSON("http://localhost:3000/cords.json").done((cords) => {
    let map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 51.864445, lng: -2.244444 },
      zoom: 9,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      fullscreenControl: false,
      minZoom: 9,
    });

    let polygon = new google.maps.Polygon({
      paths: cords,
      strokeColor: "#42a5f5",
      strokeOpacity: 0.8,
      strokeWeight: 0.3,
      fillColor: "#42a5f5",
      fillOpacity: 0.45,
    });

    polygon.setMap(map);
    let geocoder = new google.maps.Geocoder();

    $.get("http://localhost:3000/actions/get_reports.php").done((res) => {
      let reports = JSON.parse(res);

      for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        geocoder.geocode({ placeId: report.place_id }, (results, status) => {
          if (status !== "OK") {
            return;
          }

          let contentString =
            '<div class="report_info_window" id="content">' +
            '<div id="siteNotice">' +
            "</div>" +
            `<h5 id="heading">Report ${report.id}</h5>` +
            `<h6 id="heading">By ${report.author} </h6>` +
            `<div class="button_wrapper">` +
            `<a href="http://localhost:3000/reports.php?modal=viewReport&reportId=${report.id}" class="btn-small indigo">View Report</a>` +
            "</div>" +
            '<div class="body_content" id="bodyContent">' +
            "<p>" +
            report.content +
            "</p>" +
            "</div>" +
            "</div>";

          let infoWindow = new google.maps.InfoWindow({
            content: contentString,
          });

          let marker = new google.maps.Marker({
            map,
            position: results[0].geometry.location,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        });
      }
    });
  });
};
