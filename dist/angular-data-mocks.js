/**
 * @author Jason Dobry <jason.dobry@gmail.com>
 * @file angular-data-mocks.js
 * @version 0.0.1 - Homepage <https://github.com/jmdobry/angular-data-mocks>
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
 * Fake DS implementation suitable for unit testing applications that use the `angular-data.DS` module.
 *
 * __Version:__ 0.0.1
 *
 * ## Install
 *
 * #### Bower
 * ```text
 * bower install angular-data-mocks
 * ```
 *
 * Load `dist/angular-data-mocks.js` or `dist/angular-data-mocks.min.js` after angular and angular-data.
 *
 * #### Npm
 * ```text
 * npm install angular-data-mocks
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
 * calling `module('angular-data.mocks')` in a `beforeEach` or something.
 */
(function (window, angular, undefined) {
	'use strict';

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
		var expectations = [],
			requests = [],
			stubs = {},
			asyncMethods = [
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
				'update'
			];

		angular.forEach(asyncMethods, function (name) {
			stubs[name] = mockAsync(name, 'DSHttpAdapter', expectations, requests);
			sinon.spy(stubs, name);
		});

		this.$get = function () {
			/**
			 * @doc interface
			 * @id DSHttpAdapterMock
			 * @name DSHttpAdapterMock
			 * @description
			 * A mock implementation of `DSHttpAdapter` with helper methods for declaring and testing expectations.
			 *
			 * See the [guide](/documentation/guide/overview/index).
			 */
			var DSHttpAdapter = {
				/**
				 * @doc method
				 * @id DSHttpAdapterMock.methods:expect
				 * @name expect
				 * @description
				 * Create an expectation.
				 *
				 * @param {string} name The name of the function that is expected to be called.
				 * @returns {{respond: Function}}
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
				 * @id DSHttpAdapterMock.methods:flush
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
				 * @id DSHttpAdapterMock.methods:verifyNoOutstandingExpectation
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
			 * @id DSHttpAdapterMock.methods:expectCreate
			 * @name expectCreate
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectDEL
			 * @name expectDEL
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectDestroy
			 * @name expectDestroy
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectDestroyAll
			 * @name expectDestroyAll
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectFind
			 * @name expectFind
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectFindAll
			 * @name expectFindAll
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectGET
			 * @name expectGET
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectHTTP
			 * @name expectHTTP
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectPOST
			 * @name expectPOST
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectPUT
			 * @name expectPUT
			 */
			/**
			 * @doc method
			 * @id DSHttpAdapterMock.methods:expectupdate
			 * @name expectupdate
			 */
			angular.forEach(asyncMethods, function (name) {
				DS['expect' + name[0].toUpperCase() + name.substring(1)] = createShortMethod(name, expectations);
			});

			angular.extend(DSHttpAdapter, stubs);

			return DSHttpAdapter;
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
				'refresh',
				'save'
			],
			syncMethods = [
				'bindOne',
				'bindAll',
				'changes',
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
				'previous'
			];

		angular.forEach(asyncMethods, function (name) {
			stubs[name] = mockAsync(name, 'DS', expectations, requests);
			sinon.spy(stubs, name);
		});

		angular.forEach(syncMethods, function (name) {
			stubs[name] = sinon.spy();
		});

		this.$get = function () {

			/**
			 * @doc interface
			 * @id DSMock
			 * @name DSMock
			 * @description
			 * A mock implementation of `DS` with helper methods for declaring and testing expectations.
			 *
			 * See the [guide](/documentation/guide/overview/index).
			 */
			var DS = {
				/**
				 * @doc method
				 * @id DSMock.methods:expect
				 * @name expect
				 * @description
				 * Create an expectation.
				 *
				 * @param {string} name The name of the function that is expected to be called.
				 * @returns {{respond: Function}}
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
				 * @id DSMock.methods:flush
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
				 * @id DSMock.methods:verifyNoOutstandingExpectation
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
			 * @id DSMock.methods:expectCreate
			 * @name expectCreate
			 */
			/**
			 * @doc method
			 * @id DSMock.methods:expectDestroy
			 * @name expectDestroy
			 */
			/**
			 * @doc method
			 * @id DSMock.methods:expectDestroyAll
			 * @name expectDestroyAll
			 */
			/**
			 * @doc method
			 * @id DSMock.methods:expectFind
			 * @name expectFind
			 */
			/**
			 * @doc method
			 * @id DSMock.methods:expectFindAll
			 * @name expectFindAll
			 */
			/**
			 * @doc method
			 * @id DSMock.methods:expectRefresh
			 * @name expectRefresh
			 */
			/**
			 * @doc method
			 * @id DSMock.methods:expectSave
			 * @name expectSave
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
		.provider('DS', DSProvider);

})(window, window.angular);
