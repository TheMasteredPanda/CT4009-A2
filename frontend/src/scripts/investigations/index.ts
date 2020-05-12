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
