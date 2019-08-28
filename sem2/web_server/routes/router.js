var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var path = require('path');

/* GET index */
router.get('/', function(req, res, next) {
	res.sendFile(path.join(__dirname, "../public", "/login.html")); //path.join(__dirname + '/login.html')
});

router.post('/', function(req, res, next) {
	console.log("register attempted");
	if (
	req.body.username &&
	req.body.role &&
	req.body.password &&
	req.body.passwordConf) {

		var userData = {
			username: req.body.username,
			role: req.body.role,
			password: req.body.password
		}

		//use schema.create to insert data into the db
		User.create(userData, function (err, user) {
			if (err) {
				console.log("unsuccessful register");
				return next(err)
			} else {
				console.log("user registered");
				req.session.userId = user._id;
				return res.redirect('/');
			}
		});
	} else if(req.body.logusername && req.body.logpassword) {
		User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
			if (error || !user) {
				var err = new Error('Wrong username or password.');
				err.status = 401;
				return next(err);
			} else {
				req.session.userId = user._id;
				return res.redirect('/ftms');
			}
			});
	} else {
		var err = new Error('All fields required.');
		err.status = 400;
		return next(err);
	}
})


// GET route after registering
router.get('/ftms', function (req, res, next) {
	User.findById(req.session.userId)
		.exec(function (error, user) {
			if (error) {
				return next(error);
			} else {
				if (user === null) {
					var err = new Error('Not authorized! Go back!');
					err.status = 400;
					return next(err);
				} else {
					return res.sendFile(path.join(__dirname, "../public", "/index.html"));
				}
			}
		});
});


// GET route after registering
router.get('/profile', function (req, res, next) {
	User.findById(req.session.userId)
		.exec(function (error, user) {
			if (error) {
				return next(error);
			} else {
				if (user === null) {
					var err = new Error('Not authorized! Go back!');
					err.status = 400;
					return next(err);
				} else {
					return res.send('<h1> Username: </h1>' + user.username + '<h2> Role: </h2>' + user.role + '<br><a type="button" href="/logout">Logout</a>')
				}
			}
		});
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
	if (req.session) {
		// delete session object
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

module.exports = router;