$(document).ready(function() {
  var url = document.URL;
  var urlArr = url.split("/");
  var currentState = urlArr[urlArr.length - 1];
  console.log(currentState);

  $.get("/api/state/" + currentState, function(data) {
    if (currentState === "AL") {
      $("#state-search-header").append("Alabama");
    } else if (currentState === "AZ") {
      $("#state-search-header").append("Arizona");
    } else if (currentState === "AK") {
      $("#state-search-header").append("Alaska");
    } else if (currentState === "AR") {
      $("#state-search-header").append("Arkansas");
    } else if (currentState === "CA") {
      $("#state-search-header").append("California");
    } else if (currentState === "CO") {
      $("#state-search-header").append("Colorado");
    } else if (currentState === "CT") {
      $("#state-search-header").append("Connecticut");
    } else if (currentState === "DE") {
      $("#state-search-header").append("Deleware");
    } else if (currentState === "FL") {
      $("#state-search-header").append("Florida");
    } else if (currentState === "GA") {
      $("#state-search-header").append("Georgia");
    } else if (currentState === "HI") {
      $("#state-search-header").append("Hawaii");
    } else if (currentState === "ID") {
      $("#state-search-header").append("Idaho");
    } else if (currentState === "IL") {
      $("#state-search-header").append("Illinois");
    } else if (currentState === "IN") {
      $("#state-search-header").append("Indiana");
    } else if (currentState === "IA") {
      $("#state-search-header").append("Iowa");
    } else if (currentState === "KS") {
      $("#state-search-header").append("Kansas");
    } else if (currentState === "KY") {
      $("#state-search-header").append("Kentucky");
    } else if (currentState === "LA") {
      $("#state-search-header").append("Louisiana");
    } else if (currentState === "ME") {
      $("#state-search-header").append("Maine");
    } else if (currentState === "MD") {
      $("#state-search-header").append("Maryland");
    } else if (currentState === "MA") {
      $("#state-search-header").append("Massachusetts");
    } else if (currentState === "MI") {
      $("#state-search-header").append("Michigan");
    } else if (currentState === "MS") {
      $("#state-search-header").append("Mississippi");
    } else if (currentState === "MO") {
      $("#state-search-header").append("Missouri");
    } else if (currentState === "MT") {
      $("#state-search-header").append("Montana");
    } else if (currentState === "NE") {
      $("#state-search-header").append("Nebraska");
    } else if (currentState === "NV") {
      $("#state-search-header").append("Nevada");
    } else if (currentState === "NH") {
      $("#state-search-header").append("New Hampshire");
    } else if (currentState === "NJ") {
      $("#state-search-header").append("New Jersey");
    } else if (currentState === "NM") {
      $("#state-search-header").append("New Mexico");
    } else if (currentState === "NY") {
      $("#state-search-header").append("New York");
    } else if (currentState === "NC") {
      $("#state-search-header").append("North Carolina");
    } else if (currentState === "ND") {
      $("#state-search-header").append("North Dakota");
    } else if (currentState === "OH") {
      $("#state-search-header").append("Ohio");
    } else if (currentState === "OK") {
      $("#state-search-header").append("Oklahoma");
    } else if (currentState === "OR") {
      $("#state-search-header").append("Oregon");
    } else if (currentState === "PA") {
      $("#state-search-header").append("Pennsylvania");
    } else if (currentState === "RI") {
      $("#state-search-header").append("Rhode Island");
    } else if (currentState === "SC") {
      $("#state-search-header").append("South Carolina");
    } else if (currentState === "SD") {
      $("#state-search-header").append("South Dakota");
    } else if (currentState === "TN") {
      $("#state-search-header").append("Tennessee");
    } else if (currentState === "TX") {
      $("#state-search-header").append("Texas");
    } else if (currentState === "UT") {
      $("#state-search-header").append("Utah");
    } else if (currentState === "VT") {
      $("#state-search-header").append("Vermont");
    } else if (currentState === "WA") {
      $("#state-search-header").append("Washington");
    } else if (currentState === "WV") {
      $("#state-search-header").append("West Virginia");
    } else if (currentState === "WI") {
      $("#state-search-header").append("Wisconsin");
    } else if (currentState === "WY") {
      $("#state-search-header").append("Wyoming");
    } else {
      $("state-search-header").append(
        "Sorry, the request didn't find any results"
      );
    }

    for (var i = 0; i < data.length; i++) {
      var wellSection = $(
        "<li class='mt-2 mb-2'><div class='card-body '></li>"
      );
      var companyID = data[i].id.toString();
      console.log(companyID);
      wellSection.addClass("well");
      wellSection.attr("id", "company" + i);
      $("#well-section").append(wellSection);
      $("#company" + i).append(
        "<a style ='text-decoration:none' class='card-title' href='/company/" +
          companyID +
          "'><h4>" +
          data[i]["Company Name"] +
          "</h4></a>"
      );
      $("#company" + i).append(
        "<p class='card-text'>Address: " + data[i].Address + "</p>"
      );
      $("#company" + i).append("<p>States: " + data[i].State + "</p>");
      $("#company" + i).append("<p>Phone: " + data[i]["Phone Number"] + "</p>");
      $("company").css({ padding: "4%" });
      var listingData = data[i]["Listing Level"];
      var listing = listingData.substr(10, 500);
      console.log(listing);
      //conditional checking listing level to display correct listings
      if (
        listing === "Basic Annual (sku:LISTING002A)" ||
        listing === "Basic Annual With Auto-Renew (sku:LISTING002A)" ||
        listing === "Basic Annual (sku:LISTING002A) State(s):"
      ) {
        $("#company" + i).css({
          "background-color": "#D3D3D3",
          "border-style": "solid",
          "border-width": "3px",
          "border-color": "grey",
          padding: "4%"
        });
      } else if (
        listing === "Enhanced Annual (sku:LISTING003-EA)" ||
        listing === "Enhanced Quarterly (sku:LISTING003-EQ)" ||
        listing === "Enhanced Annual With Auto-Renew (sku:LISTING003-EA)"
      ) {
        $("#company" + i).css({
          "background-color": "firebrick",
          "border-style": "solid",
          "border-width": "3px",
          "border-color": "grey",
          padding: "4%"
        });
      } else if (
        listing === "Enhanced With Multi-Media Annual (sku:LISTING-EMMA)" ||
        listing === "Enhanced With Multi-Media Quarterly (sku:LISTING-EMMQ)"
      ) {
        $("#company" + i).css({
          "background-color": "red",
          "border-style": "solid",
          "border-width": "3px",
          "border-color": "yellow",
          padding: "4%"
        });
      } else {
        $("#company" + i).css({
          "background-color": "transparent",
          "border-style": "solid",
          "border-width": "3px",
          "border-color": "lightgrey",
          padding: "4%"
        });
      }
    }
  });
});
