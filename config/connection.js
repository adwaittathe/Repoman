var Sequelize = require("sequelize");

 var sequelize = new Sequelize("repoman", "jjackley55", "R3poMan$", {
     host: "repoman.repoman.dreamhosters.com",
     port: 3306,
     dialect: "mysql",
     pool: {
         max: 5,
         min: 0,
         idle: 10000
     },
     define: {
         timestamps: false,
         raw: true
     },
});
//var sequelize = new Sequelize("test", "root", "root", {
//    host: "localhost",
//    port: 3306,
//    dialect: "mysql",
//    pool: {
//        max: 5,
//        min: 0,
//        idle: 10000
//    },
//    define: {
//        timestamps: false,
//        raw: true
//    },

//});


module.exports = sequelize