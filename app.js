"use strict";
var restify = require('restify');

var mongooseConnection = require('./lib/db');

var userRoute = require('./routes/user');

var server = restify.createServer();

server.use(restify.authorizationParser());
server.use(restify.bodyParser({
	maxBodySize: 0,
	mapParams: true,
	mapFiles: false,
	overrideParams: false
}));


server.get('/user', userRoute.get);
server.post('/user', userRoute.create);
server.post('/user/login', userRoute.login);
server.post('/user/follow/:email', userRoute.follow);

mongooseConnection(function () {
	server.listen(3000, function () {
		console.log('%s listening at %s', server.name, server.url);
	});
});
