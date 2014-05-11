'use strict';

var request = require('superagent');
var async = require('async');


var expect = require('chai').expect;
var app = require('../app/index');


describe('App', function () {
	var User;

	before(function (done) {
		app('mongodb://localhost/selu-test', done);
	});


	beforeEach(function (done) {
		User = require('../models/user');
		User.remove({}, done);
	});

	afterEach(function (done) {
		User.remove({}, done);
	});


	describe('POST /user', function () {

		it('should create user if all fields are valid', function (done) {
			request.post('localhost:3000/user')
				.send({email: 'nik@butenko.me', password: 'password', fname: 'Nik', lname: 'Butenko'})
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(200);
					expect(res.body).be.an('object');
					expect(res.body.user).be.an('object');
					expect(res.body).to.have.key('user');
					expect(res.body.user.email).to.equal('nik@butenko.me');
					expect(res.body.user.fname).to.equal('Nik');
					done();
				});
		});

		it('should return "Validation error" if fields are missing', function (done) {
			request.post('localhost:3000/user')
				.send({email: 'nik@butenko.me'})
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(500);
					expect(res.body).be.an('object');
					expect(res.body.message).be.a('string');
					expect(res.body.message).be.equal('Validation failed');
					done();
				});
		});

	});


	describe('POST /login', function () {

		beforeEach(function (done) {
			return User.create([
				{email: 'nik@butenko.me', password: 'password', fname: 'Nik', lname: 'Butenko'}
			], function (err) {
				if (err) {
					throw err;
				}
				done();
			});
		});


		it('should return auth token if user is found by name and password', function (done) {
			request.post('localhost:3000/user/login')
				.send({email: 'nik@butenko.me', password: 'password'})
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(200);
					expect(res.body).to.be.an('object');
					expect(res.body.token).to.be.a('string');
					// Token === Base64('nik@butenko.me:password')
					expect(res.body.token).to.equal('bmlrQGJ1dGVua28ubWU6cGFzc3dvcmQ=');
					done();
				});
		});


		it('should return auth token if user is found by name and password', function (done) {
			request.post('localhost:3000/user/login')
				.send({email: 'nik@butenko.me', password: 'wrong password'})
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(500);
					expect(res.body).to.be.an('object');
					expect(res.body.message).be.a('string');
					expect(res.body.message).be.equal('Login failed');
					done();
				});
		});


	});


	describe('GET /user', function () {

		beforeEach(function (done) {
			return User.create([
				{email: 'nik@butenko.me', password: 'password', fname: 'Nik', lname: 'Butenko'}
			], function (err) {
				if (err) {
					throw err;
				}
				done();
			});
		});


		it('should return user', function (done) {
			request.get('localhost:3000/user')
				// Base64('nik@butenko.me:password')
				.set('Authorization', 'Basic bmlrQGJ1dGVua28ubWU6cGFzc3dvcmQ=')
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(200);
					expect(res.body).be.an('object');
					expect(res.body.user).be.an('object');
					expect(res.body).to.have.key('user');
					expect(res.body.user.email).to.equal('nik@butenko.me');
					expect(res.body.user.fname).to.equal('Nik');
					expect(res.body.user.followees).to.be.an('array');
					expect(res.body.user.followers).to.be.an('array');
					done();
				});
		});


		it('should return "Authorization required" error for anonymous', function (done) {
			request.get('localhost:3000/user')
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(403);
					expect(res.body).be.an('object');
					expect(res.body.message).to.equal('Authorization required');
					done();
				});
		});


		it('should return "Authorization failed" error for incorrect authorization', function (done) {
			request.get('localhost:3000/user')
				// Base64('nik@butenko.me:password')
				.set('Authorization', 'Basic bmlrQGJ1dGVua28ubWU6cGFzc3dvcm1=')
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(401);
					expect(res.body).be.an('object');
					expect(res.body.message).to.equal('Authorization failed');
					done();
				});
		});

	});


	describe('POST /user/follow', function () {


		beforeEach(function (done) {
			return User.create([
				{email: 'nik@butenko.me', password: 'password', fname: 'Nik', lname: 'Butenko'},
				{email: 'user@test.com', password: 'password', fname: 'User', lname: 'Test'},
				{email: 'user1@test1.com', password: 'password', fname: 'User1', lname: 'Test1'},
				{email: 'user2@test2.com', password: 'password', fname: 'User2', lname: 'Test2'}
			], function (err) {
				if (err) {
					throw err;
				}
				done();
			});
		});


		it('should add requested user to list of followees', function (done) {
			request.post('localhost:3000/user/follow/user@test.com')
				// Base64('nik@butenko.me:password')
				.set('Authorization', 'Basic bmlrQGJ1dGVua28ubWU6cGFzc3dvcmQ=')
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(200);
					expect(res.body).be.an('object');
					expect(res.body.user.followees).to.be.an('array');
					expect(res.body.user.followees).to.have.length(1);
					expect(res.body.user.followees[0]).to.equal('user@test.com');
					done();
				});
		});


		it('should add current user to to list of followers of followed user', function (done) {
			request.post('localhost:3000/user/follow/user@test.com')
				// Base64('nik@butenko.me:password')
				.set('Authorization', 'Basic bmlrQGJ1dGVua28ubWU6cGFzc3dvcmQ=')
				.end(function (res) {
					expect(res).to.exist;
					expect(res.status).to.equal(200);

					return User.findOne({email: 'user@test.com'}, function (err, user) {
						if (err) {
							throw err;
						}
						expect(user.followers).to.be.an('array');
						expect(user.followers).to.have.length(1);
						expect(user.followers[0]).to.equal('nik@butenko.me');
						done();
					});
				});
		});


		it('should work for multiple users', function (done) {

			async.each(['user@test.com', 'user1@test1.com', 'user2@test2.com'], function (email, next) {
				request.post('localhost:3000/user/follow/' + email)
					// Base64('nik@butenko.me:password')
					.set('Authorization', 'Basic bmlrQGJ1dGVua28ubWU6cGFzc3dvcmQ=')
					.end(function (res) {
						next(res.status !== 200 ? new Error() : null);
					});
			}, function () {

				return User.findOne({email: 'nik@butenko.me'}, function (err, user) {
					if (err) {
						throw err;
					}
					expect(user.followees).to.be.an('array');
					expect(user.followees).to.have.length(3);
					expect(user.followees[0]).to.equal('user@test.com');
					expect(user.followees[1]).to.equal('user1@test1.com');
					expect(user.followees[2]).to.equal('user2@test2.com');
					done();
				});
			});

		});

	});

});
