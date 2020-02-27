var Sequelize = require("sequelize");
var sequelize = require("../config/connection.js");

var Repoman = sequelize.define(
  "company_info",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    State: Sequelize.STRING,
    "Company Name": Sequelize.STRING,
    "Phone Number": Sequelize.STRING,
    Address: Sequelize.STRING,
    Name: Sequelize.STRING,
    Username: Sequelize.STRING,
    "Last Paid": Sequelize.STRING,
    "Listing Level": Sequelize.STRING,
    Zip: Sequelize.STRING,
    companyImg: Sequelize.BLOB,
    isInsured: Sequelize.INTEGER,
    insuredImg1: Sequelize.BLOB,
    insuredImg2: Sequelize.BLOB,
    insuredImg3: Sequelize.BLOB,
    insuredImg4: Sequelize.BLOB,
    insuredImg5: Sequelize.BLOB,
    insuredImg6: Sequelize.BLOB,
    insuredImg7: Sequelize.BLOB,
    insuredImg8: Sequelize.BLOB,
    insuredImg9: Sequelize.BLOB,
    insuredImg10: Sequelize.BLOB,
    insuredImg11: Sequelize.BLOB,
    insuredImg12: Sequelize.BLOB,
    insuredImg13: Sequelize.BLOB,
    insuredImg14: Sequelize.BLOB,
    insuredImg15: Sequelize.BLOB,
    areaMap: Sequelize.BLOB,
    infoPack: Sequelize.BLOB
  },

  {
    freezeTableName: true,
    timestamps: false
  }
);
module.exports = Repoman;
