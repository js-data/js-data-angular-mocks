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
