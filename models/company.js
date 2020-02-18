var Sequelize = require("sequelize");
var sequelize = require("../config/connection.js");

var Repoman = sequelize.define(
  "company_info",
  {
    State: Sequelize.STRING,
    "Company Name": Sequelize.STRING,
    "Phone Number": Sequelize.STRING,
    Address: Sequelize.STRING,
    Name: Sequelize.STRING,
    Username: Sequelize.STRING,
    "Last Paid": Sequelize.STRING,
    "Listing Level": Sequelize.STRING,
    Zip: Sequelize.STRING
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);
module.exports = Repoman;
