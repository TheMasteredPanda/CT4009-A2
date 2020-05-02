import "../master/index";
import { getUrlQuery } from "../master/index";

/*$(".mobile_register_a_bike_container").ready(() => {
  let elements = document.querySelectorAll("select");
  M.FormSelect.init(elements);
}); */

$(".register_a_bike_form").on("submit", (e) => {
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
  notYetUploaded: boolean = false,
  imgLastModified: number = 0,
  imgName: string = "",
  imgSize: number = 0,
  type: string = ""
) {
  return `
    <div class="carousel-item">
      <img src=${buffer ? src : `http://localhost:5555/${src}`}>
      <input type="file" class="hidden_tmp_file_info[]" style="display: none;" data-file-lastModified=${imgLastModified} data-file-name=${imgName} data-file-size=${imgSize} data-file-type=${type}></div>
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

$("#uploadImageCarouselItemInput").change((e) => {
  // @ts-ignore
  let files = e.currentTarget.files;

  $(".edit_images_carousel_slider").carousel("destroy");

  $(".edit_images_carousel_slider .indicators").remove();
  let reader = new FileReader();
  reader.onload = (e) => {
    $(".edit_images_carousel_slider").prepend(
      createItem(
        "##",
        e.target.result,
        true,
        false,
        files[0].lastModified,
        files[0].name,
        files[0].size,
        files[0].type
      )
    );

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
