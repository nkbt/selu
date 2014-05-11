"use strict";

var User = require('../models/user');
var errors = require('restify').errors;
var auth = require('../lib/auth');
var async = require('async');


exports.get = function (req, res, callback) {
	return auth(req, function (error, currentUser) {
		if (error) {
			return callback(error);
		}

		res.json({user: currentUser});
		return callback();
	})
};


exports.create = function (req, res, callback) {
	var user = new User(req.params);
	return user.save(function (error, user) {
		if (error) {
			return callback(error);
		}
		res.json({user: user});
		return callback();
	});
};


exports.follow = function (req, res, callback) {

	return async.auto({
		currentUser: async.apply(auth, req),
		validCurrentUser: ['currentUser', function (next, results) {
			if (results.currentUser.username === req.params.email) {
				return next(new errors.InvalidArgumentError('You cannot follow yourself'));
			}
			return next(null, results.currentUser);
		}],
		user: ['validCurrentUser', async.apply(User.findOne.bind(User), {email: req.params.email}, {password: false})],
		validUser: ['user', function (next, results) {
			if (!results.user) {
				return next(new errors.InvalidArgumentError('Target user not found'));
			}
			return next(null, results.user);
		}],
		updateCurrentUser: [
			'validCurrentUser', 'validUser', function (next, results) {
				results.validCurrentUser.followees.addToSet(results.validUser.email);
				return results.validCurrentUser.save(next);
			}
		],
		updateUser: [
			'validCurrentUser', 'validUser', function (next, results) {
				results.validUser.followers.addToSet(results.validCurrentUser.email);
				return results.validUser.save(next);
			}
		]
	}, function (error, results) {
		if (error) {
			return callback(error);
		}
		res.json({user: results.updateCurrentUser});
		return callback();
	});
};


exports.login = function (req, res, callback) {
	return User.findOne({email: req.params.email, password: req.params.password}, function (error, user) {
		if (error) {
			return callback(error);
		}
		if (!user) {
			return callback(new Error('Login failed'));
		}
		res.json({token: new Buffer([user.email, user.password].join(':')).toString('base64')});
		return callback();
	});
};
