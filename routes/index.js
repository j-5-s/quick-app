var mongoose = require('mongoose');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var BlogPost = new Schema({
    title     : String
  , body      : String
  , date      : Date
});

mongoose.connect('mongodb://localhost/quick-app');

var Post = mongoose.model('BlogPost',BlogPost);

/*
 * GET home page.
 */

exports.index = function(req, res){
  
  var b = new Post();
  b.set('title','sometitle');
  b.set('body', 'some body');
  b.set('date', new Date());
  b.save();

  res.render('index', { title: 'Express' })

};