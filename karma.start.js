'use strict';

// Setup global test variables
var $rootScope, $q, $log, DS, DSHttpAdapter, DSLocalStorageAdapter, $httpBackend, p1, p2, p3, p4, p5;

angular.module('testApp', ['ng', 'ngMock', 'angular-data.DS']);

beforeEach(function () {
  module('testApp');
});

beforeEach(function () {
  module('angular-data.mocks');
});

beforeEach(function (done) {
  inject(function (_$rootScope_, _$q_, _$httpBackend_, _DS_, _DSHttpAdapter_, _DSLocalStorageAdapter_, _$log_) {
    // Setup global mocks
    $q = _$q_;
    $rootScope = _$rootScope_;
    DS = _DS_;
    DSHttpAdapter = _DSHttpAdapter_;
    DSLocalStorageAdapter = _DSLocalStorageAdapter_;
    $httpBackend = _$httpBackend_;
    $log = _$log_;

    p1 = { author: 'John', age: 30, id: 5 };
    p2 = { author: 'Sally', age: 31, id: 6 };
    p3 = { author: 'Mike', age: 32, id: 7 };
    p4 = { author: 'Adam', age: 33, id: 8 };
    p5 = { author: 'Adam', age: 33, id: 9 };

    done();
  });
});

// Clean up after each test
afterEach(function () {
  $httpBackend.verifyNoOutstandingExpectation();
  $httpBackend.verifyNoOutstandingRequest();
  $log.reset();
});
