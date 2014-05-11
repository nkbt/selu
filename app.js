"use strict";

//var mongoDbUrl = process.env.NODE_ENV === 'test' ?
//	'mongodb://localhost/selu-test' :
//	'mongodb://localhost/selu';
//
var app = require('./app/index');
app('mongodb://localhost/selu');
