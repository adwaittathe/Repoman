
var Sequelize = require("sequelize");
var sequelize = require("../config/connection.js");

var Repoman = sequelize.define("customer_info", {
  
  state: Sequelize.STRING,
  companyName: Sequelize.STRING,
  phoneNumber: Sequelize.STRING,
  address: Sequelize.STRING,
  name: Sequelize.STRING,
  username: Sequelize.STRING,
  lastPaid: Sequelize.STRING,
  listingLevel: Sequelize.STRING,
  id: {type: Sequelize.INTEGER, primaryKey: true}
  
}, {
 
  freezeTableName: true,
  timestamps: false,
});
module.exports = Repoman;


