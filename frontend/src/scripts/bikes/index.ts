import "../master/index";
import { getUrlQuery } from "../master/index";

/*$(".mobile_register_a_bike_container").ready(() => {
  let elements = document.querySelectorAll("select");
  M.FormSelect.init(elements);
}); */

$(document).ready(() => {
  $(".bike_carousel").carousel({ fullWidth: true, indicators: true });
});
$(".register_a_bike_form").ready(() => {
  $(".register_a_bike_form").on("submit", (e) => {
    console.log("Clicked");
    e.preventDefault();
    let data = new FormData();

    data.append("partNumber", $("#partNumber").val() as string);
    data.append("brand", $("#brand").val() as string);
    data.append("modal", $("#modal").val() as string);
    data.append("wheelSize", $("#wheelSize").val() as string);
    data.append("gearCount", $("#gearCount").val() as string);
    data.append("gender", $("#bikeGender").val() as string);
    data.append("ageGroup", $("#ageGroup").val() as string);

    if ($("#bikeType").val()) {
      data.append("type", $("#bikeType").val() as string);
    }

    if ($("#bikeColours").val()) {
      let colours: string[] = $("#bikeColours").val() as [];

      for (let i = 0; i < colours.length; i++) {
        const colour = colours[i];
        data.append("colours[]", colour);
      }
    }

    if ($("#brakeType").val()) {
      data.append("brakeType", $("#brakeType").val() as string);
    }

    if ($("#bikeSuspension").val()) {
      data.append("suspension", $("#bikeSuspension").val() as string);
    }

    let images = $("#bikeImages").prop("files");

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      data.append(`image[]`, image);
    }

    $.post({
      url: "http://localhost:3000/actions/register_bike.php",
      data: data,
      processData: false,
      contentType: false,
    }).done((res) => {
      $("body").html(res);
    });
  });
});

$("select").ready(() => {
  $("select").formSelect();
});

$(document).on("click", ".delete_undo_button", (e) => {
  e.preventDefault();

  if ($(e.currentTarget).hasClass("undo_button")) {
    $(e.currentTarget)
      .removeClass("undo_button")
      .addClass("delete_button")
      .text("Delete");
    $(e.currentTarget)
      .parent()
      .parent()
      .find('input[name="delete_images[]"')
      .remove();
  } else {
    if (Number($(e.currentTarget).attr("data-uploaded")) === 0) {
      $(".edit_images_carousel_slider")
        .carousel("destroy")
        .remove(".indicators");
      $(".edit_images_carousel_slider .indicators").remove();
      $(e.currentTarget.parentNode).parent().remove();
      $(".edit_images_carousel_slider").carousel({
        fullWidth: true,
        indicators: true,
      });
    } else {
      let id = $(e.currentTarget).attr("data-image-id");
      $(e.currentTarget).parent().parent().append(createHiddenDeleteItem(id));
    }

    $(e.currentTarget)
      .removeClass("delete_button")
      .addClass("undo_button")
      .text("Undo");
  }
});

function createHiddenDeleteItem(imageId: string) {
  return `<input hidden type="text" value=${imageId} name="delete_images[]"></input>`;
}

function createItem(
  imageId: string,
  src: string | ArrayBuffer,
  buffer: boolean,
  notYetUploaded: boolean = false
) {
  return `
    <div class="carousel-item">
      <img src=${buffer ? src : `http://localhost:5555/${src}`}>
      <input hidden type="file" name="hidden_tmp_file_input[]"></input>
      <div class="button_wrapper">
        <button class="btn-small delete_undo_button delete_button" data-uploaded=${
          notYetUploaded ? 1 : 0
        } data-image-id="${imageId}">Delete</button>
      </div>
    </div>
    `;
}

$(".edit_images_carousel_slider").ready(() => {
  let bikeId = getUrlQuery()["bikeId"];
  if (bikeId == undefined) return;

  $.ajax(`http://localhost:3000/actions/get_bike.php?bikeId=${bikeId}`).done(
    (res) => {
      let images = JSON.parse(res).images;
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        $(".edit_images_carousel_slider").prepend(
          createItem(image.id, image.uri, false, true)
        );
      }

      $(".edit_images_carousel_slider").carousel({
        fullWidth: true,
        indicators: true,
      });
    }
  );
});

// https://stackoverflow.com/questions/52078853/is-it-possible-to-update-filelist
function FileListItem(a: any) {
  a = [].slice.call(Array.isArray(a) ? a : arguments);
  for (var c, b = (c = a.length), d = !0; b-- && d; ) d = a[b] instanceof File;
  if (!d)
    throw new TypeError(
      "expected argument to FileList is File or array of File objects"
    );
  for (b = new ClipboardEvent("").clipboardData || new DataTransfer(); c--; )
    b.items.add(a[c]);
  return b.files;
}

$("#uploadImageCarouselItemInput").change((e) => {
  // @ts-ignore
  let files = e.currentTarget.files;

  $(".edit_images_carousel_slider").carousel("destroy");

  $(".edit_images_carousel_slider .indicators").remove();
  let reader = new FileReader();
  reader.onload = (e) => {
    $(".edit_images_carousel_slider").prepend(
      createItem("##", e.target.result, true, false)
    );

    let carousel = document.getElementsByClassName(
      "edit_images_carousel_slider"
    )[0];

    let input = carousel.children[0].children[1] as HTMLInputElement;
    let list = FileListItem([files[0]]);
    input.files = list;
    $(".edit_images_carousel_slider").carousel({
      fullWidth: true,
      indicators: true,
    });
  };

  console.log(files);
  reader.readAsDataURL(files[0]);
});

$("#bikeInfoImageCarousel").ready(() => {
  $("#bikeInfoImageCarousel").carousel({ fullWidth: true, indicators: true });
});

$(document).ready(() => {
  let modal = getUrlQuery().modal;
  if (!modal) return;
  $(`#${modal}`).modal({ dismissible: false });
  $(`#${modal}`).modal("open");
  $(".carousel").carousel({ fullWidth: true });
});

let geocoder: google.maps.Geocoder;
let placeId: null | string = null;

(window as any).initMap = () => {
  $.getJSON("http://localhost:3000/cords.json").done((cords) => {
    try {
      console.log("init function");
      let map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.864445, lng: -2.244444 },
        zoom: 9,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        fullscreenControl: false,
        minZoom: 9,
      });

      geocoder = new google.maps.Geocoder();
      let input: HTMLInputElement = document.getElementById(
        "pac-input"
      ) as HTMLInputElement;
      let searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
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
      searchBox.addListener("places_changed", () => {
        let places = searchBox.getPlaces();
        let place = places[0];
        geocoder.geocode({ placeId: place.place_id }, (results, status) => {
          if (status === "OK") {
            let county = results[0].address_components[2].long_name;

            if (county !== "Gloucestershire") {
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
    } catch (err) {
      console.log(err);
    }
  });
};

$(".report_stolen_bike_form").ready(() => {
  $(".map-field").keydown((e) => {
    if (e.which === 13) {
      e.preventDefault();
      return;
    }
  });

  $(".report_stolen_bike_form").submit((e) => {
    e.preventDefault();
    if (placeId === null) {
      alert("You enter in the location of the theft.");
      return;
    }

    let description = $('textarea[name="report_description"]').val();

    $.post({
      url: `http://localhost:3000/actions/create_report.php?bikeId=${
        getUrlQuery().bikeId
      }`,
      data: {
        report_description: description,
        place_id: placeId,
      },
    }).done((res) => {
      $("body").html(res);
    });
  });
});
