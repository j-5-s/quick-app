/*jshint node:true*/

var mongoose		= require("mongoose"),
	crypto          = require('crypto'),
	User            = mongoose.model('User', require('../models/User').User),
	LoginToken      = mongoose.model('LoginToken',require('../models/LoginToken').LoginToken);


module.exports = {
	
	mapping: {
		//login form
		"index"                 : {
			"url":"/sessions/new", 
			"method":"get"
		},
		//login action post
		"login"               : {
			"url":"/sessions",
			"method":"post"
		},
		//logout
		"destroy"              : {
			"url":"/sessions/logout",
			"method":"get",
			"secure": true
		}
	},
	
	// GET | sessions page
	index: function(req, res) {
		res.render('sessions/index.jade', {
			locals: { 
				user: new User()
			}
		});
	},
	
	login: function(req,res) {
		User.findOne({ email: req.body.user.email }, function(err, user) {
			if (user && user.authenticate(req.body.user.password)) {

				req.session.user_id = user.id;

				// Remember me
				if (req.body.remember_me) {
					var loginToken = new LoginToken({ email: user.email });
					loginToken.save(function() {
						res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/'});
						return res.redirect('/');
					});
				} else {
					res.redirect('/');
				}
			} else {
				req.flash('error', 'Incorrect credentials');
				res.redirect('/sessions/new');    
			}
		});
	},

	destroy: function(req,res) {
		if (req.session) {
			var user_id = req.session.user_id;
			User.findOne({_id:user_id},function(err, user){

				User.findOne({_id:user_id}, function(err,user){
				

						user.online = false;

						user.save(function(err){
							LoginToken.remove({ email: req.currentUser.email }, function() {});
							res.clearCookie('connect.sid');
							res.clearCookie('logintoken');
							req.session.destroy(function() {
								res.redirect('/sessions/new');
							});							
							
						});

				});
			});
		} else {
			res.redirect('/sessiosn/new');
		}
	}
	
	


	
};