/*jshint node:true*/

var mongoose		= require("mongoose"),
	crypto          = require('crypto'),
	User            = mongoose.model('User', require('../models/User').User),
	LoginToken      = mongoose.model('LoginToken',require('../models/LoginToken').LoginToken);


module.exports = {
	
	mapping: {
		//login form
		"index"                 : {
			"url":"/", 
			"method":"get"
		}
	},
	
	// GET | sessions page
	index: function(req, res) {
		res.render('app/index.jade', {
			locals: { 
				title: 'home page'
			}
		});
	}
	
};	