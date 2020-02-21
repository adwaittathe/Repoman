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

  app.get("/login", function(req, res) {
    res.render("login", { error: "" });
    //res.sendFile(path.join(__dirname, "../public/login.html"))
  });
  app.get("/register", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/register.html"));
  });
  app.get("/customer", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/customer.html"));
  });
  app.get("/customer", function(req, res) {
    res.sendFile(path.join(__dirname, "../public/passwordReset.html"));
  });
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
