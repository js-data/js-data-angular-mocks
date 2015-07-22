/*!
 * js-data-angular-mocks
 * @version 3.0.0 - Homepage <https://github.com/js-data/js-data-angular-mocks>
 * @author Jason Dobry <jason.dobry@gmail.com>
 * @copyright (c) 2014-2015 Jason Dobry 
 * @license MIT <https://github.com/js-data/js-data-angular-mocks/blob/master/LICENSE>
 * 
 * @overview A mock of js-data & js-data-angular for testing purposes.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory((function webpackLoadOptionalExternalModule() { try { return require("sinon"); } catch(e) {} }()), (function webpackLoadOptionalExternalModule() { try { return require("angular"); } catch(e) {} }()));
	else if(typeof define === 'function' && define.amd)
		define(["sinon", "angular"], factory);
	else if(typeof exports === 'object')
		exports["jsDataAngularMocksModuleName"] = factory((function webpackLoadOptionalExternalModule() { try { return require("sinon"); } catch(e) {} }()), (function webpackLoadOptionalExternalModule() { try { return require("angular"); } catch(e) {} }()));
	else
		root["jsDataAngularMocksModuleName"] = factory(root["sinon"], root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	/*jshint evil:true, loopfunc:true*/
	var angular = undefined,
	    sinon = undefined;
	try {
	  sinon = __webpack_require__(1);
	} catch (e) {}

	if (!sinon) {
	  try {
	    sinon = window.sinon;
	  } catch (e) {}
	}
	if (!sinon) {
	  throw new Error('sinon must be loaded!');
	}
	try {
	  angular = __webpack_require__(2);
	} catch (e) {}

	if (!angular) {
	  try {
	    angular = window.angular;
	  } catch (e) {}
	}
	if (!angular) {
	  throw new Error('angular must be loaded!');
	}

	var DS = function DS() {
	  _classCallCheck(this, DS);

	  var expectations = [];
	  var definitions = [];
	  var requests = [];
	  var responses = [];
	  var stubs = {};
	  var asyncMethods = ['create', 'destroy', 'destroyAll', 'find', 'findAll', 'loadRelations', 'reap', 'refresh', 'refreshAll', 'save', 'update', 'updateAll'];
	  var syncMethods = ['bindAll', 'bindOne', 'changes', 'changeHistory', 'clear', 'compute', 'digest', 'eject', 'ejectAll', 'filter', 'get', 'getAll', 'getAdapterName', 'getAdapter', 'hasChanges', 'inject', 'is', 'lastModified', 'lastSaved', 'link', 'linkAll', 'linkInverse', 'registerAdapter', 'revert', 'previous', 'unlinkInverse'];
	  var instanceMethods = ['compute', 'eject', 'refresh', 'save', 'update', 'destroy', 'loadRelations', 'changeHistory', 'changes', 'hasChanges', 'lastModified', 'lastSaved', 'previous', 'revert'];

	  this.$get = ['DSMockUtils', 'DSUtils', 'DSErrors', '$log', '$rootScope', function (DSMockUtils, DSUtils, DSErrors, $log, $rootScope) {

	    var MockDSExpectation = DSMockUtils.MockDSExpectation;
	    var defaults = {
	      deserialize: function deserialize(resourceName, data) {
	        return data.data ? data.data : data;
	      }
	    };

	    angular.forEach(asyncMethods, function (name) {
	      stubs[name] = DSMockUtils.mockAsync(name, 'DS', expectations, definitions, requests, responses);
	      sinon.spy(stubs, name);
	    });

	    angular.forEach(syncMethods, function (name) {
	      return stubs[name] = sinon.stub();
	    });

	    this.defaults = defaults;

	    var store = {};
	    var _definitions = {};

	    var DS = {
	      store: store,
	      s: store,
	      definitions: _definitions,
	      defs: _definitions,
	      defaults: defaults,

	      expect: function expect(name) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        if (args[0] === undefined) {
	          throw new Error('Resource not defined for expectation!');
	        }
	        var expectation = new MockDSExpectation(name, args);
	        expectations.push(expectation);

	        return {
	          respond: function respond() {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            return expectation.response = args;
	          }
	        };
	      },

	      flush: function flush(count) {
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

	      when: function when(name) {
	        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	          args[_key3 - 1] = arguments[_key3];
	        }

	        if (args[0] === undefined) {
	          throw new Error('Resource not defined for definition!');
	        }
	        var definition = new MockDSExpectation(name, args);
	        definitions.push(definition);

	        return {
	          respond: function respond() {
	            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
	              args[_key4] = arguments[_key4];
	            }

	            definition.response = args;
	          }
	        };
	      },

	      verifyNoOutstandingExpectation: function verifyNoOutstandingExpectation() {
	        $rootScope.$digest();
	        if (expectations.length) {
	          throw new Error('Unsatisfied requests: ' + expectations.join(', '));
	        }
	      },

	      utils: DSUtils,
	      errors: DSErrors,

	      createInstance: function createInstance(resourceName, attrs, options) {
	        var definition = this.definitions[resourceName];
	        var item = undefined;

	        attrs = attrs || {};

	        options = DSUtils._(definition, options);

	        // lifecycle
	        options.beforeCreateInstance(options, attrs);

	        // grab instance constructor function from Resource definition
	        var Constructor = definition[definition['class']];

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
	        // lifecycle
	        options.afterCreateInstance(options, item);
	        return item;
	      },

	      defineResource: function defineResource(definition) {
	        var DS = this;

	        function Resource(options) {
	          this.defaultValues = {};
	          this.methods = {};
	          this.computed = {};
	          DSUtils.deepMixIn(this, options);
	          var parent = DS.defaults;
	          if (definition['extends'] && definitions[definition['extends']]) {
	            parent = definitions[definition['extends']];
	          }
	          DSUtils.fillIn(this.defaultValues, parent.defaultValues);
	          DSUtils.fillIn(this.methods, parent.methods);
	          DSUtils.fillIn(this.computed, parent.computed);
	          this.endpoint = 'endpoint' in options ? options.endpoint : this.name;
	        }

	        if (DSUtils.isString(definition)) {
	          definition = definition.replace(/\s/gi, '');
	          definition = {
	            name: definition
	          };
	        }

	        try {
	          var def;

	          var _class;

	          var _ret = (function () {
	            // Resources can inherit from another resource instead of inheriting directly from the data store defaults.
	            if (definition['extends'] && definitions[definition['extends']]) {
	              // Inherit from another resource
	              Resource.prototype = definitions[definition['extends']];
	            } else {
	              // Inherit from global defaults
	              Resource.prototype = DS.defaults;
	            }
	            definitions[definition.name] = new Resource(definition);

	            def = definitions[definition.name];

	            def.getResource = function (resourceName) {
	              return DS.definitions[resourceName];
	            };

	            def.n = def.name;

	            // Setup nested parent configuration
	            if (def.relations) {
	              def.relationList = [];
	              def.relationFields = [];
	              DSUtils.forOwn(def.relations, function (relatedModels, type) {
	                DSUtils.forOwn(relatedModels, function (defs, relationName) {
	                  if (!DSUtils._a(defs)) {
	                    relatedModels[relationName] = [defs];
	                  }
	                  DSUtils.forEach(relatedModels[relationName], function (d) {
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
	                DSUtils.forOwn(def.relations.belongsTo, function (relatedModel, modelName) {
	                  DSUtils.forEach(relatedModel, function (relation) {
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
	            _class = def['class'] = DSUtils.pascalCase(def.name);

	            try {
	              if (typeof def.useClass === 'function') {
	                eval('function ' + _class + '() { def.useClass.call(this); }');
	                def[_class] = eval(_class);
	                def[_class].prototype = (function (proto) {
	                  function Ctor() {}

	                  Ctor.prototype = proto;
	                  return new Ctor();
	                })(def.useClass.prototype);
	              } else {
	                eval('function ' + _class + '() {}');
	                def[_class] = eval(_class);
	              }
	            } catch (e) {
	              def[_class] = function () {};
	            }

	            // Apply developer-defined instance methods
	            DSUtils.forOwn(def.methods, function (fn, m) {
	              def[_class].prototype[m] = fn;
	            });

	            /**
	             * var user = User.createInstance({ id: 1 });
	             * user.set('foo', 'bar');
	             */
	            def[_class].prototype.set = function (key, value) {
	              var _this = this;

	              DSUtils.set(this, key, value);
	              def.compute(this);
	              if (def.instanceEvents) {
	                setTimeout(function () {
	                  _this.emit('DS.change', def, _this);
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

	            var parentOmit = null;
	            if (!def.hasOwnProperty('omit')) {
	              parentOmit = def.omit;
	              def.omit = [];
	            } else {
	              parentOmit = DS.defaults.omit;
	            }
	            def.omit = def.omit.concat(parentOmit || []);

	            // Prepare for computed properties
	            DSUtils.forOwn(def.computed, function (fn, field) {
	              if (DSUtils.isFunction(fn)) {
	                def.computed[field] = [fn];
	                fn = def.computed[field];
	              }
	              if (def.methods && field in def.methods) {
	                def.errorFn('Computed property "' + field + '" conflicts with previously defined prototype method!');
	              }
	              def.omit.push(field);
	              var deps;
	              if (fn.length === 1) {
	                var match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
	                deps = match[1].split(',');
	                def.computed[field] = deps.concat(fn);
	                fn = def.computed[field];
	                if (deps.length) {
	                  def.errorFn('Use the computed property array syntax for compatibility with minified code!');
	                }
	              }
	              deps = fn.slice(0, fn.length - 1);
	              DSUtils.forEach(deps, function (val, index) {
	                deps[index] = val.trim();
	              });
	              fn.deps = DSUtils.filter(deps, function (dep) {
	                return !!dep;
	              });
	            });

	            // add instance proxies of DS methods
	            DSUtils.forEach(instanceMethods, function (name) {
	              def[_class].prototype['DS' + DSUtils.pascalCase(name)] = function () {
	                for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	                  args[_key5] = arguments[_key5];
	                }

	                args.unshift(this[def.idAttribute] || this);
	                args.unshift(def.name);
	                return DS[name].apply(DS, args);
	              };
	            });

	            // manually add instance proxy for DS#create
	            def[_class].prototype.DSCreate = function () {
	              for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
	                args[_key6] = arguments[_key6];
	              }

	              args.unshift(this);
	              args.unshift(def.name);
	              return DS.create.apply(DS, args);
	            };

	            // Initialize store data for the new resource
	            DS.store[def.name] = {
	              collection: [],
	              expiresHeap: new DSUtils.BinaryHeap(function (x) {
	                return x.expires;
	              }, function (x, y) {
	                return x.item === y;
	              }),
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

	            var resource = DS.store[def.name];

	            // proxy DS methods with shorthand ones
	            var fns = ['registerAdapter', 'getAdapterName', 'getAdapter', 'is', '!clear'];
	            for (var key in DS) {
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
	            DSUtils.forEach(fns, function (key) {
	              var k = key;
	              if (k[0] === '!') {
	                return;
	              }
	              if (DS[k].shorthand !== false) {
	                def[k] = function () {
	                  for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
	                    args[_key7] = arguments[_key7];
	                  }

	                  args.unshift(def.name);
	                  return DS[k].apply(DS, args);
	                };
	                def[k].before = function (fn) {
	                  var orig = def[k];
	                  def[k] = function () {
	                    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
	                      args[_key8] = arguments[_key8];
	                    }

	                    return orig.apply(def, fn.apply(def, args) || args);
	                  };
	                };
	              } else {
	                def[k] = function () {
	                  for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
	                    args[_key9] = arguments[_key9];
	                  }

	                  return DS[k].apply(DS, args);
	                };
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

	            var defaultAdapter = undefined;
	            if (def.hasOwnProperty('defaultAdapter')) {
	              defaultAdapter = def.defaultAdapter;
	            }

	            // setup "actions"
	            DSUtils.forOwn(def.actions, function (action, name) {
	              if (def[name] && !def.actions[name]) {
	                throw new Error('Cannot override existing method "' + name + '"!');
	              }
	              action.request = action.request || function (config) {
	                return config;
	              };
	              action.response = action.response || function (response) {
	                return response;
	              };
	              action.responseError = action.responseError || function (err) {
	                return DSUtils.Promise.reject(err);
	              };
	              def[name] = function (id, options) {
	                if (DSUtils._o(id)) {
	                  options = id;
	                }
	                options = options || {};
	                var adapter = def.getAdapter(action.adapter || defaultAdapter || 'http');
	                var config = DSUtils.deepMixIn({}, action);
	                if (!options.hasOwnProperty('endpoint') && config.endpoint) {
	                  options.endpoint = config.endpoint;
	                }
	                if (typeof options.getEndpoint === 'function') {
	                  config.url = options.getEndpoint(def, options);
	                } else {
	                  var args = [options.basePath || adapter.defaults.basePath || def.basePath, adapter.getEndpoint(def, DSUtils._sn(id) ? id : null, options)];
	                  if (DSUtils._sn(id)) {
	                    args.push(id);
	                  }
	                  args.push(action.pathname || name);
	                  config.url = DSUtils.makePath.apply(null, args);
	                }
	                config.method = config.method || 'GET';
	                DSUtils.deepMixIn(config, options);
	                return new DSUtils.Promise(function (r) {
	                  return r(config);
	                }).then(options.request || action.request).then(function (config) {
	                  return adapter.HTTP(config);
	                }).then(options.response || action.response, options.responseError || action.responseError);
	              };
	            });

	            // mix in events
	            DSUtils.Events(def);

	            def.handleChange = function (data) {
	              resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
	              if (def.notify) {
	                setTimeout(function () {
	                  def.emit('DS.change', def, data);
	                }, 0);
	              }
	            };

	            return {
	              v: def
	            };
	          })();

	          if (typeof _ret === 'object') return _ret.v;
	        } catch (err) {
	          $log.error(err);
	          delete DS.definitions[definition.name];
	          delete DS.store[definition.name];
	          throw err;
	        }
	      }
	    };

	    angular.forEach(asyncMethods, function (name) {
	      return DS['expect' + name[0].toUpperCase() + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
	    });

	    angular.extend(DS, stubs);

	    sinon.spy(DS, 'defineResource');

	    DSUtils.Events(DS);

	    return DS;
	  }];
	};

	var DSHttpAdapter = function DSHttpAdapter() {
	  _classCallCheck(this, DSHttpAdapter);

	  var expectations = [];
	  var definitions = [];
	  var requests = [];
	  var responses = [];
	  var stubs = {};
	  var asyncMethods = ['create', 'DEL', 'destroy', 'destroyAll', 'find', 'findAll', 'GET', 'HTTP', 'POST', 'PUT', 'update', 'updateAll'];

	  this.$get = ['DSMockUtils', '$rootScope', function (DSMockUtils, $rootScope) {

	    var MockDSAdapterExpectation = DSMockUtils.MockDSAdapterExpectation;
	    var defaults = {};

	    angular.forEach(asyncMethods, function (name) {
	      stubs[name] = DSMockUtils.mockAsync(name, 'DSHttpAdapter', expectations, definitions, requests, responses);
	      sinon.spy(stubs, name);
	    });

	    this.defaults = {};

	    var DSHttpAdapter = {

	      defaults: defaults,

	      expect: function expect(name) {
	        for (var _len10 = arguments.length, args = Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
	          args[_key10 - 1] = arguments[_key10];
	        }

	        if (args[0] === undefined) {
	          throw new Error('Resource not defined for expectation!');
	        }
	        var expectation = new MockDSAdapterExpectation(name, args);
	        expectations.push(expectation);

	        return {
	          respond: function respond() {
	            for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
	              args[_key11] = arguments[_key11];
	            }

	            expectation.response = args;
	          }
	        };
	      },

	      flush: function flush(count) {
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

	      when: function when(name) {
	        for (var _len12 = arguments.length, args = Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
	          args[_key12 - 1] = arguments[_key12];
	        }

	        if (args[0] === undefined) {
	          throw new Error('Resource not defined for definition');
	        }
	        var definition = new MockDSAdapterExpectation(name, args);
	        definitions.push(definition);

	        return {
	          respond: function respond() {
	            for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
	              args[_key13] = arguments[_key13];
	            }

	            definition.response = args;
	          }
	        };
	      },

	      verifyNoOutstandingExpectation: function verifyNoOutstandingExpectation() {
	        $rootScope.$digest();
	        if (expectations.length) {
	          throw new Error('Unsatisfied requests: ' + expectations.join(', '));
	        }
	      }
	    };

	    angular.forEach(asyncMethods, function (name) {
	      return DSHttpAdapter['expect' + name[0].toUpperCase() + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
	    });
	    angular.extend(DSHttpAdapter, stubs);

	    return DSHttpAdapter;
	  }];
	};

	angular.module('js-data-mocks', ['js-data']).value('version', '3.0.0').service('DSMockUtils', ['$q', function ($q) {
	  var MockDSExpectation = (function () {
	    function MockDSExpectation(method, args) {
	      _classCallCheck(this, MockDSExpectation);

	      this.method = method;
	      this.args = args;
	      this.resourceName = this.args[0];
	    }

	    _createClass(MockDSExpectation, [{
	      key: 'match',
	      value: function match(m, resourceName) {
	        if (this.method !== m) {
	          return false;
	        } else if (this.resourceName !== resourceName) {
	          return false;
	        }
	        return true;
	      }
	    }, {
	      key: 'matchArgs',
	      value: function matchArgs(a) {
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
	      }
	    }]);

	    return MockDSExpectation;
	  })();

	  var MockDSAdapterExpectation = (function () {
	    function MockDSAdapterExpectation(method, args) {
	      _classCallCheck(this, MockDSAdapterExpectation);

	      this.method = method;
	      this.args = args;
	    }

	    _createClass(MockDSAdapterExpectation, [{
	      key: 'match',
	      value: function match(m) {
	        return this.method === m;
	      }
	    }, {
	      key: 'matchArgs',
	      value: function matchArgs(a) {
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
	      }
	    }]);

	    return MockDSAdapterExpectation;
	  })();

	  return {
	    MockDSExpectation: MockDSExpectation,
	    MockDSAdapterExpectation: MockDSAdapterExpectation,
	    prettyPrint: function prettyPrint(data) {
	      return angular.isString(data) || angular.isFunction(data) ? data : angular.toJson(data);
	    },
	    createResponse: function createResponse(resource, deferred, response) {
	      return function () {
	        return !(response[0] instanceof Error) ? deferred.resolve.apply(null, response) : deferred.reject.apply(null, response);
	      };
	    },
	    mockAsync: function mockAsync(name, namespace, expectations, definitions, requests, responses) {
	      var _this2 = this;

	      return function () {
	        for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
	          args[_key14] = arguments[_key14];
	        }

	        var expectation = expectations[0];
	        var deferred = $q.defer();
	        var resourceName = args[0];

	        if (expectation && expectation.match(name, resourceName)) {
	          expectations.shift();

	          if (!expectation.matchArgs(args)) {
	            throw new Error('Expected ' + expectation + ' with different args\nEXPECTED: ' + _this2.prettyPrint(expectation.args) + '\nGOT:      ' + _this2.prettyPrint(args));
	          }

	          if (expectation.response) {
	            responses.push(_this2.createResponse(resourceName, deferred, expectation.response));
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
	              responses.push(_this2.createResponse(resourceName, deferred, definition.response));
	              return deferred.promise;
	            } else {
	              throw new Error('No response defined!');
	            }
	          }
	        }

	        // Any requests that made it this far aren't being handled, so throw an exception
	        throw new Error('Unexpected request: ' + namespace + '.' + name + ' ' + resourceName + '\nNo more requests expected');
	      };
	    },
	    createShortMethod: function createShortMethod(name, expectations) {
	      return function () {
	        for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
	          args[_key15] = arguments[_key15];
	        }

	        if (args[0] === undefined) {
	          throw new Error('Resource not defined for expectation!');
	        }
	        var expectation = new MockDSExpectation(name, args);
	        expectations.push(expectation);

	        return {
	          respond: function respond() {
	            for (var _len16 = arguments.length, args = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
	              args[_key16] = arguments[_key16];
	            }

	            expectation.response = args;
	          }
	        };
	      };
	    }
	  };
	}]).provider('DS', DS).provider('DSHttpAdapter', DSHttpAdapter);

	module.exports = 'js-data-mocks';
	module.exports.name = 'js-data-mocks';

/***/ },
/* 1 */
/***/ function(module, exports) {

	if(typeof __WEBPACK_EXTERNAL_MODULE_1__ === 'undefined') {var e = new Error("Cannot find module \"sinon\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	if(typeof __WEBPACK_EXTERNAL_MODULE_2__ === 'undefined') {var e = new Error("Cannot find module \"angular\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;