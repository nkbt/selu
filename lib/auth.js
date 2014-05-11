"use strict";

var User = require('../models/user');
var errors = require('restify').errors;

module.exports = function auth(req, callback) {
	if (!req.authorization.basic) {
		return callback(new errors.NotAuthorizedError('Authorization required'));
	}
	return User.findOne({
		email: req.authorization.basic.username,
		password: req.authorization.basic.password
	}, {password: false}, function (error, currentUser) {
		if (error) {
			return callback(error);
		}
		if (!currentUser) {
			return callback(new errors.InvalidCredentialsError('Authorization failed'));
		}
		callback(null, currentUser);
	});
};
