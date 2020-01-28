var Repoman = require("../models/company.js");
var Sequelize = require("sequelize")
//var auth = require("../config/middleware/isAuthenticated.js")
const passport = require("passport"),
LocalStrategy = require('passport-local').Strategy;
// module.exports = function(app, passport) {


// 	// =====================================
// 	// LOGIN ===============================
// 	// =====================================
// 	// show the login form
// 	app.get('/login', function(req, res) {

// 		// render the page and pass in any flash data if it exists
// 		res.render('login', { message: req.flash('loginMessage') });
// 	});

// 	// process the login form
// 	app.post('/login', passport.authenticate('local', {
//             successRedirect : './customer', // redirect to the secure profile section
//             failureRedirect : './login', // redirect back to the signup page if there is an error
//             failureFlash : 'Invalid username or password.' // allow flash messages
// 		}),
//         function(req, res) {
//             if (req.body.remember) {
//               req.session.cookie.maxAge = 1000 * 60 * 3;
//             } else {
//               req.session.cookie.expires = false;
//             }
//         res.redirect('/');
//     });

//     app.get('/api/users/me',
//       passport.authenticate('basic', { session: false }),
//       function(req, res) {
//         res.json({ id: req.user.id, email: req.user.email });
//       });

// 	// =====================================
// 	// SIGNUP ==============================
// 	// =====================================
// 	// show the signup form
// 	app.get('/login', function(req, res) {
// 		// render the page and pass in any flash data if it exists
// 		res.render('register.html', { message: req.flash('signupMessage') });
// 	});

// 	// process the signup form
// 	app.post('/register', passport.authenticate('local-signup', {
// 		successRedirect : '/customer.html', // redirect to the secure profile section
// 		failureRedirect : '/login.html', // redirect back to the signup page if there is an error
// 		failureFlash : true // allow flash messages
// 	}));

// 	// =====================================
// 	// PROFILE SECTION =========================
// 	// =====================================
// 	// we will want this protected so you have to be logged in to visit
// 	// we will use route middleware to verify this (the isLoggedIn function)
// 	app.get('/customer', isLoggedIn, function(req, res) {
// 		res.render('customer.html', {
// 			user : req.email // get the user out of session and pass to template
// 		});
// 	});

// 	// =====================================
// 	// LOGOUT ==============================
// 	// =====================================
// 	app.get('/logout', function(req, res) {
// 		req.logout();
// 		res.redirect('/');
// 	});
// };

// // route middleware to make sure
// function isLoggedIn(req, res, next) {

// 	// if user is authenticated in the session, carry on
// 	if (req.isAuthenticated())
// 		return next();

// 	// if they aren't redirect them to the home page
// 	res.redirect('/');
// }