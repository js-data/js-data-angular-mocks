/*jshint evil:true, loopfunc:true*/
let angular, sinon;
try {
  sinon = require('sinon');
} catch (e) {
}

if (!sinon) {
  try {
    sinon = window.sinon;
  } catch (e) {
  }
}
if (!sinon) {
  throw new Error('sinon must be loaded!');
}
try {
  angular = require('angular');
} catch (e) {
}

if (!angular) {
  try {
    angular = window.angular;
  } catch (e) {
  }
}
if (!angular) {
  throw new Error('angular must be loaded!');
}

class DS {
  constructor() {
    let expectations = [];
    let definitions = [];
    let requests = [];
    let responses = [];
    let stubs = {};
    let asyncMethods = [
      'create',
      'destroy',
      'destroyAll',
      'find',
      'findAll',
      'loadRelations',
      'reap',
      'refresh',
      'refreshAll',
      'save',
      'update',
      'updateAll'
    ];
    let syncMethods = [
      'bindAll',
      'bindOne',
      'changes',
      'changeHistory',
      'compute',
      'createInstance',
      'digest',
      'eject',
      'ejectAll',
      'filter',
      'get',
      'getAll',
      'getAdapter',
      'hasChanges',
      'inject',
      'is',
      'lastModified',
      'lastSaved',
      'link',
      'linkAll',
      'linkInverse',
      'registerAdapter',
      'revert',
      'previous',
      'unlinkInverse'
    ];

    class Resource {
      constructor(utils, options) {
        utils.deepMixIn(this, options);

        if ('endpoint' in options) {
          this.endpoint = options.endpoint;
        } else {
          this.endpoint = this.name;
        }
      }
    }

    this.$get = ['DSMockUtils', 'DSUtils', 'DSErrors', '$log', '$rootScope', function (DSMockUtils, DSUtils, DSErrors, $log, $rootScope) {

      let MockDSExpectation = DSMockUtils.MockDSExpectation;
      let defaults = {
        deserialize(resourceName, data) {
          return data.data ? data.data : data;
        }
      };

      angular.forEach(asyncMethods, name => {
        stubs[name] = DSMockUtils.mockAsync(name, 'DS', expectations, definitions, requests, responses);
        sinon.spy(stubs, name);
      });

      angular.forEach(syncMethods, name => stubs[name] = sinon.stub());

      this.defaults = defaults;

      let store = {};
      let _definitions = {};

      let DS = {
        store,
        s: store,
        definitions: _definitions,
        defs: _definitions,
        defaults,

        expect(name, ...args) {
          if (args[0] === undefined) {
            throw new Error('Resource not defined for expectation!');
          }
          let expectation = new MockDSExpectation(name, args);
          expectations.push(expectation);

          return {
            respond: (...args) => expectation.response = args
          };
        },

        flush(count) {
          if (!responses.length) {
            throw new Error('No pending DS requests to flush!');
          }

          if (angular.isDefined(count)) {
            while (count--) {
              if (!responses.length) {
                throw new Error('No more pending DS requests to flush!');
              }
              responses.shift()();
            }
          } else {
            while (responses.length) {
              responses.shift()();
            }
          }
          $rootScope.$digest();
        },

        when(name, ...args) {
          if (args[0] === undefined) {
            throw new Error('Resource not defined for definition!');
          }
          let definition = new MockDSExpectation(name, args);
          definitions.push(definition);

          return {
            respond(...args) {
              definition.response = args;
            }
          };
        },

        verifyNoOutstandingExpectation() {
          $rootScope.$digest();
          if (expectations.length) {
            throw new Error(`Unsatisfied requests: ${expectations.join(', ')}`);
          }
        },

        utils: DSUtils,
        errors: DSErrors,

        defineResource(definition) {
          let DS = this;

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

            let def = DS.definitions[definition.name];

            def.n = def.name;

            // Create the wrapper class for the new resource
            var _class = def['class'] = DSUtils.pascalCase(def.name);
            try {
              if (typeof def.useClass === 'function') {
                eval(`function ${_class}() { def.useClass.call(this); }`);
                def[_class] = eval(_class);
                def[_class].prototype = (function (proto) {
                  function Ctor() {
                  }

                  Ctor.prototype = proto;
                  return new Ctor();
                })(def.useClass.prototype);
              } else {
                eval(`function ${_class}() {}`);
                def[_class] = eval(_class);
              }
            } catch (e) {
              def[_class] = function () {
              };
            }

            // Apply developer-defined methods
            if (def.methods) {
              DSUtils.deepMixIn(def[def.class].prototype, def.methods);
            }

            def[_class].prototype.set = function (key, value) {
              DSUtils.set(this, key, value);
              var observer = DS.s[def.n].observers[this[def.idAttribute]];
              if (observer && !DSUtils.observe.hasObjectObserve) {
                observer.deliver();
              } else {
                DS.compute(def.n, this);
              }
              return this;
            };

            def[_class].prototype.get = function (key) {
              return DSUtils.get(this, key);
            };

            // Initialize store data for the new resource
            DS.store[def.name] = {
              collection: [],
              completedQueries: {},
              queryData: {},
              pendingQueries: {},
              index: {},
              modified: {},
              saved: {},
              previousAttributes: {},
              observers: {},
              changeHistories: {},
              changeHistory: [],
              collectionModified: 0
            };

            // Proxy DS methods with shorthand ones
            let fns = ['registerAdapter', 'getAdapter', 'is'];
            for (var key in DS) {
              if (typeof DS[key] === 'function') {
                fns.push(key);
              }
            }

            DSUtils.forEach(fns, key => {
              let k = key;
              if (DS[k].shorthand !== false) {
                def[k] = (...args) => {
                  args.unshift(def.n);
                  return DS[k].apply(DS, args);
                };
              } else {
                def[k] = (...args) => DS[k].apply(DS, args);
              }
            });

            DSUtils.Events(def);

            return def;
          } catch (err) {
            $log.error(err);
            delete DS.definitions[definition.name];
            delete DS.store[definition.name];
            throw err;
          }
        }
      };

      angular.forEach(asyncMethods, name => DS[`expect${name[0].toUpperCase()}${name.substring(1)}`] = DSMockUtils.createShortMethod(name, expectations));

      angular.extend(DS, stubs);

      sinon.spy(DS, 'defineResource');

      DSUtils.Events(DS);

      return DS;
    }];
  }
}

