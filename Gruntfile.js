/*
 * js-data-angular-mocks
 * http://github.com/js-data/js-data-angular-mocks
 *
 * Copyright (c) 2014 Jason Dobry <http://js-data.github.io/js-data-angular-mocks>
 * Licensed under the MIT license. <https://github.com/js-data/js-data-angular-mocks/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt);
  require('time-grunt')(grunt);

  var webpack = require('webpack');
  var pkg = grunt.file.readJSON('package.json');
  var banner = 'js-data-angular-mocks\n' +
    '@version ' + pkg.version + ' - Homepage <https://github.com/js-data/js-data-angular-mocks>\n' +
    '@author Jason Dobry <jason.dobry@gmail.com>\n' +
    '@copyright (c) 2014-2015 Jason Dobry \n' +
    '@license MIT <https://github.com/js-data/js-data-angular-mocks/blob/master/LICENSE>\n' +
    '\n' +
    '@overview A mock of js-data & js-data-angular for testing purposes.';

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      coverage: ['coverage/'],
      dist: ['dist/']
    },
    watch: {
      files: ['src/**/*.js'],
      tasks: ['build']
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/js-data-angular-mocks.min.map',
          banner: '/*!\n' +
          '* js-data-angular-mocks\n' +
          '* @version <%= pkg.version %> - Homepage <https://github.com/js-data/js-data-angular-mocks>\n' +
          '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
          '* @copyright (c) 2014-2015 Jason Dobry <https://github.com/js-data/>\n' +
          '* @license MIT <https://github.com/js-data/js-data-angular-mocks/blob/master/LICENSE>\n' +
          '*\n' +
          '* @overview A mock of js-data & js-data-angular for testing purposes.\n' +
          '*/\n'
        },
        files: {
          'dist/js-data-angular-mocks.min.js': ['dist/js-data-angular-mocks.js']
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
            'bower_components/js-data/dist/js-data.js',
            'bower_components/js-data-angular/dist/js-data-angular.js',
            'dist/js-data-angular-mocks.min.js',
            'karma.start.js',
            'test/testApp.js',
            'test/test.js'
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
        src: 'dist/js-data-angular-mocks.js',
        dest: 'dist/js-data-angular-mocks.js',
        options: {
          process: function (content) {
            return content.replace(/<%= pkg\.version %>/gi, pkg.version);
          }
        }
      }
    },
    webpack: {
      dist: {
        entry: './src/index.js',
        output: {
          filename: './dist/js-data-angular-mocks.js',
          libraryTarget: 'umd',
          library: 'jsDataAngularMocksModuleName'
        },
        externals: {
          'js-data': {
            amd: 'js-data',
            commonjs: 'js-data',
            commonjs2: 'js-data',
            root: 'JSData'
          },
          'js-data-angular': {
            amd: 'js-data-angular',
            commonjs: 'js-data-angular',
            commonjs2: 'js-data-angular',
            root: 'jsDataAngularModuleName'
          },
          'sinon': 'sinon',
          'angular': 'angular'
        },
        module: {
          loaders: [
            { test: /(src)(.+)\.js$/, exclude: /node_modules/, loader: 'babel-loader?blacklist=useStrict' }
          ],
          preLoaders: [
            {
              test: /(src)(.+)\.js$|(test)(.+)\.js$/, // include .js files
              exclude: /node_modules/, // exclude any and all files in the node_modules folder
              loader: "jshint-loader?failOnHint=true"
            }
          ]
        },
        plugins: [
          new webpack.BannerPlugin(banner)
        ]
      }
    }
  });

  grunt.registerTask('test', ['build', 'karma:ci', 'karma:min']);
  grunt.registerTask('build', [
    'clean',
    'webpack',
    'copy',
    'uglify:dist'
  ]);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('go', ['build', 'watch']);

  // Used by TravisCI
  grunt.registerTask('ci', ['build', 'karma:ci']);
};
