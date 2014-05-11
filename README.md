<section class="suite">
  <h1>App</h1>
  <dl>
	<section class="suite">
	  <h1>POST /user</h1>
	  <dl>
		<dt>should create user if all fields are valid</dt>
		<dd><pre><code>request.post('localhost:3000/user')
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
});</code></pre></dd>
		<dt>should return &quot;Validation error&quot; if fields are missing</dt>
		<dd><pre><code>request.post('localhost:3000/user')
.send({email: 'nik@butenko.me'})
.end(function (res) {
	expect(res).to.exist;
	expect(res.status).to.equal(500);
	expect(res.body).be.an('object');
	expect(res.body.message).be.a('string');
	expect(res.body.message).be.equal('Validation failed');
	done();
});</code></pre></dd>
	  </dl>
	</section>
	<section class="suite">
	  <h1>POST /login</h1>
	  <dl>
		<dt>should return auth token if user is found by name and password</dt>
		<dd><pre><code>request.post('localhost:3000/user/login')
.send({email: 'nik@butenko.me', password: 'password'})
.end(function (res) {
	expect(res).to.exist;
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body.token).to.be.a('string');
	// Token === Base64('nik@butenko.me:password')
	expect(res.body.token).to.equal('bmlrQGJ1dGVua28ubWU6cGFzc3dvcmQ=');
	done();
});</code></pre></dd>
		<dt>should return auth token if user is found by name and password</dt>
		<dd><pre><code>request.post('localhost:3000/user/login')
.send({email: 'nik@butenko.me', password: 'wrong password'})
.end(function (res) {
	expect(res).to.exist;
	expect(res.status).to.equal(500);
	expect(res.body).to.be.an('object');
	expect(res.body.message).be.a('string');
	expect(res.body.message).be.equal('Login failed');
	done();
});</code></pre></dd>
	  </dl>
	</section>
	<section class="suite">
	  <h1>GET /user</h1>
	  <dl>
		<dt>should return user</dt>
		<dd><pre><code>request.get('localhost:3000/user')
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
});</code></pre></dd>
		<dt>should return &quot;Authorization required&quot; error for anonymous</dt>
		<dd><pre><code>request.get('localhost:3000/user')
.end(function (res) {
	expect(res).to.exist;
	expect(res.status).to.equal(403);
	expect(res.body).be.an('object');
	expect(res.body.message).to.equal('Authorization required');
	done();
});</code></pre></dd>
		<dt>should return &quot;Authorization failed&quot; error for incorrect authorization</dt>
		<dd><pre><code>request.get('localhost:3000/user')
// Base64('nik@butenko.me:password')
.set('Authorization', 'Basic bmlrQGJ1dGVua28ubWU6cGFzc3dvcm1=')
.end(function (res) {
	expect(res).to.exist;
	expect(res.status).to.equal(401);
	expect(res.body).be.an('object');
	expect(res.body.message).to.equal('Authorization failed');
	done();
});</code></pre></dd>
	  </dl>
	</section>
	<section class="suite">
	  <h1>POST /user/follow</h1>
	  <dl>
		<dt>should add requested user to list of followees</dt>
		<dd><pre><code>request.post('localhost:3000/user/follow/user@test.com')
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
});</code></pre></dd>
		<dt>should add current user to to list of followers of followed user</dt>
		<dd><pre><code>request.post('localhost:3000/user/follow/user@test.com')
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
});</code></pre></dd>
		<dt>should work for multiple users</dt>
		<dd><pre><code>async.each(['user@test.com', 'user1@test1.com', 'user2@test2.com'], function (email, next) {
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
		});</code></pre></dd>
	  </dl>
	</section>
  </dl>
</section>
