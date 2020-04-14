var Sequelize = require("sequelize");

var sequelize = new Sequelize("repoman", "testuser", "Password@123", {
  host: "ec2-54-164-203-146.compute-1.amazonaws.com",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
  operatorsAlias: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

module.exports = sequelize;
