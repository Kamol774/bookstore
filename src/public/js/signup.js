console.log("Signup frontend javascript file");

$(function () {  // rasm yuklashdan oldin yuklovchi qanday rasm yuklaganini kichik hajmda bo'lsa ham ko'rishi uchun mantiq
  const fileTarget = $(".file-box .upload-hidden"); // rasm yuklashda qatnashadigan input clasini belgilayapmiz
  let filename;

  fileTarget.on("change", function () {
    if (window.FileReader) {
      const uploadFile = $(this)[0].files[0]; // upload qilingan file ni qo'lga olyapmiz
      const fileType = uploadFile["type"];
      const validImageType = ["image/jpg", "image/jpeg", "image/png"]; // faqatkina shu type dagi fayllarni qabul qilsin
      if (!validImageType.includes(fileType)) {
        alert("Please insert only jpg, jpeg, png!");
      } else {
        if (uploadFile) {
          console.log(URL.createObjectURL(uploadFile)); // uploadFile ni url ga taqdim etyapmiz va createObjectURL ni uploadFile orqali hosil qilyapmiz 
          $(".upload-img-frame")  // default turgan rasmni upload qileyatkan rasmga o'zgartirish mantig'i
            .attr("src", URL.createObjectURL(uploadFile))
            .addClass("success");
        }
        filename = $(this)[0].files[0].name; //upload qilinayotkan rasm nomi(name)ni filename ga tenglayapmiz
      }

      $(this).siblings(".upload-name").val(filename); //upload qilinayotkan rasm nomi bizga ko'rinib turishi uchun mantiq
    }
  })
});



$(function () { });
// signup jarayoni uchun frontend validation quryapmiz
function validateSignupForm() { // ejs -> form dagi onsubmit bilan bog'lanadi
  const memberNick = $(".member-nick").val()
  const memberPhone = $(".member-phone").val()
  const memberPassword = $(".member-password").val()
  const confirmPassword = $(".confirm-password").val()

  if (memberNick === "" || memberPhone === "" || memberPassword === "" || confirmPassword === "") {
    alert("Please insert all required inputs");
    return false
  }

  if (memberPassword !== confirmPassword) {
    alert("Password differs, please check!");
    return false
  }

  // quyida member-image ni qabul qilib olish mantig'i:
  const memberImage = $(".member-image").get(0).files[0] ? $(".member-image").get(0).files[0].name : null;
  if (!memberImage) {
    alert("Please insert restaurant image!");
    return false;
  }
}