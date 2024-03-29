var mongoose		= require("mongoose"),
    crypto      = require('crypto'),
    Schema			= mongoose.Schema,
    ObjectId		= Schema.ObjectId;

function validatePresenceOf(value) {
  return value && value.length;
}

var User = new Schema({
  name: String,
	nickname: String,
	email: { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
  hashed_password: String,
  salt: String,
  account_id: Number
});



User.virtual('id')
    .get(function() {
      return this._id.toHexString();
});

User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password; });

User.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) == this.hashed_password && this.active == true;
});
  
User.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
});

User.method('encryptPassword', function(password) {
	
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});


exports.User = User;