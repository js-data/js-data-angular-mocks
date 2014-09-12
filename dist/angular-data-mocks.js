(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author Jason Dobry <jason.dobry@gmail.com>
 * @file angular-data-mocks.js
 * @version 1.0.0-rc.1 - Homepage <https://github.com/jmdobry/angular-data-mocks>
 * @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>
 * @license MIT <https://github.com/jmdobry/angular-data-mocks/blob/master/LICENSE>
 *
 * @overview A mock of angular-data for testing purposes.
 */

function DSHttpAdapterProvider() {
  var expectations = [];
  var definitions = [];
  var requests = [];
  var responses = [];
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

  this.$get = ['DSMockUtils', function (DSMockUtils) {

    var MockDSAdapterExpectation = DSMockUtils.MockDSAdapterExpectation;
    var defaults = {};

    angular.forEach(asyncMethods, function (name) {
      stubs[name] = DSMockUtils.mockAsync(name, 'DSHttpAdapter', expectations, definitions, requests, responses);
      sinon.spy(stubs, name);
    });

    this.defaults = {};

    /**
     * @doc interface
     * @id DSHttpAdapter
     * @name DSHttpAdapter
     * @description
     * A mock implementation of `DSHttpAdapter` with helper methods for declaring and testing expectations.
     *
     * __angular-data-mocks requires SinonJS to be loaded in order to work.__
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
        var expectation = new MockDSAdapterExpectation(name, args);
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
        if (!responses.length) throw new Error('No pending DSHttpAdapter requests to flush !');

        if (angular.isDefined(count)) {
          while (count--) {
            if (!responses.length) throw new Error('No more pending DSHttpAdapter requests to flush !');
            responses.shift()();
          }
        } else {
          while (responses.length) {
            responses.shift()();
          }
        }
        $rootScope.$digest();
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:when
       * @name when
       * @description
       * Create a when expectation.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.when(methodName[, ...args])
       * ```
       *
       * ## Example:
       * ```js
       *  DSHttpAdapter.when('GET').respond({
       *      author: 'John Anderson',
       *      id: 1
       *  });
       *
       *  UserController.getUser();
       *  $scope.$apply();
       *
       *  DSHttpAdapter.flush();
       *
       *  assert.equal(DSHttpAdapter.find.callCount, 1);
       * ```
       *
       * @param {string} name The name of the function to respond to.
       * @returns {object} expectation
       */
      when: function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args[0] === undefined) {
          throw new Error('Resource not defined for definition');
        }
        var definition = new MockDSAdapterExpectation(name, args);
        definitions.push(definition);

        return {
          respond: function () {
            definition.response = Array.prototype.slice.call(arguments);
          }
        };
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
      DSHttpAdapter['expect' + name[0].toUpperCase() + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
    });

    angular.extend(DSHttpAdapter, stubs);

    return DSHttpAdapter;
  }];
}

