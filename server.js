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
var port = process.env.PORT || 80;
const multer = require("multer");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
const fs = require("fs");

const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Password,
  },
});

const s3 = new AWS.S3({
  accessKeyId: process.env.KeyId,
  secretAccessKey: process.env.AccessKey,
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
    saveUninitialized: true,
  })
);
app.use(flash());

require("./routes/htmlRoutes.js")(app);
require("./routes/apiRoutes.js")(app);

//----------------------------------------------------Functions------------------------------------------------------

const listDirectories = (prefix) => {
  return new Promise((resolve, reject) => {
    const s3params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
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
async function test() {
  var companyData = await companyModel.findOne({
    where: {
      id: 1544,
    },
  });
  var string = JSON.stringify(companyData);
  var companyINFO = JSON.parse(string);
}
//test();

function sendMailAfterRegistration(obj) {
  var mailOptions = {
    to: "adwait.tathe@gmail.com",
    subject: `New Company with name ${obj.company} is registered`,
    text: `
  Hi, 
  Hope you are having a good day! 
  New company is registered in Repoman 
  Please find the details below \n
  Name : ${obj.company} 
  State : ${obj.state}
  Phone Number : ${obj.phoneNo}
  Website : ${obj.website} \n
  Thank You
  Repoman Team`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

async function resetPasswordMail(token, email) {
  var mailOptions = {
    to: email,
    subject: `Reset Password`,
    text:
      "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
      "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
      "http://" +
      "localhost:8080" +
      "/reset/" +
      token +
      "\n\n" +
      "If you did not request this, please ignore this email and your password will remain unchanged.\n",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

const uploadFile = async (fileName, key) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
  };
  s3.upload(params, function (err, data) {
    if (err) {
      console.log("ERROR");
      console.log(err);
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
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

app.get("/zip", function (req, res) {
  res.redirect("/");
});
app.post("/zip", async function (req, res) {
  var url =
    "https://www.zipcodeapi.com/rest/CIkJigsGbUqnlUGDkGHrddrqhBofshJNxp1Xf3xXPGWxfFmBEruccI2tMKs7HGb6/radius.json/" +
    req.body.zipCode +
    "/" +
    req.body.mileSearch +
    "/miles";
  var urlVal = await fetch(url);
  const data = await urlVal.json();
  const zipArray = data.zip_codes;

  if (data && zipArray) {
    var zipList = [];
    for (var i = 0; i < zipArray.length; i++) {
      var obj = zipArray[i];
      zipList.push(obj.zip_code);
    }
    var Op = Sequelize.Op;
    db.sync()
      .then(function () {
        return companyModel.findAll({
          where: {
            Zip: {
              [Op.in]: zipList,
            },
          },
          order: [["Listing Level", "DESC"]],
        });
      })
      .then(async function (result, err) {
        if (result) {
          for (var i = 0; i < result.length; i++) {
            var list = [];
            if (result[i].insuranceUrl) {
              list = result[i].insuranceUrl.split("||");
            }
            var insuranceurllist = [];
            for (var k = 0; k < list.length; k++) {
              var insuranceParam = {
                Bucket: BUCKET_NAME,
                Key: list[k],
              };
              var insuranceURL = await s3.getSignedUrl(
                "getObject",
                insuranceParam
              );
              insuranceurllist.push(insuranceURL);
            }
            result[i].URLList = insuranceurllist;
            if (result[i].imageUrl != "" && result[i].imageUrl != null) {
              var logoparams = {
                Bucket: BUCKET_NAME,
                Key: result[i].imageUrl,
              };
              var companyLogoUrl = await s3.getSignedUrl(
                "getObject",
                logoparams
              );
              result[i].companyLogoUrl = companyLogoUrl;
            }

            var mapparams = {
              Bucket: BUCKET_NAME,
              Key: result[i]["Company Name"] + "/companyInfo/map",
            };
            var companyMapUrl = await s3.getSignedUrl("getObject", mapparams);
            result[i].companyMapUrl = companyMapUrl;
            var Informationparams = {
              Bucket: BUCKET_NAME,
              Key: result[i]["Company Name"] + "/companyInfo/InformationPacket",
            };
            var InfoPacketUrl = await s3.getSignedUrl(
              "getObject",
              Informationparams
            );
            result[i].InfoPacketUr = InfoPacketUrl;
            console.log(InfoPacketUrl);
          }
          res.render("zipDisplay", {
            zipData: result,
            SideBarImagesList: SideBarImagesList,
            login: req.session.user,
          });
        }
      });
  }
});

app.post("/upload", (req, res) => {
  new formidable.IncomingForm().parse(req).on("file", (name, file) => {
    uploadFile(file.path);
  });
});

app.get("/addCompany", (req, res) => {
  if (req.session.user) {
    res.render("addCompany", {
      userObj: {},
      error: "",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/addCompany", (req, res) => {
  var sess = req.session;
  var obj = {};
  var path = null;
  var filename = "";
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
      if (filename != "") {
        filename = obj.company + "/companyLogo/" + filename;
      }

      db.sync()
        .then(function () {
          return companyModel.create({
            State: obj.state,
            Country: obj.country,
            "Company Name": obj.company,
            "Phone Number": obj.phoneNo,
            Address1: obj.address1,
            Address2: obj.address2,
            userId: sess.email,
            Website: obj.website,
            Description: obj.companyDesc,
            "Fax Number": obj.faxNo,
            "Listing Level": 0,
            Zip: obj.zip,
            isApproved: 0,
            imageUrl: filename,
          });
        })
        .then(function (result, error) {
          if (result) {
            if (filename != "") {
              uploadFile(path, filename);
            }
            sendMailAfterRegistration(obj);
            var userObject = sess.user;
            res.render("customer", {
              userObj: userObject,
              SideBarImagesList: SideBarImagesList,
              login: req.session.user,
            });
          }
          if (error) {
            console.log(error);
          }
        });
    });
});
app.get("/passwordReset", function (req, res) {
  res.render("passwordreset", {
    message: "",
    SideBarImagesList: SideBarImagesList,
    login: req.session.user,
  });
});

app.post("/passwordReset", async function (req, res) {
  let user = await userModel.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (user) {
    const token = jwt.sign({ _email: req.body.email }, process.env.TOKEN_KEY);
    await resetPasswordMail(token, req.body.email);
    res.render("passwordreset", {
      message: "Email is been sent with reset password instructions",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  } else {
    res.render("passwordreset", {
      message: "The user with this email do not exist",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  }
});

app.get("/reset/:token", function (req, res) {
  const token = req.params.token;
  const tokendata = jwt.verify(token, process.env.TOKEN_KEY);
  const userEmail = tokendata._email;
  res.render("newPassword", {
    email: userEmail,
    message: "",
    SideBarImagesList: SideBarImagesList,
    login: req.session.user,
  });
});

app.post("/newPassword", async function (req, res) {
  if (!validation(req.body.newPassword, req.body.confirmPassword)) {
    res.render("newPassword", {
      email: req.body.emailID,
      message: "Password and Confirm password should be same",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(req.body.newPassword, salt);
  userModel
    .update(
      {
        password: hashPass,
      },
      { where: { email: req.body.emailID } }
    )
    .then((result) => {
      console.log("Password updated successfully");
      res.render("login", {
        error: "Password updated successfully",
        SideBarImagesList: SideBarImagesList,
        login: req.session.user,
      });
    })
    .catch((err) => {
      console.log("update failed");
      console.log(err);
    });
});

app.post("/addAdvertiseImage", (req, res) => {
  var sess = req.session;
  var path = null;
  var filename = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {})
    .on("end", () => {
      var url = "Side Bar Images/" + filename;
      uploadFile(path, url);
      res.redirect("/customer");
    });
});

app.post("/addInsurance", (req, res) => {
  var path = null;
  var filename = null;
  var Compname = null;
  var st = null;
  var id = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {
      if (name == "name") {
        Compname = field;
      }
      if (name == "stateVal") {
        st = field;
      }
      if (name == "URLList") {
        URLList = field;
      }
      if (name == "id") {
        id = field;
      }
    })
    .on("end", async () => {
      if (filename != null && filename && filename != "") {
        var companyData = await companyModel.findOne({
          where: {
            id: id,
          },
        });
        var string = JSON.stringify(companyData);

        var companyINFO = JSON.parse(string);
        let uploadURL = Compname + "/insuranceImg/" + filename;
        let DBURL = Compname + "/insuranceImg/" + filename;
        if (
          companyINFO.insuranceUrl != null &&
          companyINFO.insuranceUrl != ""
        ) {
          DBURL = companyINFO.insuranceUrl + "||" + uploadURL;
        }
        uploadFile(path, uploadURL);
        companyModel
          .update(
            {
              insuranceUrl: DBURL,
            },
            { where: { id: id } }
          )
          .then((result) => {
            res.redirect("/state/" + st);
          })
          .catch((err) => {});
      } else {
        res.redirect("/state/" + st);
      }
    });
});

app.post("/addMap", (req, res) => {
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
      if (name == "name") {
        Compname = field;
      }
      if (name == "stateVal") {
        st = field;
      }
    })
    .on("end", () => {
      var url = Compname + "/companyInfo/map";
      uploadFile(path, url);
      res.redirect("/state/" + st);
    });
});

app.post("/addInformationPacket", (req, res) => {
  var path = null;
  var filename = null;
  var Compname = null;
  var st = null;
  new formidable.IncomingForm()
    .parse(req)
    .on("file", (name, file) => {
      path = file.path;
      filename = file.name;
    })
    .on("field", (name, field) => {
      if (name == "name") {
        Compname = field;
      }
      if (name == "stateVal") {
        st = field;
      }
    })
    .on("end", () => {
      var url = Compname + "/companyInfo/InformationPacket";
      uploadFile(path, url);
      res.redirect("/state/" + st);
    });
});

app.post("/login", function (req, response) {
  //req.session.destroy();
  getSideBarImages();
  db.sync()
    .then(function () {
      return userModel.findOne({
        where: {
          email: req.body.email,
        },
      });
    })
    .then(async function (res, err) {
      if (res) {
        var user = new userModel({
          id: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          password: res.password,
        });
        const validatePass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!validatePass) {
          response.render("login", {
            error: "Please enter a valid password",
            SideBarImagesList: SideBarImagesList,
            login: req.session.user,
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
            isAdmin: res.isAdmin,
          };
          sess.user = obj;
          response.redirect("/customer");
        }
      } else {
        response.render("login", {
          error: "Please enter a valid email",
          SideBarImagesList: SideBarImagesList,
          login: req.session.user,
        });
      }
    });
});
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});
app.get("/customer", function (req, res) {
  if (req.session.user) {
    var obj = req.session.user;
    res.render("customer", {
      userObj: obj,
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/register", async function (req, response) {
  getSideBarImages();
  if (!validation(req.body.password, req.body.confirmpassword)) {
    response.render("register", {
      userObj: req.body,
      error: "Password and Confirm password should be same",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(req.body.password, salt);
  db.sync()
    .then(function () {
      return userModel.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashPass,
      });
    })
    .then(function (userCreateResult, error) {
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
          isAdmin: 0,
        };
        sess.user = obj;
        response.redirect("/customer");
      }
    });
});

app.get("/update", function (req, response) {
  var sess = req.session;
  if (req.session.user) {
    db.sync()
      .then(function () {
        return userModel.findOne({
          where: {
            email: sess.email,
          },
        });
      })
      .then(function (res, err) {
        if (res) {
          var user = new userModel({
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email,
            password: res.password,
            company: res.company,
          });
          response.render("update", {
            userObj: user,
            SideBarImagesList: SideBarImagesList,
            login: req.session.user,
          });
        }
      });
  } else {
    response.redirect("/login");
  }
});

app.get("/company/:id", function (req, res) {
  if (req.session.user) {
    var companyId = req.params.id;
    companyModel
      .findOne({
        raw: true,
        where: {
          id: companyId,
        },
      })
      .then((result) => {
        res.render("updateCompany", {
          userObj: result,
          error: "",
          SideBarImagesList: SideBarImagesList,
          login: req.session.user,
        });
      });
  } else {
    res.redirect("/login");
  }
});

// app.post("/updateComp", function (req, res) {
//   var companyId = req.body.id;
//   companyModel
//     .findOne({
//       raw: true,
//       where: {
//         id: companyId,
//       },
//     })
//     .then((result) => {
//       res.render("updateCompany", {
//         userObj: result,
//         error: "",
//         SideBarImagesList: SideBarImagesList,
//         login: req.session.user,
//       });
//     });
// });

app.post("/deleteCompany", function (req, res) {
  var companyId = req.body.companyId;
  console.log(companyId);
  companyModel
    .findOne({
      raw: true,
      where: {
        id: companyId,
      },
    })
    .then((result) => {
      result.destroy();
      res.redirect("/admin");
    });
});

app.get("/delete/:id", async function (req, res) {
  if (req.session.user) {
    var companyId = req.params.id;
    var userObject = req.session.user;
    let user = await userModel.findOne({
      where: {
        email: userObject.email,
      },
    });
    if (user.isAdmin == 1) {
      companyModel
        .destroy({
          where: {
            id: companyId, //this will be your id that you want to delete
          },
        })
        .then(
          function (rowDeleted) {
            // rowDeleted will return number of rows deleted
            if (rowDeleted === 1) {
              console.log("Deleted successfully");
              res.redirect("/admin");
            }
          },
          function (err) {
            console.log(err);
          }
        );
    } else {
      res.redirect("/customer");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/approveCompany", function (req, res) {
  var sess = req.session;
  var obj = {};
  var path = null;
  var filename = "";
  var approved = 0;
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
        case "companyId":
          obj.companyId = field;
          break;
        case "imageUrl":
          obj.imageUrl = field;
          break;
        case "approve":
          approved = 1;
          break;
        case "lastPaid":
          obj.lastPaid = field;
          break;
        case "listingLevel":
          obj.listingLevel = field;
          break;
        case "isInsured":
          obj.isInsured = field;
          break;
      }
    })
    .on("end", () => {
      if (filename != "") {
        filename = obj.company + "/companyLogo/" + filename;
      } else {
        filename = obj.imageUrl;
      }
      console.log(obj);
      if (approved == 1) {
        companyModel
          .update(
            {
              State: obj.state,
              Country: obj.country,
              "Company Name": obj.company,
              "Phone Number": obj.phoneNo,
              Address1: obj.address1,
              Address2: obj.address2,
              Website: obj.website,
              Description: obj.companyDesc,
              "Fax Number": obj.faxNo,
              "Listing Level": 0,
              Zip: obj.zip,
              imageUrl: filename,
              isApproved: 1,
              LastPaid: obj.lastPaid,
              "Listing Level": obj.listingLevel,
              isInsured: obj.isInsured,
            },
            { where: { id: obj.companyId } }
          )
          .then((result) => {
            if (filename != "") {
              uploadFile(path, filename);
            }
            res.redirect("/admin");
          })
          .catch((err) => {
            console.log("update failed");
            console.log(err);
          });
      } else {
        companyModel
          .update(
            {
              State: obj.state,
              Country: obj.country,
              "Company Name": obj.company,
              "Phone Number": obj.phoneNo,
              Address1: obj.address1,
              Address2: obj.address2,
              Website: obj.website,
              Description: obj.companyDesc,
              "Fax Number": obj.faxNo,
              Zip: obj.zip,
              imageUrl: filename,
              LastPaid: obj.lastPaid,
              "Listing Level": obj.listingLevel,
              isInsured: obj.isInsured,
            },
            { where: { id: obj.companyId } }
          )
          .then((result) => {
            if (filename != "" && filename != obj.imageUrl) {
              uploadFile(path, filename);
            }
            res.redirect("/admin");
          })
          .catch((err) => {
            console.log("update failed");
            console.log(err);
          });
      }
    });
});

app.get("/admin", async function (req, res) {
  if (req.session.user) {
    var userObject = req.session.user;

    let user = await userModel.findOne({
      where: {
        email: userObject.email,
      },
    });
    if (user.isAdmin == 1) {
      let ToBeApprovedList = await companyModel.findAll({
        raw: true,
        where: {
          isApproved: 0,
        },
        order: [["Company Name"]],
      });
      let ApprovedList = await companyModel.findAll({
        raw: true,
        where: {
          isApproved: 1,
        },
        order: [["Company Name"]],
      });

      res.render("admin", {
        newList: ToBeApprovedList,
        oldList: ApprovedList,
        SideBarImagesList: SideBarImagesList,
        login: req.session.user,
      });
    } else {
      res.redirect("/customer");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/update", function (req, response) {
  var sess = req.session;

  userModel
    .update(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        company: req.body.company,
      },
      { where: { email: sess.email } }
    )
    .then((result) => {
      console.log("Details updated successfully");
      companyModel
        .update(
          {
            "Company Name": req.body.company,
            Name: req.body.firstName + " " + req.body.lastName,
            Username: req.body.email,
          },
          { where: { Username: sess.email } }
        )
        .then((res) => {
          var obj = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            company: req.body.company,
          };
          sess.email = req.body.email;
          response.render("customer", {
            userObj: obj,
            SideBarImagesList: SideBarImagesList,
            login: req.session.user,
          });
        });
    })
    .catch((err) => {
      console.log("update failed");
      console.log(err);
    });
});

async function sendMail(email, subject, text) {
  var mailOptions = {
    from: email,
    to: "birch.joey20@gmail.com",
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.post("/contactUs", (res, req) => {
  const { subject, email, text } = res.body;
  sendMail(email, subject, text, function (err, data) {
    if (err) {
      res.status(500).json({ message: "Internal Error" });
    } else {
      res.json({ message: "Email sent" });
    }
  });
});

//app.listen(80);

app.listen(port, function () {
  console.log("App listening on PORT: " + port);
});

module.exports = app;
