/**
 * @author Jason Dobry <jason.dobry@gmail.com>
 * @file angular-data-mocks.js
 * @version <%= pkg.version %> - Homepage <https://github.com/jmdobry/angular-data-mocks>
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
