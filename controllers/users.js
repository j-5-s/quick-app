/*jshint node:true*/
var mongoose    = require( 'mongoose' ),
	crypto      = require( 'crypto' ),
	User        = mongoose.model( 'User' , require('../models/User').User ),
	nodemailer  = require( 'nodemailer' );


module.exports = {
	
	mapping: {
		"_new"					: {
			"url":"/users/new", 
			"method":"get"
		},
        
        "create"				: {
			"url":"/users/create",
			"method":"post"
        },
		"verify"				: {
			"url":"/verify/:hash",
			"method":"get",
			"secure": false
		},
		'resetPassword'			: {
			"url": "/reset-password/:hash",
			"method": "get",
			"secure": false
		},
		'resetPasswordPost'		: {
			"url": "/reset-password",
			"method": "post",
			"secure": false
		}
	},
	
	// GET | sessions page
	_new: function(req, res) {
		res.render('users/new.jade', {
			locals: { 
				user: new User()
			}
		});		
	},

	create: function( req, res ) {
		function userSaveFailed(msg) {
			msg = msg || 'Account creation failed';
			req.flash('error', msg);
			res.redirect("/users/new");
		}


		if (req.body.user.password2 !== req.body.user.password) {
			return userSaveFailed('The passwords you entered do not match!');
		}

		delete req.body.user.password2;
		var user = new User(req.body.user);


		
		User.find({})
		.sort("account_id",-1)
		.limit(1)
		.run(function(err,latest_users){
			var latest_user = latest_users[0],
				account_id = latest_user.get("account_id") + 1;

				User.count({email:req.body.user.email}, function(err,count){
					if (count === 0) {
						user.save(function(err) {
						
							if (err) return userSaveFailed();
							
							user.set("account_id",account_id);
							
							var shasum = crypto.createHash('sha1');
							var randomnumber = Math.floor(Math.random()*11000);
							shasum.update(user.get("email")+randomnumber);
							var email_hash = shasum.digest('hex');
							user.set("email_verification_hash",email_hash);
							var message = "Hello,\r";
							message += 'Thank you for signing up for an account at <a href="http://exmaple.com">domain</a>.  Please verify your email with the link below:\r\r';
							message += "http://app.com/verify/"+email_hash + '\r\r';
							message += "Thank you,\r\r";
							message += "James Charlesworth\r";


							var html_message = "Hello,<br>";
							html_message += "Thank you for signing up for an account at http://app.com.  Please verify your email with the link below:<br><br>";
							html_message += "http://app.com/verify/"+email_hash + '<br><br>';
							html_message += "James Charlesworth <br>";
							

						
							user.save(function(err){
								//console.log(err)
								//res.redirect('/sessions/new')
								
								nodemailer.send_mail(
								// e-mail options
									{
										from: '',
										to: user.email,
										subject: '',
										html: html_message,
										text: message
									},
									// callback function
									function(error, success){
										console.log(error);
										console.log('Message ' + success ? 'sent' : 'failed');
										req.flash('info', 'Please check your email for account verification!');
										res.redirect("/sessions/new");
									}
								);
								
							});//
						});	//save

					} else {
						req.flash("error", "A user with that email address already exists.");
						res.redirect("/users/new");
					}
				});
		});
	},

	verify: function( req, res ) {
		User.findOne({email_verification_hash: req.params.hash,active:false},function(err,user){
			if (!user) {
				req.flash('info', 'Something went wrong. please check your email for account verification');
				res.redirect("/sessions/new");
			} else {
				user.set("active",true);
				user.save(function(err){
					
					req.flash('info', 'Your account has been verfied, you may now sign in!');
					res.redirect("/sessions/new");
					
				});
			}
		});
	},	

	
	resetPassword: function(req,res) {
		
		res.render('users/reset-password.jade', {
			locals: { 
				user: new User(),
				hash: req.params.hash
				}
			});
	},
	resetPasswordPost: function(req,res) {
		var hash = req.body.hash,
			p1   = req.body.password1,
			p2   = req.body.password2;
		
		if (p1 != p2) {
			req.flash("error", "Your passwords do not match");
			res.back();
		} else {
			User.findOne({email_verification_hash:hash}, function(err,user){	
				if (user) {
					user.set("password",p1);
					user.save(function(err){
						req.flash("info", "Your password has been reset, please login");
						res.redirect("/sessions/new");
					});
				} else {
					req.flash('error', 'Password reset has experienced an error.');
					res.back();
				}
			});
		}	
	}	
};