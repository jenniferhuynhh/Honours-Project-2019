var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var path = require('path');

// GET login page if not logged in, GET ftms if logged in
router.get('/', function(req, res, next) {
	User.findById(req.session.userId)
		.exec(function (error, user) {
			if (error) {
				return next(error);
			} else {
				if (user === null) {
					return res.sendFile(path.join(__dirname, "../ui/public", "/login.html"));
				} else {
					setReq(req,user);
					return res.redirect('/ftms');
				}
			}
		});
});

// POST for login or resgistration attempts
router.post('/', function(req, res, next) {
	//Register attempt
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

		User.create(userData, function (err, user) {
			if (err) {
				return next(err);
			} else {
				setReq(req,user);
				return res.redirect('/');
			}
		});
	//Login attempt
	} else if(req.body.logusername && req.body.logpassword) {
		User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
			if (error || !user) {
				var err = new Error('Wrong username or password.');
				err.status = 401;
				return next(err);
			} else {
				setReq(req,user);
				return res.redirect('/ftms');
			}
			});
	} else {
		var err = new Error('All fields required.');
		err.status = 400;
		return next(err);
	}
})

// GET route for ftms system after logging in
router.get('/ftms', function (req, res, next) {
	User.findById(req.session.userId)
		.exec(function (error, user) {
			if (error) {
				return next(error);
			} else {
				if (user === null) {
					return res.redirect('/');
				} else {
					res.cookie('role', user.role);
					if(user.role == "ts") {
						return res.sendFile(path.join(__dirname, "../ui/roles/ts", "/ftms.html"));
					} else if(user.role == "wo") {
						return res.sendFile(path.join(__dirname, "../ui/roles/wo", "/ftms.html"));
					} else if(user.role == "fo") {
						return res.sendFile(path.join(__dirname, "../ui/roles/fo", "/ftms.html"));
					}
					return res.sendFile(path.join(__dirname, "../ui/public", "/ftms.html"));
				}
			}
		});
});

// GET for logout
router.get('/logout', function (req, res, next) {
	if (req.session) {
		// delete session object
		res.clearCookie("role");
		req.session.destroy(function (err) {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

function setReq(req, user){
	req.session.userId = user._id;
	req.session.username = user.username;
	req.session.role = user.role;
}

module.exports = router;