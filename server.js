var express = require("express");
var app = express();
var userModel = require("./models/user.js");
var companyModel = require("./models/company.js");
var db = require("./config/connection");
var session = require("express-session");
var Sequelize = require("sequelize");
var app = express();
const formidable = require("formidable");
var flash = require("connect-flash");
var port = process.env.PORT || 8080;
const multer = require("multer");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.KeyId,
  secretAccessKey: process.env.AccessKey
});
const BUCKET_NAME = "repoman-data";

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "repomaisthepassphrase",
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());

require("./routes/htmlRoutes.js")(app);
require("./routes/apiRoutes.js")(app);

app.post("/zip", async function(req, response) {
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

app.post("/upload", (req, res) => {
  new formidable.IncomingForm().parse(req).on("file", (name, file) => {
    uploadFile(file.path);
  });
});

app.get("/addCompany", (req, res) => {
  var sess = req.session;
  res.render("addCompany", { userObj: {}, error: "" });
});

app.post("/addCompany", (req, res) => {
  var sess = req.session;
  console.log(req.body);
  db.sync()
    .then(function() {
      return companyModel.create({
        State: req.body.state,
        Country: req.body.country,
        "Company Name": req.body.company,
        "Phone Number": req.body.phoneNo,
        Address1: req.body.address1,
        Address2: req.body.address2,
        userId: sess.userId,
        Website: req.body.website,
        Description: req.body.companyDesc,
        "Fax Number": req.body.faxNo,
        Zip: req.body.zip,
        isApproved: 0
      });
    })
    .then(function(result, error) {
      if (result) {
        res.render("customer", { userObj: {} });
      }
      if (error) {
        console.log(error);
      }
    });
});

app.post("/addInsurance", (req, res) => {
  console.log(req.body);
  var path = null;
  var filename = null;
  var id = null;
  var st = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      //uploadFile(file.path);
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {
      console.log(name, field);
      if (name == "id") {
        id = field;
      }
      if (name == "stateVal") {
        st = field;
      }
    })
    .on("end", () => {
      var url = id + "/insuranceImages/" + filename;
      uploadFile(path, url);
      res.redirect("/state/" + st);
    });
});

app.post("/addMap", (req, res) => {
  console.log(req.body);
  var path = null;
  var filename = null;
  var id = null;
  var st = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      //uploadFile(file.path);
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {
      console.log(name, field);
      if (name == "id") {
        id = field;
      }
      if (name == "stateVal") {
        st = field;
      }
    })
    .on("end", () => {
      var url = id + "/companyInfo/" + filename;
      uploadFile(path, url);
      res.redirect("/state/" + st);
    });
});

const uploadFile = (fileName, key) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent
  };
  s3.upload(params, function(err, data) {
    if (err) {
      console.log("ERROR");
      console.log(err);
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};

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
    .then(async function(res, err) {
      if (res) {
        var user = new userModel({
          id: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          password: res.password
        });
        const validatePass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!validatePass) {
          response.render("login", { error: "Please enter a valid password" });
          return;
        } else {
          var sess = req.session;
          sess.email = res.email;
          sess.userId = res.id;
          var obj = {
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email
          };
          response.render("customer", { userObj: obj });
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
app.post("/register", async function(req, response) {
  if (!validation(req.body.password, req.body.confirmpassword)) {
    response.render("register", {
      userObj: req.body,
      error: "Password and Confirm password should be same"
    });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(req.body.password, salt);
  db.sync()
    .then(function() {
      return userModel.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashPass
      });
    })
    .then(function(userCreateResult, error) {
      if (error) {
        console.log("Error");
        console.log(error);
      }
      if (userCreateResult) {
        //console.log(userCreateResult);
        var sess = req.session;
        sess.email = userCreateResult.email;
        sess.userId = userCreateResult.id;
        var obj = {
          id: userCreateResult.id,
          firstName: userCreateResult.firstName,
          lastName: userCreateResult.lastName,
          email: userCreateResult.email
        };
        console.log(obj);
        response.render("customer", { userObj: obj });
      }
    });
});

app.get("/update", function(req, response) {
  var sess = req.session;
  db.sync()
    .then(function() {
      return userModel.findOne({
        where: {
          email: sess.email
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
        response.render("update", { userObj: user });
      }
    });
});
app.post("/updateComp", function(req, res) {
  var companyId = req.body.id;
  companyModel
    .findOne({
      raw: true,
      where: {
        id: companyId
      }
    })
    .then(result => {
      console.log(result);
      res.render("updateCompany", { userObj: result, error: "" });
    });
});

app.post("/approveCompany", function(req, res) {
  console.log(req.body);
  var approve = 0;
  if (req.body.approve) {
    approve = 1;
  }
  companyModel
    .update(
      {
        State: req.body.state,
        "Company Name": req.body.company,
        "Phone Number": req.body.phoneNo,
        Address1: req.body.address1,
        Address2: req.body.address2,
        Zip: req.body.zip,
        State: req.body.state,
        Country: req.body.country,
        Website: req.body.website,
        "Fax Number": req.body.faxNo,
        Description: req.body.companyDesc,
        isApproved: approve
      },
      { where: { id: req.body.companyId } }
    )
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log("update failed");
      console.log(err);
    });
});

app.get("/admin", function(req, res) {
  companyModel
    .findAll({
      raw: true,
      where: {
        isApproved: 0
      },
      order: [["Listing Level", "DESC"]]
    })
    .then(result => {
      res.render("admin", { data: result });
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
          sess.email = req.body.email;
          response.render("customer", { userObj: obj });
        });
    })
    .catch(err => {
      console.log("update failed");
      console.log(err);
    });
});

app.listen(80);

app.listen(port, function() {
  console.log("App listening on PORT: " + port);
});

module.exports = app;
