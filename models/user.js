var Sequelize = require("sequelize");
//var db = require("./config/connection");
var db = require("../config/connection");

var User = db.define('User', {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email:Sequelize.STRING,
    password : Sequelize.STRING,
    company: Sequelize.STRING,
});

module.exports = User