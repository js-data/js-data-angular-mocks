/**
 * @author Jason Dobry <jason.dobry@gmail.com>
 * @file angular-data-mocks.js
 * @version 0.4.1 - Homepage <https://github.com/jmdobry/angular-data-mocks>
 * @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>
 * @license MIT <https://github.com/jmdobry/angular-data-mocks/blob/master/LICENSE>
 *
 * @overview A mock of angular-data for testing purposes.
 */
/**
 * @doc overview
 * @id angular-data-mocks
 * @name angular-data-mocks
 * @description
 * Fake angular-data implementation suitable for unit testing angular applications that use the `angular-data.DS` module.
 *
 * __Version:__ 0.4.0
 *
 * __angular-data-mocks requires sinon to be loaded in order to work.__
 *
 * ## Install
 *
 * #### Bower
 * ```text
 * bower install --save-dev angular-data-mocks
 * ```
 *
 * Load `dist/angular-data-mocks.js` or `dist/angular-data-mocks.min.js` after angular, angular-data, and sinon.
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

  var utils = angular.injector(['angular-data.DS']).get('DSUtils');
  var errors = angular.injector(['angular-data.DS']).get('DSErrors');

  function prettyPrint(data) {
    return (angular.isString(data) || angular.isFunction(data)) ? data : angular.toJson(data);
  }

  function mockAsync(name, namespace, expectations, requests) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var expected = false;
      angular.forEach(expectations, function (expectation) {
        if (expectation.method === name) {
          expected = true;
        }
      });
      if (!expected) {
        throw new Error('Unexpected ' + namespace + ' call: ' + name + ' ' + args[0]);
      }
      var deferred = $q.defer();

      requests.push({
        method: name,
        args: args,
        deferred: deferred
      });
      return deferred.promise;
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

    this.match = function (m, args) {
      if (method !== m) {
        return false;
      }
      return !(angular.isDefined(args) && !this.matchArgs(args));
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

  function resolveResponse(request, expectation) {
    var response = expectation.response;

    if (!angular.isDefined(response)) {
      throw new Error('Response not defined for DS.' + expectation.method);
    }

    if (!(response[0] instanceof Error)) {
      request.deferred.resolve.apply(null, response);
    } else {
      request.deferred.reject.apply(null, response);
    }
  }

  function testCurrentRequest(expectations, requests) {
    var request = requests.shift();
    var expectation = expectations.shift();
    if (!expectation) {
      throw new Error('Unexpected request: DS.' + request.method + ' ' + request.args[0] + '\n' +
        'No more requests expected');
    }
    if (!expectation.match(request.method, request.args)) {
      throw new Error('Expected DS.' + expectation.method + ' call doesn\'t match request\n' +
        'EXPECTED: ' + prettyPrint(expectation.args) + '\nGOT:      ' + prettyPrint(request.args));
    }
    resolveResponse(request, expectation);
  }

  function DSHttpAdapterProvider() {
    var expectations = [];
    var requests = [];
    var stubs = {};
    var asyncMethods = [
      'create',
      'DEL',
      'destroy',
      'destroyAll',
      'find',
      'findAll',
      'GET',
      'HTTP',
      'POST',
      'PUT',
      'update',
      'updateAll'
    ];

    angular.forEach(asyncMethods, function (name) {
      stubs[name] = mockAsync(name, 'DSHttpAdapter', expectations, requests);
      sinon.spy(stubs, name);
    });

    this.$get = function () {

      var defaults = {};

      this.defaults = {};

      /**
       * @doc interface
       * @id DSHttpAdapter
       * @name DSHttpAdapter
       * @description
       * A mock implementation of `DSHttpAdapter` with helper methods for declaring and testing expectations.
       *
       * __angular-data-mocks requires sinon to be loaded in order to work.__
       *
       * See the [testing guide](/documentation/guide/angular-data-mocks/index).
       */
      var DSHttpAdapter = {

        defaults: defaults,

        /**
         * @doc method
         * @id DSHttpAdapter.methods:expect
         * @name expect
         * @description
         * Create an expectation.
         *
         * @param {string} name The name of the function that is expected to be called.
         * @returns {object} expectation
         */
        expect: function (name) {
          var args = Array.prototype.slice.call(arguments, 1);
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
        },

        /**
         * @doc method
         * @id DSHttpAdapter.methods:flush
         * @name flush
         * @description
         * Flush the pending expectations.
         *
         * @param {number=} count Flush a specified number of requests.
         */
        flush: function (count) {
          if (!requests.length) {
            throw new Error('No pending DS requests to flush !');
          }

          if (angular.isDefined(count)) {
            while (count--) {
              if (!requests.length) {
                throw new Error('No more pending DS requests to flush !');
              }
              testCurrentRequest(expectations, requests);
            }
          } else {
            while (requests.length) {
              testCurrentRequest(expectations, requests);
            }
          }
          $rootScope.$digest();
        },

        /**
         * @doc method
         * @id DSHttpAdapter.methods:verifyNoOutstandingExpectation
         * @name verifyNoOutstandingExpectation
         * @description
         * Ensure that no expectations remain unfulfilled.
         */
        verifyNoOutstandingExpectation: function () {
          $rootScope.$digest();
          if (expectations.length) {
            throw new Error('Unsatisfied requests: ' + expectations.join(', '));
          }
        }
      };

      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectCreate
       * @name expectCreate
       * @description
       * Create an expectation that `DSHttpAdapter.create` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectCreate(resourceConfig, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectCreate({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, {
			 *      author: 'John Anderson'
			 *  }).respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectDEL
       * @name expectDEL
       * @description
       * Create an expectation that `DSHttpAdapter.DEL` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectDEL(url[, config])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectDEL('/api/posts/1');
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectDestroy
       * @name expectDestroy
       * @description
       * Create an expectation that `DSHttpAdapter.destroy` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectDestroy(resourceConfig, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectDestroy({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1);
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectDestroyAll
       * @name expectDestroyAll
       * @description
       * Create an expectation that `DSHttpAdapter.destroyAll` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectDestroyAll(resourceConfig, id, params[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectDestroyAll({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1, {
			 *      author: 'Sally'
			 *  }, {
			 *      params: {
			 *          where: {
			 *              author: {
			 *                  '==': 'John Anderson'
			 *              }
			 *          }
			 *      }
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectFind
       * @name expectFind
       * @description
       * Create an expectation that `DSHttpAdapter.find` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectFind(resourceConfig, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectFind({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1)
       *  .respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectFindAll
       * @name expectFindAll
       * @description
       * Create an expectation that `DSHttpAdapter.findAll` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectFindAll(resourceConfig, params[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectFindAll({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, {
			 *      params: {
			 *          where: {
			 *              author: {
			 *                  '==': 'John Anderson'
			 *              }
			 *          }
			 *      }
			 *  }).respond([{
			 *      author: 'Sally',
			 *      id: 1
			 *  }]);
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectGET
       * @name expectGET
       * @description
       * Create an expectation that `DSHttpAdapter.GET` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectGET(url[, config])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectGET('/api/posts/1')
       *      .respond({ author: 'John Anderson', id: 1 });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectHTTP
       * @name expectHTTP
       * @description
       * Create an expectation that `DSHttpAdapter.HTTP` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectHTTP(config)
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectHTTP({
			 *      url: '/api/posts/1',
			 *      method: 'GET'
			 *  }).respond({ author: 'John Anderson', id: 1 });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectPOST
       * @name expectPOST
       * @description
       * Create an expectation that `DSHttpAdapter.POST` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectPOST(url[, attrs][, config])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectPOST('/api/posts/1', { author: 'John Anderson' })
       *      .respond({ author: 'John Anderson', id: 1 });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectPUT
       * @name expectPUT
       * @description
       * Create an expectation that `DSHttpAdapter.PUT` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectPUT(url[, attrs][, config])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectPUT('/api/posts/1', { author: 'Sally' })
       *      .respond({ author: 'Sally', id: 1 });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectUpdate
       * @name expectUpdate
       * @description
       * Create an expectation that `DSHttpAdapter.update` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectUpdate(resourceConfig, id, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectUpdate({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1, {
			 *      author: 'Sally'
			 *  }).respond({
			 *      author: 'Sally',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DSHttpAdapter.methods:expectUpdateAll
       * @name expectUpdateAll
       * @description
       * Create an expectation that `DSHttpAdapter.updateAll` will be called.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.expectUpdateAll(resourceConfig, attrs, params[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.expectUpdateAll({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, {
			 *      author: 'Sally'
			 *  }, {
			 *      params: {
			 *          where: {
			 *              author: {
			 *                  '==': 'John Anderson'
			 *              }
			 *          }
			 *      }
			 *  }).respond([{
			 *      author: 'Sally',
			 *      id: 1
			 *  }]);
       * ```
       */
      angular.forEach(asyncMethods, function (name) {
        DSHttpAdapter['expect' + name[0].toUpperCase() + name.substring(1)] = createShortMethod(name, expectations);
      });

      angular.extend(DSHttpAdapter, stubs);

      return DSHttpAdapter;
    };
  }

  function DSLocalStorageAdapterProvider() {
    var expectations = [];
    var requests = [];
    var stubs = {};
    var asyncMethods = [
      'create',
      'destroy',
      'find',
      'update'
    ];

    angular.forEach(asyncMethods, function (name) {
      stubs[name] = mockAsync(name, 'DSLocalStorageAdapter', expectations, requests);
      sinon.spy(stubs, name);
    });

    this.$get = function () {

      var defaults = {};

      this.defaults = {};

      /**
       * @doc interface
       * @id DSLocalStorageAdapter
       * @name DSLocalStorageAdapter
       * @description
       * A mock implementation of `DSLocalStorageAdapter` with helper methods for declaring and testing expectations.
       *
       * __angular-data-mocks requires sinon to be loaded in order to work.__
       *
       * See the [testing guide](/documentation/guide/angular-data-mocks/index).
       */
      var DSLocalStorageAdapter = {

        defaults: defaults,

        /**
         * @doc method
         * @id DSLocalStorageAdapter.methods:expect
         * @name expect
         * @description
         * Create an expectation.
         *
         * @param {string} name The name of the function that is expected to be called.
         * @returns {object} expectation
         */
        expect: function (name) {
          var args = Array.prototype.slice.call(arguments, 1);
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
        },

        /**
         * @doc method
         * @id DSLocalStorageAdapter.methods:flush
         * @name flush
         * @description
         * Flush the pending expectations.
         *
         * @param {number=} count Flush a specified number of requests.
         */
        flush: function (count) {
          if (!requests.length) {
            throw new Error('No pending DS requests to flush !');
          }

          if (angular.isDefined(count)) {
            while (count--) {
              if (!requests.length) {
                throw new Error('No more pending DS requests to flush !');
              }
              testCurrentRequest(expectations, requests);
            }
          } else {
            while (requests.length) {
              testCurrentRequest(expectations, requests);
            }
          }
          $rootScope.$digest();
        },

        /**
         * @doc method
         * @id DSLocalStorageAdapter.methods:verifyNoOutstandingExpectation
         * @name verifyNoOutstandingExpectation
         * @description
         * Ensure that no expectations remain unfulfilled.
         */
        verifyNoOutstandingExpectation: function () {
          $rootScope.$digest();
          if (expectations.length) {
            throw new Error('Unsatisfied requests: ' + expectations.join(', '));
          }
        }
      };

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:expectCreate
       * @name expectCreate
       * @description
       * Create an expectation that `DSLocalStorageAdapter.create` will be called.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.expectCreate(resourceConfig, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSLocalStorageAdapter.expectCreate({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, {
			 *      author: 'John Anderson'
			 *  }).respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:expectDestroy
       * @name expectDestroy
       * @description
       * Create an expectation that `DSLocalStorageAdapter.destroy` will be called.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.expectDestroy(resourceConfig, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSLocalStorageAdapter.expectDestroy({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1);
       * ```
       */
      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:expectFind
       * @name expectFind
       * @description
       * Create an expectation that `DSLocalStorageAdapter.find` will be called.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.expectFind(resourceConfig, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSLocalStorageAdapter.expectFind({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1)
       *  .respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:expectUpdate
       * @name expectUpdate
       * @description
       * Create an expectation that `DSLocalStorageAdapter.update` will be called.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.expectUpdate(resourceConfig, id, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DSLocalStorageAdapter.expectUpdate({
			 *      baseUrl: '/api',
			 *      endpoint: '/posts'
			 *  }, 1, {
			 *      author: 'Sally'
			 *  }).respond({
			 *      author: 'Sally',
			 *      id: 1
			 *  });
       * ```
       */
      angular.forEach(asyncMethods, function (name) {
        DSLocalStorageAdapter['expect' + name[0].toUpperCase() + name.substring(1)] = createShortMethod(name, expectations);
      });

      angular.extend(DSLocalStorageAdapter, stubs);

      return DSLocalStorageAdapter;
    };
  }

  function DSProvider() {
    var expectations = [],
      requests = [],
      stubs = {},
      asyncMethods = [
        'create',
        'destroy',
        'destroyAll',
        'find',
        'findAll',
        'loadRelations',
        'refresh',
        'save',
        'update',
        'updateAll'
      ],
      syncMethods = [
        'bindAll',
        'bindOne',
        'changes',
        'defineResource',
        'createInstance',
        'digest',
        'eject',
        'ejectAll',
        'filter',
        'get',
        'hasChanges',
        'inject',
        'lastModified',
        'lastSaved',
        'previous'
      ];

    angular.forEach(asyncMethods, function (name) {
      stubs[name] = mockAsync(name, 'DS', expectations, requests);
      sinon.spy(stubs, name);
    });

    angular.forEach(syncMethods, function (name) {
      stubs[name] = sinon.stub();
    });

    this.$get = function () {

      var defaults = {};

      this.defaults = defaults;

      /**
       * @doc interface
       * @id DS
       * @name DS
       * @description
       * A mock implementation of `DS` with helper methods for declaring and testing expectations.
       *
       * __angular-data-mocks requires sinon to be loaded in order to work.__
       *
       * See the [testing guide](/documentation/guide/angular-data-mocks/index).
       */
      var DS = {

        defaults: defaults,

        /**
         * @doc method
         * @id DS.methods:expect
         * @name expect
         * @description
         * Create an expectation.
         *
         * ## Signature:
         * ```js
         * DS.expect(methodName[, ...args])
         * ```
         *
         * ## Example:
         * ```js
         *  DS.expect('find', 'post', 1).respond({
				 *      author: 'John Anderson',
				 *      id: 1
				 *  });
         *
         *  UserController.getUser();
         *  $scope.$apply();
         *
         *  DS.flush();
         *
         *  assert.equal(DS.find.callCount, 1);
         * ```
         *
         * @param {string} name The name of the function that is expected to be called.
         * @returns {object} expectation
         */
        expect: function (name) {
          var args = Array.prototype.slice.call(arguments, 1);
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
        },

        /**
         * @doc method
         * @id DS.methods:flush
         * @name flush
         * @description
         * Flush the pending expectations.
         *
         * ## Signature:
         * ```js
         * DS.flush([count])
         * ```
         *
         * ## Example:
         * ```js
         *  DS.expectFind('post', 1).respond({
				 *      author: 'John Anderson',
				 *      id: 1
				 *  });
         *
         *  UserController.getUser();
         *  $scope.$apply();
         *
         *  DS.flush();
         *
         *  assert.equal(DS.find.callCount, 1);
         * ```
         *
         * @param {number=} count Flush a specified number of requests.
         */
        flush: function (count) {
          if (!requests.length) {
            throw new Error('No pending DS requests to flush !');
          }

          if (angular.isDefined(count)) {
            while (count--) {
              if (!requests.length) {
                throw new Error('No more pending DS requests to flush !');
              }
              testCurrentRequest(expectations, requests);
            }
          } else {
            while (requests.length) {
              testCurrentRequest(expectations, requests);
            }
          }
          $rootScope.$digest();
        },

        /**
         * @doc method
         * @id DS.methods:verifyNoOutstandingExpectation
         * @name verifyNoOutstandingExpectation
         * @description
         * Ensure that no expectations remain unfulfilled.
         *
         * ## Signature:
         * ```js
         * DS.verifyNoOutstandingExpectation()
         * ```
         *
         * ## Example:
         * ```js
         * afterEach(function () {
				 *      DS.verifyNoOutstandingExpectation();
				 * });
         * ```
         */
        verifyNoOutstandingExpectation: function () {
          $rootScope.$digest();
          if (expectations.length) {
            throw new Error('Unsatisfied requests: ' + expectations.join(', '));
          }
        },

        utils: utils,
        errors: errors
      };

      /**
       * @doc method
       * @id DS.methods:expectCreate
       * @name expectCreate
       * @description
       * Create an expectation that `DS.create` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectCreate(resourceName, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectCreate('post', {
			 *      author: 'John Anderson'
			 *  }).respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectDestroy
       * @name expectDestroy
       * @description
       * Create an expectation that `DS.destroy` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectDestroy(resourceName, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectDestroy('post', 1);
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectDestroyAll
       * @name expectDestroyAll
       * @description
       * Create an expectation that `DS.destroyAll` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectDestroyAll(resourceName, params[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectDestroyAll('post', {
			 *      where: {
			 *          author: {
			 *              '==': 'John Anderson'
			 *          }
			 *      }
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectFind
       * @name expectFind
       * @description
       * Create an expectation that `DS.find` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectFind(resourceName, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectFind('post', 1).respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectFindAll
       * @name expectFindAll
       * @description
       * Create an expectation that `DS.findAll` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectFindAll(resourceName, params[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectFindAll('post', {
			 *      where: {
			 *          author: {
			 *              '==': 'John Anderson'
			 *          }
			 *      }
			 *  }).respond([{
			 *      author: 'John Anderson',
			 *      id: 1
			 *  }]);
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectRefresh
       * @name expectRefresh
       * @description
       * Create an expectation that `DS.refresh` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectRefresh(resourceName, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectRefresh('post', 1).respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectSave
       * @name expectSave
       * @description
       * Create an expectation that `DS.save` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectSave(resourceName, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectSave('post', 1).respond({
			 *      author: 'John Anderson',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectUpdate
       * @name expectUpdate
       * @description
       * Create an expectation that `DS.update` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectUpdate(resourceName, attrs, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectUpdate('post', 1, {
			 *      author: 'Sally'
			 *  }).respond({
			 *      author: 'Sally',
			 *      id: 1
			 *  });
       * ```
       */
      /**
       * @doc method
       * @id DS.methods:expectUpdateAll
       * @name expectUpdateAll
       * @description
       * Create an expectation that `DS.updateAll` will be called.
       *
       * ## Signature:
       * ```js
       * DS.expectUpdateAll(resourceName, attrs, params[, options])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.expectUpdateAll('post', {
			 *      author: 'Sally'
			 *  }, {
       *         where: {
       *             author: {
       *                 '==': 'John Anderson'
       *             }
       *         }
			 *  }).respond([{
			 *      author: 'Sally',
			 *      id: 1
			 *  }]);
       * ```
       */
      angular.forEach(asyncMethods, function (name) {
        DS['expect' + name[0].toUpperCase() + name.substring(1)] = createShortMethod(name, expectations);
      });

      angular.extend(DS, stubs);

      return DS;
    };
  }

  angular.module('angular-data.mocks', ['ng'])
    .provider('DSHttpAdapter', DSHttpAdapterProvider)
    .provider('DSLocalStorageAdapter', DSLocalStorageAdapterProvider)
    .provider('DS', DSProvider);

})(window, window.angular);
