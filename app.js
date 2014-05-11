"use strict";
var restify = require('restify');

var server = restify.createServer();

server.use(restify.authorizationParser());
server.use(restify.bodyParser({
	maxBodySize: 0,
	mapParams: true,
	mapFiles: false,
	overrideParams: false
}));


server.get('/auth', function (req, res, next) {
	res.json({auth: new Buffer("user:pass").toString('base64')});
	next();
});
server.post('/auth', function (req, res, next) {
	res.json(req.authorization);
	next();
});


server.listen(3000, function () {
	console.log('%s listening at %s', server.name, server.url);
});