module.exports = DSHttpAdapterProvider;

},{}],2:[function(require,module,exports){
function DSLocalStorageAdapterProvider() {
  var expectations = [];
  var definitions = [];
  var requests = [];
  var responses = [];
  var stubs = {};
  var asyncMethods = [
    'create',
    'destroy',
    'find',
    'update'
  ];

  this.$get = ['DSMockUtils', function (DSMockUtils) {

    var MockDSAdapterExpectation = DSMockUtils.MockDSAdapterExpectation;
    var defaults = {};

    angular.forEach(asyncMethods, function (name) {
      stubs[name] = DSMockUtils.mockAsync(name, 'DSLocalStorageAdapter', expectations, definitions, requests, responses);
      sinon.spy(stubs, name);
    });

    this.defaults = {};

    /**
     * @doc interface
     * @id DSLocalStorageAdapter
     * @name DSLocalStorageAdapter
     * @description
     * A mock implementation of `DSLocalStorageAdapter` with helper methods for declaring and testing expectations.
     *
     * __angular-data-mocks requires SinonJS to be loaded in order to work.__
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
        var expectation = new MockDSAdapterExpectation(name, args);
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
        if (!responses.length) throw new Error('No pending DSLocalStorageAdapter requests to flush !');

        if (angular.isDefined(count)) {
          while (count--) {
            if (!responses.length) throw new Error('No more pending DSLocalStorageAdapter requests to flush !');
            responses.shift()();
          }
        } else {
          while (responses.length) {
            responses.shift()();
          }
        }
        $rootScope.$digest();
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:when
       * @name when
       * @description
       * Create a when expectation.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.when(methodName[, ...args])
       * ```
       *
       * ## Example:
       * ```js
       *  DSLocalStorageAdapter.when('find', { name: 'post', idAttribute: 'id' }, 1).respond({
  	 	 *      author: 'John Anderson',
  	 	 *      id: 1
  	 	 *  });
       *
       *  UserController.getUser();
       *  $scope.$apply();
       *
       *  DSLocalStorageAdapter.flush();
       *
       *  assert.equal(DSLocalStorageAdapter.find.callCount, 1);
       * ```
       *
       * @param {string} name The name of the function to respond to.
       * @returns {object} expectation
       */
      when: function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args[0] === undefined) {
          throw new Error('Resource not defined for definition');
        }
        var definition = new MockDSAdapterExpectation(name, args);
        definitions.push(definition);

        return {
          respond: function () {
            definition.response = Array.prototype.slice.call(arguments);
          }
        };
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
     *  }).respond({
     *      author: 'John Anderson'
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
      DSLocalStorageAdapter['expect' + name[0].toUpperCase() + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
    });

    angular.extend(DSLocalStorageAdapter, stubs);

    return DSLocalStorageAdapter;
  }];
}

