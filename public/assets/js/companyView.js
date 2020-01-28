$(document).ready(function () {
    var url = document.URL;
    var urlArr = url.split("/");
    var currentCompanyID = parseInt(urlArr[urlArr.length - 1]);
    console.log(currentCompanyID);

    $.get("/api/company/"+ currentCompanyID, function(data){
        console.log(data);
        $("#company-header").text(data[0].companyName);
        $("#company-address").text("Address: "+ data[0].address);
        $("#company-phone").text("Phone: "+data[0].phoneNumber);
        $("#company-link").text("Website: ")
    })
})