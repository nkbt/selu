'use strict';

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		simplemocha: {
			test: {
				src: ['test/*.js'],
				options: {
					globals: ['should'],
					timeout: 3000,
					ignoreLeaks: false,
					ui: 'bdd',
					reporter: 'tap'
				}
			}
		},
		jshint: {
			options: {},
			app: {
				src: ['Gruntfile.js', 'app.js', 'lib/**/*.js', 'models/**/*.js', 'routes/**/*.js'],
				options: {
					jshintrc: '.jshintrc'
				}
			},
			test: {
				src: ['test/**/*.js'],
				options: {
					jshintrc: 'test/.jshintrc'
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task.
	grunt.registerTask('default', ['jshint', 'simplemocha']);
};
