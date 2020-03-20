//Definations
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
dotenv.config();
const fs = require("fs");

const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Password
  }
});

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

//----------------------------------------------------Functions------------------------------------------------------

async function sendMail(obj) {
  var mailOptions = {
    to: "adwait.tathe@gmail.com",
    subject: `New Company with name ${obj.company} is registered`,
    html: `
    <h4> Hi, <h4>
    <h4> Hope you are having a good day! <h4>
    <h4> New company is registered in Repoman <h4>
    <h4> Please find the details below <h4>
    <p/>
    <h4> Name : ${obj.company} </h4>
    <h4> State : ${obj.state} </h4>
    <h4> Phone Number : ${obj.phoneNo} </h4>
    <h4> Website : ${obj.website} </h4>
    <p/>
    <h4>Thank You</h4>
    <h4>Repoman Team</h4>
    `
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

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
const listDirectories = prefix => {
  return new Promise((resolve, reject) => {
    const s3params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix
    };
    s3.listObjectsV2(s3params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
      return data;
    });
  });
};
getSideBarImages();
var SideBarImagesList = [];
async function getSideBarImages() {
  SideBarImagesList = [];
  var keyList = await listDirectories("Side Bar Images/");
  var len = keyList.Contents.length;
  for (var k = 1; k < len; k++) {
    var params = { Bucket: BUCKET_NAME, Key: keyList.Contents[k].Key };
    var url = await s3.getSignedUrl("getObject", params);
    SideBarImagesList.push(url);
  }
}

function validation(pass1, pass2) {
  if (pass1 == pass2) {
    return true;
  } else {
    return false;
  }
}
//----------------------------------------------------Routing------------------------------------------------------
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
        response.render("zipDisplay", {
          zipData: d,
          SideBarImagesList: SideBarImagesList
        });
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
  res.render("addCompany", {
    userObj: {},
    error: "",
    SideBarImagesList: SideBarImagesList
  });
});

app.post("/addCompany", (req, res) => {
  var sess = req.session;
  var obj = {};
  var path = null;
  var filename = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {
      //console.log(name, field);
      switch (name) {
        case "state":
          obj.state = field;
          break;
        case "country":
          obj.country = field;
          break;
        case "company":
          obj.company = field;
          break;
        case "phoneNo":
          obj.phoneNo = field;
          break;
        case "address1":
          obj.address1 = field;
          break;
        case "address2":
          obj.address2 = field;
          break;
        case "website":
          obj.website = field;
          break;
        case "companyDesc":
          obj.companyDesc = field;
          break;
        case "faxNo":
          obj.faxNo = field;
          break;
        case "zip":
          obj.zip = field;
          break;
      }
    })
    .on("end", () => {
      var url = obj.company + "/companyLogo/" + filename;
      db.sync()
        .then(function() {
          return companyModel.create({
            State: obj.state,
            Country: obj.country,
            "Company Name": obj.company,
            "Phone Number": obj.phoneNo,
            Address1: obj.address1,
            Address2: obj.address2,
            userId: sess.userId,
            Website: obj.website,
            Description: obj.companyDesc,
            "Fax Number": obj.faxNo,
            Zip: obj.zip,
            isApproved: 0
          });
        })
        .then(function(result, error) {
          if (result) {
            uploadFile(path, url);
            sendMail(obj);
            console.log("USER SESSION");
            var userObject = sess.user;
            console.log(userObject);
            console.log("SESSION");
            console.log(sess);
            res.render("customer", {
              userObj: userObject,
              SideBarImagesList: SideBarImagesList
            });
          }
          if (error) {
            console.log(error);
          }
        });
    });
});

app.post("/addAdvertiseImage", (req, res) => {
  console.log(req.body);
  var path = null;
  var filename = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {
      console.log(name, field);
    })
    .on("end", () => {
      var url = "Side Bar Images/" + filename;
      uploadFile(path, url);
    });
});

app.post("/addInsurance", (req, res) => {
  console.log(req.body);
  var path = null;
  var filename = null;
  var Compname = null;
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
      if (name == "name") {
        Compname = field;
      }
      if (name == "stateVal") {
        st = field;
      }
    })
    .on("end", () => {
      var url = Compname + "/insuranceImages/" + filename;
      uploadFile(path, url);
      res.redirect("/state/" + st);
    });
});

app.post("/addMap", (req, res) => {
  console.log(req.body);
  var path = null;
  var filename = null;
  var Compname = null;
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
      if (name == "name") {
        Compname = field;
      }
      if (name == "stateVal") {
        st = field;
      }
    })
    .on("end", () => {
      var url = Compname + "/companyInfo/map.pdf";
      uploadFile(path, url);
      res.redirect("/state/" + st);
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
    .then(async function(res, err) {
      if (res) {
        console.log(res);
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
          response.render("login", {
            error: "Please enter a valid password",
            SideBarImagesList: SideBarImagesList
          });
          return;
        } else {
          var sess = req.session;
          sess.email = res.email;
          sess.userId = res.id;
          var obj = {
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email,
            isAdmin: res.isAdmin
          };
          sess.user = obj;
          response.render("customer", {
            userObj: obj,
            SideBarImagesList: SideBarImagesList
          });
        }
      } else {
        response.render("login", {
          error: "Please enter a valid email",
          SideBarImagesList: SideBarImagesList
        });
      }
    });
});

app.post("/register", async function(req, response) {
  if (!validation(req.body.password, req.body.confirmpassword)) {
    response.render("register", {
      userObj: req.body,
      error: "Password and Confirm password should be same",
      SideBarImagesList: SideBarImagesList
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
          email: userCreateResult.email,
          isAdmin: 0
        };
        sess.user = obj;

        response.render("customer", {
          userObj: obj,
          SideBarImagesList: SideBarImagesList
        });
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
        response.render("update", {
          userObj: user,
          SideBarImagesList: SideBarImagesList
        });
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
      console.log("UPDATE RESULT");
      console.log(result);
      res.render("updateCompany", {
        userObj: result,
        error: "",
        SideBarImagesList: SideBarImagesList
      });
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

app.get("/admin", async function(req, res) {
  let ToBeApprovedList = await companyModel.findAll({
    raw: true,
    where: {
      isApproved: 0
    },
    order: [["Listing Level", "DESC"]]
  });
  let ApprovedList = await companyModel.findAll({
    raw: true,
    where: {
      isApproved: 1
    },
    order: [["Listing Level", "DESC"]]
  });

  res.render("admin", {
    newList: ToBeApprovedList,
    oldList: ApprovedList,
    SideBarImagesList: SideBarImagesList
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
          response.render("customer", {
            userObj: obj,
            SideBarImagesList: SideBarImagesList
          });
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
