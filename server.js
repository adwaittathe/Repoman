

var express = require("express");
var app = express();
var userModel = require("./models/user.js");
var db = require("./config/connection");
var session = require('express-session');
var cookieParser = require('cookie-parser');
var Sequelize = require("sequelize");
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var flash = require('connect-flash');
var port = process.env.PORT || 8080;
var path = require("path");
//var popup = require('popups');



//Possibly missing middleware for Passport but update to Express is causing an issue
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

// required for passport
app.use(session({
  secret: 'repomaisthepassphrase',
  resave: true,
  saveUninitialized: true
})); // session secret
//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// var User = sequelize.define('User', {
//   username: Sequelize.STRING,
//   lastname: Sequelize.STRING,
// });



require("./routes/htmlRoutes.js")(app);
require("./routes/apiRoutes.js")(app);

app.post('/login', function (req, response) {
  console.log(req.body);
  db.sync().then(function(){
    return userModel.findOne({
      where:{
        email : req.body.email
      }
    })
  }).then(function(res, err){
    if(res)
    {
      var user = new userModel(
        {
        firstName: res.firstName,
        lastName: res.lastName,
        email : res.email,
        password : res.password,
        company : res.company
        }
      )
      if(user.password != req.body.password)
      {
        response.render('login', {error : 'Please enter a valid password'});
      }
      else
      {
        response.sendFile(path.join(__dirname, "./public/customer.html"));
        console.log(JSON.stringify(user));
      }
      
    }
    else{
      response.render('login', {error : 'Please enter a valid email'});
      console.log("NO USER");
    }
  });

});

app.post('/register', function (req, res) {
  console.log(req.body);
  db.sync().then(function () {
    return userModel.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email : req.body.email,
      password : req.body.password,
      company : req.body.company
    });
  }).then(function (jane) {
    console.log(jane.get({
      plain: true
    }));
  });

});
//require("./routes/loginRoutes.js")(app);
//require("./config/passport.js")(passport); // pass passport for configuration

//passport.initialize() middleware is required to initialize Passport. Uses persistent login sessions, passport.session() middleware must also be used.

// passport.use(new LocalStrategy(
//   function(email, password, done) {
//     Email.findOne({ email: email }, function (err, email) {
//       if (err) { return done(err); }
//       if (!email) {
//         return done(null, false, { message: 'Incorrect Email.' });
//       }
//       if (!email.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, email);
//     });
//   }
// ));

// app.post('/login', function(request, response) {
//   console.log("USER ADDDD");
// 	var email = request.body.email;
// 	var password = request.body.password;
// 	if (email && password) {
// 		connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
// 			if (results.length > 0) {
// 				request.session.loggedin = true;
// 				request.session.email = email;
// 				response.redirect('/customer');
// 			} else {
// 				response.send('Incorrect Email and/or Password!');
// 			}			
// 			response.end();
// 		});
// 	} else {
// 		response.send('Please enter Email and Password!');
// 		response.end();
// 	}
// });

// app.post('/login',(req,res)=>{
//   console.log(req.user);
//   console.log("USER ADDDD");
//   if(req.user != undefined || req.user != null){
//       res.send(req.user);
//   }else{
//       res.send("not able to generate the token.username or password incorrect.");
//   }
// });

// Standerd middleware taking req, res and next as parameters
// function loggedIn(req, res, next) {
//   if (req.user) { // if request contains the user
//       next(); // call next
//   } else {
//       res.status(403).send("Unauthorized")  // throwing unauthorized
//   }
// }

// passport.serializeUser(function(email, done) {
//   done(null, email.id);
// });

// passport.deserializeUser(function(id, done) {
//   Email.findById(id, function(err, email) {
//     done(err, email);
//   });
// })

// app.post('/login',function(req, res) {
//        console.log("user info");
//        //res.redirect('/customer?username=' + req.user.email);
// });

// app.post('/login',
//   passport.authenticate('local', { successRedirect: './public/customer',
//                                    failureRedirect: './public/login' }),
//     function(req, res) {
//        res.redirect('/customer?username=' + req.user.email);
//     });



// app.get('/login', function(request, response) {
// 	if (request.session.loggedin) {
// 		response.send('Welcome back, ' + request.session.email + '!');
// 	} else {
// 		response.send('Please login to view this page!');
// 	}
// 	response.end();
// });

/* route to handle login and registration */
// app.post('/api/register',registerController.register);
// app.post('/api/authenticate',authenticateController.authenticate);

// console.log(authenticateController);
// app.post('/controllers/register-controller', registerController.register);
// app.post('/controllers/authenticate-controller', authenticateController.authenticate);
app.listen(8012);


// db.sequelize.sync({ force: false }).then(function() {
app.listen(port, function () {
  console.log("App listening on PORT: " + port);
});
// })
module.exports = app;

