// an example karma.conf.js
module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: './',
    frameworks: ['sinon', 'chai', 'mocha'],
    plugins: [
      // these plugins will be require() by Karma
      'karma-sinon',
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ],
    autoWatch: false,
    browsers: ['Chrome'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/js-data/dist/js-data.js',
      'bower_components/js-data-angular/dist/js-data-angular.js',
      'dist/js-data-angular-mocks.js',
      'karma.start.js',
      'test/testApp.js',
      'test/test.js'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'dist/js-data-angular-mocks.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

    // web server port
    port: 9876,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 30000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
