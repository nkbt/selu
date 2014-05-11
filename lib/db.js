"use strict";

var mongoose = require('mongoose');
var db = mongoose.connection;


module.exports = function (dbUrl, callback) {

	db.once('connected', function () {
		console.log('Mongoose default connection open to ' + dbUrl);
		callback();
	});

	db.on('error', function (err) {
		console.log('Mongoose default connection error: ' + err);
	});

	db.on('disconnected', function () {
		console.log('Mongoose default connection disconnected');
	});

	process.on('SIGINT', function () {
		db.close(function () {
			console.log('Mongoose default connection disconnected through app termination');
			process.exit(0);
		});
	});

	mongoose.connect(dbUrl);
};
