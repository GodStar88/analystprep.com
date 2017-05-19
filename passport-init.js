var accountSchema = require('./model/model').accountSchema;
var mongoose = require('mongoose');
var Account = mongoose.model('Account', accountSchema);
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var Util = require('./lib/util.js');
var global = require('./global/config');

module.exports = function (passport) {

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) { 
			// check in mongo if a user with username exists or not
			Account.findOne({ 'username' :  username }, 
				function(err, user) {
					if (err)
						return done(err);
					if (!user){
						console.log('User Not Found with username '+username);
						return done(null, false);                 
					}
					if (!isValidPassword(user, password)){
						console.log('Invalid Password');
						return done(null, false); // redirect back to login page
					}
					return done(null, user);
				}
			);
		}
	));

	var isValidPassword = function (account, password) {
		return bCrypt.compareSync(password, account.password);
	};
	// Generates hash using bCrypt
	var createHash = function (password) {
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};
};