module.exports = DSLocalStorageAdapterProvider;

},{}],3:[function(require,module,exports){
/*jshint evil:true*/
function DSProvider() {
  var expectations = [];
  var definitions = [];
  var requests = [];
  var responses = [];
  var stubs = {};
  var asyncMethods = [
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
  ];
  var syncMethods = [
    'bindAll',
    'bindOne',
    'changes',
    'compute',
    'createInstance',
    'defineResource',
    'digest',
    'eject',
    'ejectAll',
    'filter',
    'get',
    'hasChanges',
    'inject',
    'lastModified',
    'lastSaved',
    'link',
    'linkAll',
    'linkInverse',
    'unlinkInverse',
    'previous'
  ];

  var methodsToProxy = [
    'bindAll',
    'bindOne',
    'changes',
    'compute',
    'create',
    'createInstance',
    'destroy',
    'destroyAll',
    'eject',
    'ejectAll',
    'filter',
    'find',
    'findAll',
    'get',
    'hasChanges',
    'inject',
    'lastModified',
    'lastSaved',
    'link',
    'linkAll',
    'linkInverse',
    'unlinkInverse',
    'loadRelations',
    'previous',
    'refresh',
    'save',
    'update',
    'updateAll'
  ];

  function Resource(utils, options) {

    utils.deepMixIn(this, options);

    if ('endpoint' in options) {
      this.endpoint = options.endpoint;
    } else {
      this.endpoint = this.name;
    }
  }

  this.$get = ['DSMockUtils', 'DSUtils', 'DSErrors', '$log', '$rootScope', function (DSMockUtils, DSUtils, DSErrors, $log, $rootScope) {

    var MockDSExpectation = DSMockUtils.MockDSExpectation;
    var defaults = {
      deserialize: function (resourceName, data) {
        return data.data ? data.data : data;
      }
    };

    angular.forEach(asyncMethods, function (name) {
      stubs[name] = DSMockUtils.mockAsync(name, 'DS', expectations, definitions, requests, responses);
      sinon.spy(stubs, name);
    });

    angular.forEach(syncMethods, function (name) {
      stubs[name] = sinon.stub();
    });

    this.defaults = defaults;

    /**
     * @doc interface
     * @id DS
     * @name DS
     * @description
     * A mock implementation of `DS` with helper methods for declaring and testing expectations.
     *
     * __angular-data-mocks requires SinonJS to be loaded in order to work.__
     *
     * See the [testing guide](/documentation/guide/angular-data-mocks/index).
     */
    var DS = {
      store: {},
      definitions: {},

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
        if (!responses.length) throw new Error('No pending DS requests to flush !');

        if (angular.isDefined(count)) {
          while (count--) {
            if (!responses.length) throw new Error('No more pending DS requests to flush !');
            responses.shift()();
          }
        } else {
          while (responses.length) {
            responses.shift()();
          }
        }
        $rootScope.$digest();
      },

      /**
       * @doc method
       * @id DS.methods:when
       * @name when
       * @description
       * Create a when expectation.
       *
       * ## Signature:
       * ```js
       * DS.when(methodName[, ...args])
       * ```
       *
       * ## Example:
       * ```js
       *  DS.when('find', 'post', 1).respond({
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
       * @param {string} name The name of the function to respond to.
       * @returns {object} expectation
       */
      when: function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (args[0] === undefined) {
          throw new Error('Resource not defined for definition');
        }
        var definition = new MockDSExpectation(name, args);
        definitions.push(definition);

        return {
          respond: function () {
            definition.response = Array.prototype.slice.call(arguments);
          }
        };
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

      utils: DSUtils,
      errors: DSErrors
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
      DS['expect' + name[0].toUpperCase() + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
    });

    angular.extend(DS, stubs);

    DS.defineResource = function (definition) {
      var DS = this;

      if (DSUtils.isString(definition)) {
        definition = definition.replace(/\s/gi, '');
        definition = {
          name: definition
        };
      }

      try {
        // Inherit from global defaults
        Resource.prototype = DS.defaults;
        DS.definitions[definition.name] = new Resource(DSUtils, definition);

        var def = DS.definitions[definition.name];

        // Create the wrapper class for the new resource
        def.class = DSUtils.pascalCase(definition.name);
        eval('function ' + def.class + '() {}');
        def[def.class] = eval(def.class);

        // Apply developer-defined methods
        if (def.methods) {
          DSUtils.deepMixIn(def[def.class].prototype, def.methods);
        }

        // Initialize store data for the new resource
        DS.store[def.name] = {
          collection: [],
          completedQueries: {},
          pendingQueries: {},
          index: {},
          modified: {},
          saved: {},
          previousAttributes: {},
          observers: {},
          collectionModified: 0
        };

        // Proxy DS methods with shorthand ones
        angular.forEach(methodsToProxy, function (name) {
          if (name === 'bindOne' || name === 'bindAll') {
            def[name] = function () {
              var args = Array.prototype.slice.call(arguments);
              args.splice(2, 0, def.name);
              return DS[name].apply(DS, args);
            };
          } else {
            def[name] = function () {
              var args = Array.prototype.slice.call(arguments);
              args.unshift(def.name);
              return DS[name].apply(DS, args);
            };
          }
        });

        return def;
      } catch (err) {
        $log.error(err);
        delete this.definitions[definition.name];
        delete this.store[definition.name];
        throw err;
      }
    };

    sinon.spy(DS, 'defineResource');

    return DS;
  }];
}

module.exports = DSProvider;

},{}],4:[function(require,module,exports){
/**
 * @doc overview
 * @id angular-data-mocks
 * @name angular-data-mocks
 * @description
 * Fake angular-data implementation suitable for unit testing angular applications that use the `angular-data.DS` module.
 *
 * __Version:__ 1.0.0-rc.1
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

  angular.module('angular-data.mock-utils', ['angular-data.DS', 'ng'])
    .service('DSMockUtils', ['$q', function ($q) {

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
              throw new Error('No response defined for ' + namespace + '.' + expectation.method);
            }
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
            }
          }

          // Any requests that made it this far aren't being handled, so throw an exception
          throw new Error('Unexpected request: ' + namespace + '.' + name + ' ' + resourceName + '\n' +
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
    .value('version', '1.0.0-rc.1');

})(window, window.angular);

},{"./DSHttpAdapterMock.js":1,"./DSLocalStorageAdapterMock.js":2,"./DSMock.js":3}]},{},[4]);
