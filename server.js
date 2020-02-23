var express = require("express");
var app = express();
var userModel = require("./models/user.js");
var companyModel = require("./models/company.js");
var db = require("./config/connection");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var app = express();
var blobUtil = require("blob-util");
var flash = require("connect-flash");
var port = process.env.PORT || 8080;
var readBlob = require("read-blob");
var path = require("path");
const fetch = require("node-fetch");
//var popup = require('popups');
const cor = {
  latitude: 13.555,
  logitude: 100.33
};

//Possibly missing middleware for Passport but update to Express is causing an issue
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// required for passport
app.use(
  session({
    secret: "repomaisthepassphrase",
    resave: true,
    saveUninitialized: true
  })
); // session secret
//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// var User = sequelize.define('User', {
//   username: Sequelize.STRING,
//   lastname: Sequelize.STRING,
// });

require("./routes/htmlRoutes.js")(app);
require("./routes/apiRoutes.js")(app);

app.post("/zip", async function(req, response) {
  console.log(req.body);
  var url =
    "https://www.zipcodeapi.com/rest/CIkJigsGbUqnlUGDkGHrddrqhBofshJNxp1Xf3xXPGWxfFmBEruccI2tMKs7HGb6/radius.json/" +
    req.body.zipCode +
    "/" +
    req.body.mileSearch +
    "/miles";

  var urlVal = await fetch(url);
  const data = await urlVal.json();

  const zipArray = data.zip_codes;
  var zipList = [];
  for (var i = 0; i < zipArray.length; i++) {
    var obj = zipArray[i];
    zipList.push(obj.zip_code);
  }
  // zipList.push(35244);
  // zipList.push(29707);
  // zipList.push(29716);
  // zipList.push(36302);
  // zipList.push(35124);
  // zipList.push(35238);

  var Op = Sequelize.Op;

  db.sync()
    .then(function() {
      return companyModel.findAll({
        where: {
          Zip: {
            [Op.in]: zipList
          }
        },
        order: [["Listing Level", "DESC"]]
      });
    })
    .then(function(res, err) {
      if (res) {
        var obj = JSON.stringify(res);
        var d = JSON.parse(obj);
        for (var i = 0; i < d.length; i++) {
          if (d[i].companyImg.data.length > 0) {
            var bufferBase64 = new Buffer(
              d[i].companyImg.data,
              "binary"
            ).toString("base64");
            var url = "data:image/jpeg;base64," + bufferBase64;
            d[i].img = url;
          }
        }
        response.render("zipDisplay", { zipData: d });
      }
    });
});

app.post("/login", function(req, response) {
  console.log(req.body);
  db.sync()
    .then(function() {
      return userModel.findOne({
        where: {
          email: req.body.email
        }
      });
    })
    .then(function(res, err) {
      if (res) {
        var user = new userModel({
          id: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          password: res.password,
          company: res.company
        });
        if (user.password != req.body.password) {
          response.render("login", { error: "Please enter a valid password" });
        } else {
          var sess = req.session;
          sess.email = res.email;
          sess.userId = res.id;
          var obj = {
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email,
            company: res.company
          };
          response.render("customer", { userObj: obj });
          //response.sendFile(path.join(__dirname, "./public/customer.html"));
        }
      } else {
        response.render("login", { error: "Please enter a valid email" });
      }
    });
});

function validation(pass1, pass2) {
  if (pass1 == pass2) {
    return true;
  } else {
    return false;
  }
}
app.post("/register", function(req, response) {
  if (!validation(req.body.password, req.body.confirmpassword)) {
    response.render("register", {
      userObj: req.body,
      error: "Password and Confirm password should be same"
    });
    return;
  }
  db.sync()
    .then(function() {
      return userModel.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        company: req.body.company
      });
    })
    .then(function(userCreateResult, error) {
      console.log("----------USER___RESULT_____________");
      if (error) {
        console.log("Error");
        console.log(error);
      }
      if (userCreateResult) {
        console.log(userCreateResult);
      }

      db.sync()
        .then(function() {
          return companyModel.create({
            State: req.body.state,
            "Company Name": req.body.company,
            "Phone Number": req.body.phoneNo,
            Address:
              req.body.address1 +
              " " +
              req.body.address2 +
              " " +
              req.body.state +
              " " +
              req.body.zip,
            Name: req.body.firstName + " " + req.body.lastName,
            Username: req.body.email,
            Zip: req.body.zip
          });
        })
        .then(function(result, error) {
          if (result) {
            console.log("----------_RESULT_____________");
            console.log(result);
            var sess = req.session;
            sess.email = req.body.email;
            sess.userId = userCreateResult.id;
            console.log("SESSION");
            console.log(sess.userId);
            console.log(userCreateResult.id);
            console.log(sess);
            var obj = {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              company: req.body.company
            };
            response.render("customer", { userObj: obj });
          }
          if (error) {
            console.log(error);
          }
        });
    });
});

app.get("/update", function(req, response) {
  var sess = req.session;
  console.log("IN UPDATE");
  console.log(sess.userId);
  db.sync()
    .then(function() {
      return userModel.findOne({
        where: {
          id: sess.email
        }
      });
    })
    .then(function(res, err) {
      if (res) {
        var user = new userModel({
          id: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          password: res.password,
          company: res.company
        });
        console.log(JSON.stringify(user));
        response.render("update", { userObj: user });
      }
    });
});

app.post("/update", function(req, response) {
  var sess = req.session;

  userModel
    .update(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        company: req.body.company
      },
      { where: { email: sess.email } }
    )
    .then(result => {
      console.log("Details updated successfully");
      companyModel
        .update(
          {
            "Company Name": req.body.company,
            Name: req.body.firstName + " " + req.body.lastName,
            Username: req.body.email
          },
          { where: { Username: sess.email } }
        )
        .then(res => {
          var obj = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            company: req.body.company
          };
          response.render("customer", { userObj: obj });
        });
    })
    .catch(err => {
      console.log("update failed");
      console.log(err);
    });
});

app.listen(8012);

// db.sequelize.sync({ force: false }).then(function() {
app.listen(port, function() {
  console.log("App listening on PORT: " + port);
});
// })
module.exports = app;
