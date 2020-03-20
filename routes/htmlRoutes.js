var path = require("path");
// Requiring our custom middleware for checking if a user is logged in
//var isAuthenticated = require("../config/middleware/isAuthenticated");
var Repoman = require("../models/company.js");
var Sequelize = require("sequelize");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.KeyId,
  secretAccessKey: process.env.AccessKey
});
const BUCKET_NAME = "repoman-data";

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

module.exports = function(app) {
  app.get("/", function(req, res) {
    res.render("index", { SideBarImagesList: SideBarImagesList });
    //res.sendFile(path.join(__dirname, "../public/index.html"));
  });
  app.get("/index", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/index.html"));
    res.render("index", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/aboutRepoman", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/aboutRepoman.html"));
    res.render("aboutRepoman", { SideBarImagesList: SideBarImagesList });
  });

  app.get("/aboutUSAWeb", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/aboutUSAWeb.html"));
    res.render("aboutUSAWeb", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/contactUs", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/contactUs.html"));
    res.render("contactUs", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/directory", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/directory.html"));
    res.render("index", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/insurance", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/insurance.html"));
    res.render("insurance", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/listingOptions", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/listingOptions.html"));
    res.render("listingOptions", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/sitePolicy", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/sitePolicy.html"));
    res.render("sitePolicy", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/refund", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/refund.html"));
    res.render("refund", { SideBarImagesList: SideBarImagesList });
  });
  app.get("/vendors", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/vendors.html"));
    res.render("vendors", { SideBarImagesList: SideBarImagesList });
  });

  app.get("/login", function(req, res) {
    res.render("login", { error: "", SideBarImagesList: SideBarImagesList });
    //res.sendFile(path.join(__dirname, "../public/login.html"))
  });
  app.get("/register", function(req, res) {
    //res.sendFile(path.join(__dirname, "../public/register.html"));
    res.render("register", {
      userObj: {},
      error: "",
      SideBarImagesList: SideBarImagesList
    });
  });
  app.get("/customer", function(req, res) {
    res.render("customer", {
      userObj: {},
      SideBarImagesList: SideBarImagesList
    });
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

  app.get("/state/:state", async function(req, res) {
    var stateVal = req.params.state.toUpperCase();
    Repoman.findAll({
      raw: true,
      where: {
        state: {
          [Sequelize.Op.substring]: stateVal
        }
      },
      order: [["Listing Level", "DESC"]]
    }).then(async result => {
      var url = "";
      for (var i = 0; i < result.length; i++) {
        console.log(result[i]);
        var keyList = await listDirectories(
          result[i]["Company Name"] + "/insuranceImages/"
        );
        var len = keyList.Contents.length;
        var URLList = [];
        for (var k = 0; k < len; k++) {
          var params = { Bucket: BUCKET_NAME, Key: keyList.Contents[k].Key };
          var url = await s3.getSignedUrl("getObject", params);
          URLList.push(url);
        }
        result[i].URLList = URLList;
        var logoPath = await listDirectories(
          result[i]["Company Name"] + "/companyLogo/"
        );
        var logoparams = { Bucket: BUCKET_NAME, Key: logoPath.Contents[0].Key };
        var companyLogoUrl = await s3.getSignedUrl("getObject", logoparams);
        result[i].companyLogoUrl = companyLogoUrl;

        var mapparams = {
          Bucket: BUCKET_NAME,
          Key: result[i]["Company Name"] + "/companyInfo/map.pdf"
        };
        var companyMapUrl = await s3.getSignedUrl("getObject", mapparams);
        result[i].companyMapUrl = companyMapUrl;
      }
      res.render("stateSearch", {
        zipData: result,
        stateVal: stateVal,
        SideBarImagesList: SideBarImagesList
      });
    });
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
};
