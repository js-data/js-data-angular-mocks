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
      'clear',
      'compute',
      'digest',
      'eject',
      'ejectAll',
      'filter',
      'get',
      'getAll',
      'getAdapterName',
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
    let instanceMethods = [
      'compute',
      'eject',
      'refresh',
      'save',
      'update',
      'destroy',
      'loadRelations',
      'changeHistory',
      'changes',
      'hasChanges',
      'lastModified',
      'lastSaved',
      'previous',
      'revert'
    ];

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

        createInstance(resourceName, attrs, options) {
          let definition = this.definitions[resourceName];
          let item;

          attrs = attrs || {};

          // grab instance constructor function from Resource definition
          let Constructor = definition[definition.class];

          // create instance
          item = new Constructor();

          // add default values
          if (options.defaultValues) {
            DSUtils.deepMixIn(item, options.defaultValues);
          }
          DSUtils.deepMixIn(item, attrs);

          // compute computed properties
          if (definition.computed) {
            definition.compute(item);
          }
          return item;
        },

        defineResource(definition) {
          let DS = this;

          function Resource(options) {
            this.defaultValues = {};
            this.methods = {};
            this.computed = {};
            DSUtils.deepMixIn(this, options);
            let parent = DS.defaults;
            if (definition.extends && definitions[definition.extends]) {
              parent = definitions[definition.extends];
            }
            DSUtils.fillIn(this.defaultValues, parent.defaultValues);
            DSUtils.fillIn(this.methods, parent.methods);
            DSUtils.fillIn(this.computed, parent.computed);
            this.endpoint = ('endpoint' in options) ? options.endpoint : this.name;
          }

          if (DSUtils.isString(definition)) {
            definition = definition.replace(/\s/gi, '');
            definition = {
              name: definition
            };
          }

          try {
            // Resources can inherit from another resource instead of inheriting directly from the data store defaults.
            if (definition.extends && definitions[definition.extends]) {
              // Inherit from another resource
              Resource.prototype = definitions[definition.extends];
            } else {
              // Inherit from global defaults
              Resource.prototype = DS.defaults;
            }
            definitions[definition.name] = new Resource(definition);

            var def = definitions[definition.name];

            def.getResource = resourceName => DS.definitions[resourceName];

            def.n = def.name;

            // Setup nested parent configuration
            if (def.relations) {
              def.relationList = [];
              def.relationFields = [];
              DSUtils.forOwn(def.relations, (relatedModels, type) => {
                DSUtils.forOwn(relatedModels, (defs, relationName) => {
                  if (!DSUtils._a(defs)) {
                    relatedModels[relationName] = [defs];
                  }
                  DSUtils.forEach(relatedModels[relationName], d => {
                    d.type = type;
                    d.relation = relationName;
                    d.name = def.name;
                    def.relationList.push(d);
                    if (d.localField) {
                      def.relationFields.push(d.localField);
                    }
                  });
                });
              });
              if (def.relations.belongsTo) {
                DSUtils.forOwn(def.relations.belongsTo, (relatedModel, modelName) => {
                  DSUtils.forEach(relatedModel, relation => {
                    if (relation.parent) {
                      def.parent = modelName;
                      def.parentKey = relation.localKey;
                      def.parentField = relation.localField;
                    }
                  });
                });
              }
              if (typeof Object.freeze === 'function') {
                Object.freeze(def.relations);
                Object.freeze(def.relationList);
              }
            }

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

            // Apply developer-defined instance methods
            DSUtils.forOwn(def.methods, (fn, m) => {
              def[_class].prototype[m] = fn;
            });

            /**
             * var user = User.createInstance({ id: 1 });
             * user.set('foo', 'bar');
             */
            def[_class].prototype.set = function (key, value) {
              DSUtils.set(this, key, value);
              def.compute(this);
              if (def.instanceEvents) {
                setTimeout(() => {
                  this.emit('DS.change', def, this);
                }, 0);
              }
              def.handleChange(this);
              return this;
            };

            /**
             * var user = User.createInstance({ id: 1 });
             * user.get('id'); // 1
             */
            def[_class].prototype.get = function (key) {
              return DSUtils.get(this, key);
            };

            if (def.instanceEvents) {
              DSUtils.Events(def[_class].prototype);
            }

            // Setup the relation links
            DSUtils.applyRelationGettersToTarget(DS, def, def[_class].prototype);

            let parentOmit = null;
            if (!def.hasOwnProperty('omit')) {
              parentOmit = def.omit;
              def.omit = [];
            } else {
              parentOmit = DS.defaults.omit;
            }
            def.omit = def.omit.concat(parentOmit || []);

            // Prepare for computed properties
            DSUtils.forOwn(def.computed, (fn, field) => {
              if (DSUtils.isFunction(fn)) {
                def.computed[field] = [fn];
                fn = def.computed[field];
              }
              if (def.methods && field in def.methods) {
                def.errorFn(`Computed property "${field}" conflicts with previously defined prototype method!`);
              }
              def.omit.push(field);
              var deps;
              if (fn.length === 1) {
                let match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
                deps = match[1].split(',');
                def.computed[field] = deps.concat(fn);
                fn = def.computed[field];
                if (deps.length) {
                  def.errorFn('Use the computed property array syntax for compatibility with minified code!');
                }
              }
              deps = fn.slice(0, fn.length - 1);
              DSUtils.forEach(deps, (val, index) => {
                deps[index] = val.trim();
              });
              fn.deps = DSUtils.filter(deps, dep => {
                return !!dep;
              });
            });

            // add instance proxies of DS methods
            DSUtils.forEach(instanceMethods, name => {
              def[_class].prototype[`DS${DSUtils.pascalCase(name)}`] = function (...args) {
                args.unshift(this[def.idAttribute] || this);
                args.unshift(def.name);
                return DS[name].apply(DS, args);
              };
            });

            // manually add instance proxy for DS#create
            def[_class].prototype.DSCreate = function (...args) {
              args.unshift(this);
              args.unshift(def.name);
              return DS.create.apply(DS, args);
            };

            // Initialize store data for the new resource
            DS.store[def.name] = {
              collection: [],
              expiresHeap: new DSUtils.BinaryHeap(x => x.expires, (x, y) => x.item === y),
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

            let resource = DS.store[def.name];

            // proxy DS methods with shorthand ones
            let fns = ['registerAdapter', 'getAdapterName', 'getAdapter', 'is', '!clear'];
            for (let key in DS) {
              if (typeof DS[key] === 'function') {
                fns.push(key);
              }
            }

            /**
             * Create the Resource shorthands that proxy DS methods. e.g.
             *
             * var store = new JSData.DS();
             * var User = store.defineResource('user');
             *
             * store.update(resourceName, id, attrs[, options]) // DS method
             * User.update(id, attrs[, options]) // DS method proxied on a Resource
             */
            DSUtils.forEach(fns, key => {
              let k = key;
              if (k[0] === '!') {
                return;
              }
              if (DS[k].shorthand !== false) {
                def[k] = (...args) => {
                  args.unshift(def.name);
                  return DS[k].apply(DS, args);
                };
                def[k].before = fn => {
                  let orig = def[k];
                  def[k] = (...args) => {
                    return orig.apply(def, fn.apply(def, args) || args);
                  };
                };
              } else {
                def[k] = (...args) => DS[k].apply(DS, args);
              }
            });

            def.beforeValidate = DSUtils.promisify(def.beforeValidate);
            def.validate = DSUtils.promisify(def.validate);
            def.afterValidate = DSUtils.promisify(def.afterValidate);
            def.beforeCreate = DSUtils.promisify(def.beforeCreate);
            def.afterCreate = DSUtils.promisify(def.afterCreate);
            def.beforeUpdate = DSUtils.promisify(def.beforeUpdate);
            def.afterUpdate = DSUtils.promisify(def.afterUpdate);
            def.beforeDestroy = DSUtils.promisify(def.beforeDestroy);
            def.afterDestroy = DSUtils.promisify(def.afterDestroy);

            let defaultAdapter;
            if (def.hasOwnProperty('defaultAdapter')) {
              defaultAdapter = def.defaultAdapter;
            }

            // setup "actions"
            DSUtils.forOwn(def.actions, (action, name) => {
              if (def[name] && !def.actions[name]) {
                throw new Error(`Cannot override existing method "${name}"!`);
              }
              action.request = action.request || (config => config);
              action.response = action.response || (response => response);
              action.responseError = action.responseError || (err => DSUtils.Promise.reject(err));
              def[name] = function (id, options) {
                if (DSUtils._o(id)) {
                  options = id;
                }
                options = options || {};
                let adapter = def.getAdapter(action.adapter || defaultAdapter || 'http');
                let config = DSUtils.deepMixIn({}, action);
                if (!options.hasOwnProperty('endpoint') && config.endpoint) {
                  options.endpoint = config.endpoint;
                }
                if (typeof options.getEndpoint === 'function') {
                  config.url = options.getEndpoint(def, options);
                } else {
                  let args = [options.basePath || adapter.defaults.basePath || def.basePath, adapter.getEndpoint(def, DSUtils._sn(id) ? id : null, options)];
                  if (DSUtils._sn(id)) {
                    args.push(id);
                  }
                  args.push(action.pathname || name);
                  config.url = DSUtils.makePath.apply(null, args);
                }
                config.method = config.method || 'GET';
                DSUtils.deepMixIn(config, options);
                return new DSUtils.Promise(r => r(config))
                  .then(options.request || action.request)
                  .then(config => adapter.HTTP(config))
                  .then(options.response || action.response, options.responseError || action.responseError);
              };
            });

            // mix in events
            DSUtils.Events(def);

            def.handleChange = data => {
              resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
              if (def.notify) {
                setTimeout(() => {
                  def.emit('DS.change', def, data);
                }, 0);
              }
            };

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
