/*!
 * js-data-angular-mocks
 * @version 2.0.0 - Homepage <https://github.com/js-data/js-data-angular-mocks>
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

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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
	  throw new Error("sinon must be loaded!");
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
	  throw new Error("angular must be loaded!");
	}

	var DS = function DS() {
	  _classCallCheck(this, DS);

	  var expectations = [];
	  var definitions = [];
	  var requests = [];
	  var responses = [];
	  var stubs = {};
	  var asyncMethods = ["create", "destroy", "destroyAll", "find", "findAll", "loadRelations", "reap", "refresh", "save", "update", "updateAll"];
	  var syncMethods = ["bindAll", "bindOne", "changes", "changeHistory", "compute", "createInstance", "digest", "eject", "ejectAll", "filter", "get", "getAdapter", "hasChanges", "inject", "is", "lastModified", "lastSaved", "link", "linkAll", "linkInverse", "registerAdapter", "previous", "unlinkInverse"];

	  var Resource = function Resource(utils, options) {
	    _classCallCheck(this, Resource);

	    utils.deepMixIn(this, options);

	    if ("endpoint" in options) {
	      this.endpoint = options.endpoint;
	    } else {
	      this.endpoint = this.name;
	    }
	  };

	  this.$get = ["DSMockUtils", "DSUtils", "DSErrors", "$log", "$rootScope", function (DSMockUtils, DSUtils, DSErrors, $log, $rootScope) {

	    var MockDSExpectation = DSMockUtils.MockDSExpectation;
	    var defaults = {
	      deserialize: function deserialize(resourceName, data) {
	        return data.data ? data.data : data;
	      }
	    };

	    angular.forEach(asyncMethods, function (name) {
	      stubs[name] = DSMockUtils.mockAsync(name, "DS", expectations, definitions, requests, responses);
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
	          throw new Error("Resource not defined for expectation!");
	        }
	        var expectation = new MockDSExpectation(name, args);
	        expectations.push(expectation);

	        return {
	          respond: function () {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            return expectation.response = args;
	          }
	        };
	      },

	      flush: function flush(count) {
	        if (!responses.length) {
	          throw new Error("No pending DS requests to flush!");
	        }

	        if (angular.isDefined(count)) {
	          while (count--) {
	            if (!responses.length) {
	              throw new Error("No more pending DS requests to flush!");
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
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        if (args[0] === undefined) {
	          throw new Error("Resource not defined for definition!");
	        }
	        var definition = new MockDSExpectation(name, args);
	        definitions.push(definition);

	        return {
	          respond: function respond() {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            definition.response = args;
	          }
	        };
	      },

	      verifyNoOutstandingExpectation: function verifyNoOutstandingExpectation() {
	        $rootScope.$digest();
	        if (expectations.length) {
	          throw new Error("Unsatisfied requests: " + expectations.join(", "));
	        }
	      },

	      utils: DSUtils,
	      errors: DSErrors,

	      defineResource: function defineResource(definition) {
	        var DS = this;

	        if (DSUtils.isString(definition)) {
	          definition = definition.replace(/\s/gi, "");
	          definition = {
	            name: definition
	          };
	        }

	        try {
	          var _class;

	          var _ret = (function () {
	            // Inherit from global defaults
	            Resource.prototype = DS.defaults;
	            DS.definitions[definition.name] = new Resource(DSUtils, definition);

	            var def = DS.definitions[definition.name];

	            def.n = def.name;

	            // Create the wrapper class for the new resource
	            _class = def["class"] = DSUtils.pascalCase(def.name);

	            try {
	              if (typeof def.useClass === "function") {
	                eval("function " + _class + "() { def.useClass.call(this); }");
	                def[_class] = eval(_class);
	                def[_class].prototype = (function (proto) {
	                  function Ctor() {}

	                  Ctor.prototype = proto;
	                  return new Ctor();
	                })(def.useClass.prototype);
	              } else {
	                eval("function " + _class + "() {}");
	                def[_class] = eval(_class);
	              }
	            } catch (e) {
	              def[_class] = function () {};
	            }

	            // Apply developer-defined methods
	            if (def.methods) {
	              DSUtils.deepMixIn(def[def["class"]].prototype, def.methods);
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
	            var fns = ["registerAdapter", "getAdapter", "is"];
	            for (key in DS) {
	              if (typeof DS[key] === "function") {
	                fns.push(key);
	              }
	            }

	            DSUtils.forEach(fns, function (key) {
	              var k = key;
	              if (DS[k].shorthand !== false) {
	                def[k] = function () {
	                  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                    args[_key] = arguments[_key];
	                  }

	                  args.unshift(def.n);
	                  return DS[k].apply(DS, args);
	                };
	              } else {
	                def[k] = function () {
	                  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                    args[_key] = arguments[_key];
	                  }

	                  return DS[k].apply(DS, args);
	                };
	              }
	            });

	            return {
	              v: def
	            };
	          })();

	          if (typeof _ret === "object") return _ret.v;
	        } catch (err) {
	          $log.error(err);
	          delete DS.definitions[definition.name];
	          delete DS.store[definition.name];
	          throw err;
	        }
	      }
	    };

	    angular.forEach(asyncMethods, function (name) {
	      return DS["expect" + name[0].toUpperCase() + "" + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
	    });

	    angular.extend(DS, stubs);

	    sinon.spy(DS, "defineResource");

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
	  var asyncMethods = ["create", "DEL", "destroy", "destroyAll", "find", "findAll", "GET", "HTTP", "POST", "PUT", "update", "updateAll"];

	  this.$get = ["DSMockUtils", "$rootScope", function (DSMockUtils, $rootScope) {

	    var MockDSAdapterExpectation = DSMockUtils.MockDSAdapterExpectation;
	    var defaults = {};

	    angular.forEach(asyncMethods, function (name) {
	      stubs[name] = DSMockUtils.mockAsync(name, "DSHttpAdapter", expectations, definitions, requests, responses);
	      sinon.spy(stubs, name);
	    });

	    this.defaults = {};

	    var DSHttpAdapter = {

	      defaults: defaults,

	      expect: function expect(name) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        if (args[0] === undefined) {
	          throw new Error("Resource not defined for expectation!");
	        }
	        var expectation = new MockDSAdapterExpectation(name, args);
	        expectations.push(expectation);

	        return {
	          respond: function respond() {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            expectation.response = args;
	          }
	        };
	      },

	      flush: function flush(count) {
	        if (!responses.length) {
	          throw new Error("No pending DSHttpAdapter requests to flush !");
	        }

	        if (angular.isDefined(count)) {
	          while (count--) {
	            if (!responses.length) {
	              throw new Error("No more pending DSHttpAdapter requests to flush !");
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
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        if (args[0] === undefined) {
	          throw new Error("Resource not defined for definition");
	        }
	        var definition = new MockDSAdapterExpectation(name, args);
	        definitions.push(definition);

	        return {
	          respond: function respond() {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            definition.response = args;
	          }
	        };
	      },

	      verifyNoOutstandingExpectation: function verifyNoOutstandingExpectation() {
	        $rootScope.$digest();
	        if (expectations.length) {
	          throw new Error("Unsatisfied requests: " + expectations.join(", "));
	        }
	      }
	    };

	    angular.forEach(asyncMethods, function (name) {
	      return DSHttpAdapter["expect" + name[0].toUpperCase() + "" + name.substring(1)] = DSMockUtils.createShortMethod(name, expectations);
	    });
	    angular.extend(DSHttpAdapter, stubs);

	    return DSHttpAdapter;
	  }];
	};

	angular.module("js-data-mocks", []).value("version", "2.0.0").service("DSMockUtils", ["$q", function ($q) {
	  var MockDSExpectation = (function () {
	    function MockDSExpectation(method, args) {
	      _classCallCheck(this, MockDSExpectation);

	      this.method = method;
	      this.args = args;
	      this.resourceName = this.args[0];
	    }

	    _createClass(MockDSExpectation, {
	      match: {
	        value: function match(m, resourceName) {
	          if (this.method !== m) {
	            return false;
	          } else if (this.resourceName !== resourceName) {
	            return false;
	          }
	          return true;
	        }
	      },
	      matchArgs: {
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
	      }
	    });

	    return MockDSExpectation;
	  })();

	  var MockDSAdapterExpectation = (function () {
	    function MockDSAdapterExpectation(method, args) {
	      _classCallCheck(this, MockDSAdapterExpectation);

	      this.method = method;
	      this.args = args;
	    }

	    _createClass(MockDSAdapterExpectation, {
	      match: {
	        value: function match(m) {
	          return this.method === m;
	        }
	      },
	      matchArgs: {
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
	      }
	    });

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
	      var _this = this;

	      return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        var expectation = expectations[0];
	        var deferred = $q.defer();
	        var resourceName = args[0];

	        if (expectation && expectation.match(name, resourceName)) {
	          expectations.shift();

	          if (!expectation.matchArgs(args)) {
	            throw new Error("Expected " + expectation + " with different args\nEXPECTED: " + _this.prettyPrint(expectation.args) + "\nGOT:      " + _this.prettyPrint(args));
	          }

	          if (expectation.response) {
	            responses.push(_this.createResponse(resourceName, deferred, expectation.response));
	            return deferred.promise;
	          } else {
	            throw new Error("No response defined for " + namespace + "." + expectation.method);
	          }
	        }

	        // try to match request to any backend definitions
	        for (var i = 0; i < definitions.length; i++) {
	          var definition = definitions[i];

	          if (definition.match(name, resourceName)) {
	            if (definition.response) {
	              responses.push(_this.createResponse(resourceName, deferred, definition.response));
	              return deferred.promise;
	            } else {
	              throw new Error("No response defined!");
	            }
	          }
	        }

	        // Any requests that made it this far aren't being handled, so throw an exception
	        throw new Error("Unexpected request: " + namespace + "." + name + " " + resourceName + "\nNo more requests expected");
	      };
	    },
	    createShortMethod: function createShortMethod(name, expectations) {
	      return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        if (args[0] === undefined) {
	          throw new Error("Resource not defined for expectation!");
	        }
	        var expectation = new MockDSExpectation(name, args);
	        expectations.push(expectation);

	        return {
	          respond: function respond() {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            expectation.response = args;
	          }
	        };
	      };
	    }
	  };
	}]).provider("DS", DS).provider("DSHttpAdapter", DSHttpAdapter);

	module.exports = "js-data-mocks";

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	if(typeof __WEBPACK_EXTERNAL_MODULE_1__ === 'undefined') {var e = new Error("Cannot find module \"sinon\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	if(typeof __WEBPACK_EXTERNAL_MODULE_2__ === 'undefined') {var e = new Error("Cannot find module \"angular\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;