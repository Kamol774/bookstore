console.log("Books frontend javascript file");

$(function () {  // document ready function (web to'liq zagruzka bo'lmaguncha JS ishlamay turishi uchun)
  $(".product-collection").on("change", () => {  });
  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none")
  })

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex")
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id,
      productStatus = $(`#${id}.new-product-status`).val();
    //  console.log("id:",id);
    //  console.log("productStatus:",productStatus);

    try {
      const response = await axios.post(`/admin/product/${id}`, { productStatus: productStatus });
      console.log("response:", response);
      const result = response.data;
      if (result.data) {
        //   console.log("Product updated!");
        $(".new-product-status").blur();
      } else alert("Book update failed!");
    } catch (err) {
      console.log(err);
      alert("Book update failed!");
    }
  });
});

function validateForm() {
  const productName = $(".product-name").val(),
    productPrice = $(".product-price").val(),
    productLeftCount = $(".product-left-count").val(),
    productCollection = $(".product-collection").val(),
    productDesc = $(".product-desc").val(),
    productStatus = $(".product-status").val();


  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""

  ) {
    alert("Please insert all details!");
    return false;
  } else return true;

}

function previewFileHandler(input, order) {
  const imgClassName = input.className;
  console.log("input:", input);

  const file = $(`.${imgClassName}`).get(0).files[0];
  const fileType = file["type"];
  const validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpeg,jpg and png!")
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}