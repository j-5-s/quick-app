/*jshint node:true*/
var fs                 = require("fs"), //fs = file structure
	mappingString      = "",
	connect            = require('connect'),
	mongoose           = require("mongoose"),
	User               = mongoose.model("User"),
	LoginToken         = mongoose.model("LoginToken");

	function authenticateFromLoginToken(req, res, next) {
		//connect to the database	

		var User = mongoose.model("User"),
		
		cookie = JSON.parse(req.cookies.logintoken);

		//check to see if the cookie matches the database
		LoginToken.findOne({ email: cookie.email,series: cookie.series,token: cookie.token }, function(err, token) {
			//get the user fromthe email
			User.findOne({ email: token.email }, function(err, user) {
				if (user) {

					req.session.user_id = user.id;
					req.currentUser = user;
					//update the token
					token.token = token.randomToken();
					token.save(function() {

						res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/', cookie:{domain: '.localhost' }});
						return true;
					});
				} else {
					//res.redirect('/sessions/new');
					return false;
				}
			});
		});
	}

//route middleware for forcing a user
function loadUser(req, res, next) {

if (req.session.user_id) {
	User.findById(req.session.user_id, function(err, the_user) {

		if (the_user) {
			req.currentUser = the_user;
			next();

		} else {
			res.redirect('/sessions/new');
		}
	});
  } else if (req.cookies.logintoken) {
	if (authenticateFromLoginToken(req, res, next)){
		next();
	} else {
		return res.redirect('/sessions/new');
	}
  
  } else {
    res.redirect('/sessions/new');
  }
}




function bootController(app, file) {

  var name = file.replace('.js', ''),
	actions = require('../controllers/' + name),
	mapping = actions.mapping;
	
	Object.keys(actions).map(function(action){
		var fn = actions[action];

		if ( typeof fn  === "function" ) {
			var route = mapping[action];
			if( route ) {
				switch(route.method) {
					case 'get':
						if (route.secure) {
							app.get(route.url, loadUser, fn);
						} else {
							app.get(route.url, fn);
						}
						console.log("get " + route.url);
						mappingString += "GET " + route.url + "<br />";
						break;

					case 'post':
						if (route.secure) {
							app.post(route.url, loadUser, fn);
						} else {
							app.post(route.url, fn);
						}
						console.log("post " + route.url);
						mappingString += "POST " + route.url + "<br />";
						break;
					case 'put':
						if (route.secure) {
							app.put(route.url, loadUser, fn);
						} else {
							app.put(route.url, fn);
						}
						console.log("put " + route.url);
						mappingString += "PUT " + route.url + "<br />";
						break;
					case 'delete':
						if (route.secure) {
							app.del(route.url, loadUser, fn);
						} else {
							app.del(route.url, fn);
						}
						console.log("delete " + route.url);
						mappingString += "DELETE " + route.url + "<br />";
						break;
				}
			} else {
				//throw new NotFound;
				console.log("WARNING: no mapping for " + action + " defined");
			}

		}
	});


}

module.exports = {
	bootControllers : function(app) {
		fs.readdir(__dirname + '/../controllers', function(err, files){
			if (err) throw err;
				files.forEach(function(file) {
				console.log("booting controller " + file);
				bootController(app, file);
			});

			//catch all 404 requests
			app.use(function(req, res){ 
				console.log(req.url);
				res.redirect("/404");
			});
		});
	}
};