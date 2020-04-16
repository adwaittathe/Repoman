var path = require("path");
// Requiring our custom middleware for checking if a user is logged in
//var isAuthenticated = require("../config/middleware/isAuthenticated");
var Repoman = require("../models/company.js");
var Sequelize = require("sequelize");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
var userModel = require("../models/user.js");
dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.KeyId,
  secretAccessKey: process.env.AccessKey,
});
const BUCKET_NAME = "repoman-data";

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

//getSideBarImages();
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

module.exports = function (app) {
  app.get("/", async function (req, res) {
    await getSideBarImages();
    res.render("index", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/index", async function (req, res) {
    await getSideBarImages();
    res.render("index", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/aboutRepoman", function (req, res) {
    res.render("aboutRepoman", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });

  app.get("/aboutUSAWeb", function (req, res) {
    res.render("aboutUSAWeb", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/contactUs", function (req, res) {
    res.render("contactUs", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/directory", function (req, res) {
    res.render("index", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/insurance", function (req, res) {
    res.render("insurance", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/listingOptions", function (req, res) {
    res.render("listingOptions", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/sitePolicy", function (req, res) {
    res.render("sitePolicy", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/refund", function (req, res) {
    res.render("refund", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/vendors", function (req, res) {
    res.render("vendors", {
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });

  app.get("/login", function (req, res) {
    res.render("login", {
      error: "",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });
  app.get("/register", function (req, res) {
    res.render("register", {
      userObj: {},
      error: "",
      SideBarImagesList: SideBarImagesList,
      login: req.session.user,
    });
  });

  app.get("/state/:state", async function (req, res) {
    var stateVal = req.params.state.toUpperCase();
    var sess = req.session;
    var isAdmin = false;
    if (sess.user) {
      var userObject = req.session.user;
      let user = await userModel.findOne({
        where: {
          email: userObject.email,
        },
      });
      if (user.isAdmin == 1) {
        isAdmin = true;
      }
    }
    Repoman.findAll({
      raw: true,
      where: {
        state: {
          [Sequelize.Op.substring]: stateVal,
        },
      },
      order: [["Listing Level", "DESC"]],
    }).then(async (result) => {
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
          var insuranceURL = await s3.getSignedUrl("getObject", insuranceParam);
          insuranceurllist.push(insuranceURL);
        }
        result[i].URLList = insuranceurllist;
        if (result[i].imageUrl != "" && result[i].imageUrl != null) {
          var logoparams = {
            Bucket: BUCKET_NAME,
            Key: result[i].imageUrl,
          };
          var companyLogoUrl = await s3.getSignedUrl("getObject", logoparams);
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
      }
      res.render("stateSearch", {
        zipData: result,
        stateVal: stateVal,
        SideBarImagesList: SideBarImagesList,
        isAdmin: isAdmin,
        login: req.session.user,
      });
    });
  });
  // app.get("/company/:id", function (req, res) {
  //   res.sendFile(path.join(__dirname, "../public/companyView.html"));
  // });
};
