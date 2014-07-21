/*
 * angular-data-mocks
 * http://github.com/jmdobry/angular-data-mocks
 *
 * Copyright (c) 2014 Jason Dobry <http://jmdobry.github.io/angular-data-mocks>
 * Licensed under the MIT license. <https://github.com/jmdobry/angular-data-mocks/blob/master/LICENSE>
 */
module.exports = function (grunt) {
	'use strict';

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var pkg = grunt.file.readJSON('package.json');

	// Project configuration.
	grunt.initConfig({
		pkg: pkg,
		clean: {
			coverage: ['coverage/'],
			dist: ['dist/']
		},
		jshint: {
			all: ['Gruntfile.js', 'src/**/*.js', 'test/*.js'],
			jshintrc: '.jshintrc'
		},
		watch: {
			files: ['src/**/*.js'],
			tasks: ['build']
		},
		uglify: {
			dist: {
				options: {
					banner: '/**\n' +
						'* @author Jason Dobry <jason.dobry@gmail.com>\n' +
						'* @file angular-data-mocks.min.js\n' +
						'* @version <%= pkg.version %> - Homepage <https://github.com/jmdobry/angular-data-mocks>\n' +
						'* @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>\n' +
						'* @license MIT <https://github.com/jmdobry/angular-data-mocks/blob/master/LICENSE>\n' +
						'*\n' +
						'* @overview A mock of angular-data for testing purposes.\n' +
						'*/\n'
				},
				files: {
					'dist/angular-data-mocks.min.js': ['dist/angular-data-mocks.js']
				}
			}
		},
		karma: {
			options: {
				configFile: './karma.conf.js'
			},
			dev: {
				browsers: ['Chrome'],
				autoWatch: true,
				singleRun: false
			},
			min: {
				browsers: ['Chrome'],
				autoWatch: false,
				singleRun: true,
				options: {
					files: [
						'bower_components/angular/angular.js',
						'bower_components/angular-mocks/angular-mocks.js',
						'dist/angular-data.min.js',
						'test/integration/**/*.js',
						'karma.start.js'
					]
				}
			},
			ci: {
				browsers: ['Firefox', 'PhantomJS']
			}
		},
		coveralls: {
			options: {
				coverage_dir: 'coverage'
			}
		},

		copy: {
			dist: {
				src: 'src/angular-data-mocks.js',
				dest: 'dist/angular-data-mocks.js',
				options: {
					process: function (content) {
						return content.replace(/<%= pkg\.version %>/gi, pkg.version);
					}
				}
			}
		}
	});

	grunt.registerTask('test', ['clean:coverage', 'karma:dev']);
	grunt.registerTask('build', [
		'clean',
		'jshint',
		'copy',
		'uglify:dist'
	]);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('go', ['build', 'watch']);

	// Used by TravisCI
	grunt.registerTask('ci', ['build', 'karma:ci']);
};
