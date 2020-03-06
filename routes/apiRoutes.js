var Repoman = require("../models/company.js");
var Sequelize = require("sequelize");
module.exports = function(app) {
  app.get("/api/all", function(req, res) {
    Repoman.findAll({ raw: true }).then(function(result) {
      console.log(result);
      res.json(result);
    });
  });
  app.get("/api/company/:id", function(req, res) {
    var idINT = parseInt(req.params.id);
    Repoman.findAll({
      raw: true,
      where: {
        id: idINT
      }
    }).then(function(result) {
      console.log(result);
      res.json(result);
    });
  });
  app.get("/api/state/:state", function(req, res) {
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
      res.json(result);
    });
  });
};
