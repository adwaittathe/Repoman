var Sequelize = require("sequelize");

var sequelize = new Sequelize("repoman", "testuser", "Password@123", {
  host: "54.164.203.146",
  port: 3306,
  dialect: "mysql",
  pool: {
    max: 10,
    min: 0,
    idle: 1000,
  },
  define: {
    timestamps: false,
    raw: true,
  },
});

module.exports = sequelize;