class DSHttpAdapter {
  constructor() {
    let expectations = [];
    let definitions = [];
    let requests = [];
    let responses = [];
    let stubs = {};
    let asyncMethods = [
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

    this.$get = ['DSMockUtils', '$rootScope', function (DSMockUtils, $rootScope) {

      let MockDSAdapterExpectation = DSMockUtils.MockDSAdapterExpectation;
      let defaults = {};

      angular.forEach(asyncMethods, name => {
        stubs[name] = DSMockUtils.mockAsync(name, 'DSHttpAdapter', expectations, definitions, requests, responses);
        sinon.spy(stubs, name);
      });

      this.defaults = {};

      let DSHttpAdapter = {

        defaults: defaults,

        expect(name, ...args) {
          if (args[0] === undefined) {
            throw new Error('Resource not defined for expectation!');
          }
          let expectation = new MockDSAdapterExpectation(name, args);
          expectations.push(expectation);

          return {
            respond(...args) {
              expectation.response = args;
            }
          };
        },

        flush(count) {
          if (!responses.length) {
            throw new Error('No pending DSHttpAdapter requests to flush !');
          }

          if (angular.isDefined(count)) {
            while (count--) {
              if (!responses.length) {
                throw new Error('No more pending DSHttpAdapter requests to flush !');
              }
              responses.shift()();
            }
          } else {
            while (responses.length) {
              responses.shift()();
            }
          }
          $rootScope.$digest();
        },

        when(name, ...args) {
          if (args[0] === undefined) {
            throw new Error('Resource not defined for definition');
          }
          let definition = new MockDSAdapterExpectation(name, args);
          definitions.push(definition);

          return {
            respond(...args) {
              definition.response = args;
            }
          };
        },

        verifyNoOutstandingExpectation() {
          $rootScope.$digest();
          if (expectations.length) {
            throw new Error(`Unsatisfied requests: ${expectations.join(', ')}`);
          }
        }
      };

      angular.forEach(asyncMethods, name => DSHttpAdapter[`expect${name[0].toUpperCase()}${name.substring(1)}`] = DSMockUtils.createShortMethod(name, expectations));
      angular.extend(DSHttpAdapter, stubs);

      return DSHttpAdapter;
    }];
  }
}

angular.module('js-data-mocks', ['js-data'])
  .value('version', '<%= pkg.version %>')
  .service('DSMockUtils', ['$q', $q => {

    class MockDSExpectation {
      constructor(method, args) {
        this.method = method;
        this.args = args;
        this.resourceName = this.args[0];
      }

      match(m, resourceName) {
        if (this.method !== m) {
          return false;
        } else if (this.resourceName !== resourceName) {
          return false;
        }
        return true;
      }

      matchArgs(a) {
        if (this.args.length === 0) {
          return true;
        }

        let isEqual = false;
        for (var i = 0; i < this.args.length; i++) {
          isEqual = angular.equals(this.args[i], a[i]);
          if (!isEqual) {
            break;
          }
        }
        return isEqual;
      }
    }

    class MockDSAdapterExpectation {
      constructor(method, args) {
        this.method = method;
        this.args = args;
      }

      match(m) {
        return this.method === m;
      }

      matchArgs(a) {
        if (this.args.length === 0) {
          return true;
        }

        let isEqual = false;
        for (var i = 0; i < this.args.length; i++) {
          isEqual = angular.equals(this.args[i], a[i]);
          if (!isEqual) {
            break;
          }
        }
        return isEqual;
      }
    }

    return {
      MockDSExpectation,
      MockDSAdapterExpectation,
      prettyPrint(data) {
        return (angular.isString(data) || angular.isFunction(data)) ? data : angular.toJson(data);
      },
      createResponse(resource, deferred, response) {
        return () => !(response[0] instanceof Error) ? deferred.resolve.apply(null, response) : deferred.reject.apply(null, response);
      },
      mockAsync(name, namespace, expectations, definitions, requests, responses) {
        return (...args) => {
          let expectation = expectations[0];
          let deferred = $q.defer();
          let resourceName = args[0];

          if (expectation && expectation.match(name, resourceName)) {
            expectations.shift();

            if (!expectation.matchArgs(args)) {
              throw new Error(`Expected ${expectation} with different args\nEXPECTED: ${this.prettyPrint(expectation.args)}\nGOT:      ${this.prettyPrint(args)}`);
            }

            if (expectation.response) {
              responses.push(this.createResponse(resourceName, deferred, expectation.response));
              return deferred.promise;
            } else {
              throw new Error(`No response defined for ${namespace}.${expectation.method}`);
            }
          }

          // try to match request to any backend definitions
          for (var i = 0; i < definitions.length; i++) {
            let definition = definitions[i];

            if (definition.match(name, resourceName)) {
              if (definition.response) {
                responses.push(this.createResponse(resourceName, deferred, definition.response));
                return deferred.promise;
              } else {
                throw new Error('No response defined!');
              }
            }
          }

          // Any requests that made it this far aren't being handled, so throw an exception
          throw new Error(`Unexpected request: ${namespace}.${name} ${resourceName}\nNo more requests expected`);
        };
      },
      createShortMethod(name, expectations) {
        return (...args) => {
          if (args[0] === undefined) {
            throw new Error('Resource not defined for expectation!');
          }
          let expectation = new MockDSExpectation(name, args);
          expectations.push(expectation);

          return {
            respond(...args) {
              expectation.response = args;
            }
          };
        };
      }
    };
  }])
  .provider('DS', DS)
  .provider('DSHttpAdapter', DSHttpAdapter);

module.exports = 'js-data-mocks';
module.exports.name = 'js-data-mocks';
