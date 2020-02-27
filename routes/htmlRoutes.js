var path = require("path");
// Requiring our custom middleware for checking if a user is logged in
//var isAuthenticated = require("../config/middleware/isAuthenticated");
var Repoman = require("../models/company.js");
var Sequelize = require("sequelize");

module.exports = function(app) {
  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
  app.get("/index", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
  app.get("/aboutRepoman", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/aboutRepoman.html"));
  });

  app.get("/aboutUSAWeb", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/aboutUSAWeb.html"));
  });
  app.get("/contactUs", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/contactUs.html"));
  });
  app.get("/directory", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/directory.html"));
  });
  app.get("/insurance", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/insurance.html"));
  });
  app.get("/listingOptions", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/listingOptions.html"));
  });
  app.get("/sitePolicy", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/sitePolicy.html"));
  });
  app.get("/refund", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/refund.html"));
  });
  app.get("/vendors", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/vendors.html"));
  });

  app.get("/login", function(req, res) {
    res.render("login", { error: "" });
    //res.sendFile(path.join(__dirname, "../public/login.html"))
  });
  app.get("/register", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/register.html"));
    res.render("register", {
      userObj: {},
      error: ""
    });
  });
  app.get("/customer", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/customer.html"));
  });
  app.get("/customer", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/passwordReset.html"));
  });

  function Base64ToURL(dataImg) {
    var bufferBase64 = new Buffer(dataImg, "binary").toString("base64");
    var url = "data:image/jpeg;base64," + bufferBase64;
    if (bufferBase64) {
      return url;
    }
  }
  app.get("/state/:state", function(req, res) {
    var stateVal = req.params.state.toUpperCase();
    console.log("STATE");
    console.log(stateVal);
    Repoman.findAll({
      raw: true,
      where: {
        state: {
          [Sequelize.Op.substring]: stateVal
        }
      },
      order: [["Listing Level", "DESC"]]
    }).then(result => {
      for (var i = 0; i < result.length; i++) {
        result[i].companyImgUrl = Base64ToURL(result[i].companyImg);
        result[i].insuredImg1Url = Base64ToURL(result[i].insuredImg1);
        result[i].insuredImg2Url = Base64ToURL(result[i].insuredImg2);
        result[i].insuredImg3Url = Base64ToURL(result[i].insuredImg3);
        result[i].insuredImg4Url = Base64ToURL(result[i].insuredImg4);
        result[i].insuredImg5Url = Base64ToURL(result[i].insuredImg5);
        result[i].insuredImg6Url = Base64ToURL(result[i].insuredImg6);
        result[i].insuredImg7Url = Base64ToURL(result[i].insuredImg7);
        result[i].insuredImg8Url = Base64ToURL(result[i].insuredImg8);
      }
      console.log(result);
      //res.json(result);
      res.render("stateSearch", { zipData: result });
    });
    //res.sendFile(path.join(__dirname, "../public/stateSearch.html"));
  });
  app.get("/company/:id", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/companyView.html"));
  });

  app.get("/login", function(req, res) {
    // If the user already has an account send them to the customer page
    console.log("USER");
    if (req.user) {
      res.redirect("/customer");
    }
    res.sendFile(path.join(__dirname, "../public/customer.html"));
  });
  //
  app.get("/login", function(req, res) {
    // If the user already has an account send them to the customer page
    if (req.user) {
      res.redirect("/customer");
    }
    res.sendFile(path.join(__dirname, "../public/customer.html"));
  });
  //
  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be
  //redirected to the signup page
  //   app.get("/customer", isAuthenticated, function(req, res) {
  //     res.sendFile(path.join(__dirname, "../public/login.html"));
  //   });

  // If no matching route is found default to home
  // app.get("*", function(req, res) {
  //     res.sendFile(path.join(__dirname, "../public/index.html"));
  // });
};
