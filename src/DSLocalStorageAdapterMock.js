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
