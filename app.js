/*jshint node:true*/
/**
 * Module dependencies.
 */

var express    = require('express'),
	controller = require("./utils/controller"),
	mongoose   = require('mongoose');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(express.methodOverride());
	controller.bootControllers(app);

	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.set('db-uri', 'mongodb://localhost/quick-app-dev');
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.set('db-uri', 'mongodb://localhost/quick-app');
	app.use(express.errorHandler()); 
});



mongoose.connect(app.set('db-uri'));

app.error(controller.error);

// Here we assume all errors as 500 for the simplicity of
// this demo, however you can choose whatever you like
if (app.settings.env == 'production') {

  app.error(controller.fiveHundred);

}
app.get('/404',controller.fourOFour);

app.get('/500', function(req, res, next){
  next(new Error('keyboard cat!'));
});



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
