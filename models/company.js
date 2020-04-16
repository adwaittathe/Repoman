var Sequelize = require("sequelize");
var sequelize = require("../config/connection.js");

var Repoman = sequelize.define(
  "company_info",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    State: Sequelize.STRING,
    Country: Sequelize.STRING,
    Website: Sequelize.STRING,
    "Company Name": Sequelize.STRING,
    "Phone Number": Sequelize.STRING,
    "Fax Number": Sequelize.STRING,
    Description: Sequelize.STRING,
    Address1: Sequelize.STRING,
    Address2: Sequelize.STRING,
    userId: Sequelize.INTEGER,
    LastPaid: Sequelize.STRING,
    "Listing Level": Sequelize.STRING,
    Zip: Sequelize.STRING,
    isApproved: Sequelize.INTEGER,
    imageUrl: Sequelize.STRING,
    insuranceUrl: Sequelize.STRING,
    isInsured: Sequelize.INTEGER,
  },

  {
    freezeTableName: true,
    timestamps: false,
  }
);
module.exports = Repoman;
