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
    res.render("customer", { userObj: {} });
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
    }).then(async result => {
      var url = "";
      for (var i = 0; i < result.length; i++) {
        //console.log(result[i].id + "/");
        var keyList = await listDirectories(result[i].id + "/insuranceImages/");
        //console.log("keyList.Contents.length");
        //console.log(keyList.Contents.length);
        var len = keyList.Contents.length;
        var URLList = [];
        for (var k = 0; k < len; k++) {
          //console.log(keyList.Contents[k].Key);
          var params = { Bucket: BUCKET_NAME, Key: keyList.Contents[k].Key };
          var url = await s3.getSignedUrl("getObject", params);
          //console.log(url);
          URLList.push(url);
        }
        result[i].URLList = URLList;
        // var URLList = [];
        // for (var j = 0; j < keyList.Contents.length; j++) {
        //   var params = { Bucket: BUCKET_NAME, Key: keyList.Contents[j].Key };
        //   var url = await s3.getSignedUrl("getObject", params);
        //   URLList.push(url);
        // }
        //console.log("---------_URL LIST _--------------");
        //console.log(keyList);
        //result[i].URLList = URLList;
      }
      // for (var i = 0; i < result.length; i++) {
      //   result[i].companyImgUrl = Base64ToURL(result[i].companyImg);
      //   result[i].insuredImg1Url = Base64ToURL(result[i].insuredImg1);
      //   result[i].insuredImg2Url = Base64ToURL(result[i].insuredImg2);
      //   result[i].insuredImg3Url = Base64ToURL(result[i].insuredImg3);
      //   result[i].insuredImg4Url = Base64ToURL(result[i].insuredImg4);
      //   result[i].insuredImg5Url = Base64ToURL(result[i].insuredImg5);
      //   result[i].insuredImg6Url = Base64ToURL(result[i].insuredImg6);
      //   result[i].insuredImg7Url = Base64ToURL(result[i].insuredImg7);
      //   result[i].insuredImg8Url = Base64ToURL(result[i].insuredImg8);
      // }
      //await listAllObjectsFromS3Bucket(BUCKET_NAME, "328");
      // var params = { Bucket: BUCKET_NAME, Key: "try/cat.jpg" };
      // s3.getObject(params, function(err, data) {
      //   if (err) {
      //     console.log(err);
      //     //return res.send({ error: err });
      //   }
      //   console.log("---------s3------");
      //   console.log(data.Body);
      // });
      // var keyList = await listDirectories();
      // for (var i = 0; i < keyList.Contents.length; i++) {
      //   var params = { Bucket: BUCKET_NAME, Key: keyList.Contents[i].Key };
      //   var s3OBJ = await s3.getObject(params).promise();
      //   var url = Base64ToURL(s3OBJ.Body);
      // }

      //console.log(dataArray);
      console.log(result);
      //res.json(result);
      res.render("stateSearch", { zipData: result, stateVal: stateVal });
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
};
