/**
 * @doc overview
 * @id angular-data-mocks
 * @name angular-data-mocks
 * @description
 * Fake angular-data implementation suitable for unit testing angular applications that use the `angular-data.DS` module.
 *
 * __Version:__ <%= pkg.version %>
 *
 * __angular-data-mocks requires SinonJS to be loaded in order to work.__
 *
 * ## Install
 *
 * #### Bower
 * ```text
 * bower install --save-dev angular-data-mocks
 * ```
 *
 * Load `dist/angular-data-mocks.js` or `dist/angular-data-mocks.min.js` after angular, angular-data, and SinonJS.
 *
 * #### Npm
 * ```text
 * npm install --save-dev angular-data-mocks
 * ```
 *
 * Load `dist/angular-data-mocks.js` or `dist/angular-data-mocks.min.js` after angular and angular-data.
 *
 * #### Manual download
 * Download angular-data-mocks from the [Releases](https://github.com/jmdobry/angular-data-mocks/releases)
 * section of the angular-data-mocks GitHub project.
 *
 * ## Load into Angular
 * Your test module must depend on the module `angular-data.DS` in order to use angular-data. Initialize the mocks by
 * calling `module('angular-data.mocks')` in a `beforeEach` or something, before the injector is created.
 *
 * See the [testing guide](/documentation/guide/angular-data-mocks/index).
 */
(function (window, angular, undefined) {
  'use strict';

  function prettyPrint(data) {
    return (angular.isString(data) || angular.isFunction(data)) ? data : angular.toJson(data);
  }

  function createResponse(resource, deferred, response) {
    return function respond() {
      if (!(response[0] instanceof Error)) {
        deferred.resolve.apply(null, response);
      } else {
        deferred.reject.apply(null, response);
      }
    };
  }

  function mockAsync(name, namespace, expectations, definitions, requests, responses) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var expectation = expectations[0];
      var deferred = $q.defer();
      var resourceName = args[0];

      if (expectation && expectation.match(name, resourceName)) {
        expectations.shift();

        if (!expectation.matchArgs(args)) {
          throw new Error('Expected ' + expectation + ' with different args\n' +
            'EXPECTED: ' + prettyPrint(expectation.args) + '\nGOT:      ' + prettyPrint(args));
        }

        if (expectation.response) {
          responses.push(createResponse(resourceName, deferred, expectation.response));
          return deferred.promise;
        } else {
          throw new Error('No response defined for DSHttpAdapter.' + expectation.method);
        }
        return;
      }

      // try to match request to any backend definitions
      for (var i = 0; i < definitions.length; i++) {
        var definition = definitions[i];

        if (definition.match(name, resourceName)) {
          if (definition.response) {
            responses.push(createResponse(resourceName, deferred, definition.response));
            return deferred.promise;
          } else {
            throw new Error('No response defined !');
          }
          return;
        }
      }

      // Any requests that made it this far aren't being handled, so throw an exception
      throw new Error('Unexpected request: DSHttpAdapter.' + name + ' ' + resourceName + '\n' +
        'No more requests expected');
    };
  }

  function createShortMethod(name, expectations) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      if (args[0] === undefined) {
        throw new Error('Resource not defined for expectation!');
      }
      var expectation = new MockDSExpectation(name, args);
      expectations.push(expectation);

      return {
        respond: function () {
          expectation.response = Array.prototype.slice.call(arguments);
        }
      };
    };
  }

  function MockDSExpectation(method, args) {
    this.method = method;
    this.args = args;
    this.resourceName = this.args[0];

    this.match = function (m, resourceName) {
      if (method !== m) {
        return false;
      } else if (this.resourceName !== resourceName) {
        return false;
      }
      return true;
    };

    this.matchArgs = function (a) {
      if (this.args.length === 0) {
        return true;
      }

      var isEqual = false;
      for (var i = 0; i < this.args.length; i++) {
        isEqual = angular.equals(this.args[i], a[i]);
        if (!isEqual) {
          break;
        }
      }
      return isEqual;
    };
  }

  function MockDSAdapterExpectation(method, args) {
    this.method = method;
    this.args = args;
    this.match = function (m) {
      return method === m;
    };
    this.matchArgs = function (a) {
      if (this.args.length === 0) {
        return true;
      }

      var isEqual = false;
      for (var i = 0; i < this.args.length; i++) {
        isEqual = angular.equals(this.args[i], a[i]);
        if (!isEqual) {
          break;
        }
      }
      return isEqual;
    };
  }

  angular.module('angular-data.mock-utils', ['angular-data.DS', 'ng'])
    .service('DSMockUtils', [function () {
      return {
        prettyPrint: prettyPrint,
        createResponse: createResponse,
        mockAsync: mockAsync,
        createShortMethod: createShortMethod,
        MockDSExpectation: MockDSExpectation,
        MockDSAdapterExpectation: MockDSAdapterExpectation
      };
    }]);

  angular.module('angular-data.DSMock', ['angular-data.mock-utils'])
    .provider('DS', require('./DSMock.js'));

  angular.module('angular-data.DSHttpAdapterMock', ['angular-data.mock-utils'])
    .provider('DSHttpAdapter', require('./DSHttpAdapterMock.js'));

  angular.module('angular-data.DSLocalStorageAdapterMock', ['angular-data.mock-utils'])
    .provider('DSLocalStorageAdapter', require('./DSLocalStorageAdapterMock.js'));

  angular.module('angular-data.mocks', [
    'angular-data.DSMock',
    'angular-data.DSHttpAdapterMock',
    'angular-data.DSLocalStorageAdapterMock'
  ])
    .value('version', '<%= pkg.version %>');

})(window, window.angular);
