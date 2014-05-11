"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	email: {
		type: String,
		lowercase: true,
		trim: true,
		required: true,
		index: true,
		unique: true
	},
	password: {type: String, required: true},
	fname: {type: String, required: true, trim: true},
	lname: {type: String, required: true, trim: true},
	followers: {type: [String], index: true},
	followees: {type: [String], index: true}
});

var User = mongoose.model('User', UserSchema);

UserSchema.path('email').validate(function (value, respond) {
	return User.findOne({email: value, _id: {$ne: this._id}}, {email: true}, function (err, user) {
		if (user) {
			return respond(false);
		}
		return respond(true);
	});
}, 'Email address {VALUE} is already registered');


module.exports = User;
