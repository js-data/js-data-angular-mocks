describe('test', function () {
	var TestCtrl, $scope;

	beforeEach(function (done) {
		$scope = $rootScope.$new();

		inject(function ($controller) {
			TestCtrl = $controller('TestCtrl', {
				$scope: $scope,
				DS: DS
			});
			done();
		});
	});

	it('should work', function () {
		DS.expectFindAll('post', {
			query: {
				where: {
					author: {
						'==': 'John Anderson'
					}
				}
			}
		}).respond([{
			author: 'John Anderson',
			id: 1
		}]);

		DS.expectFind('user', 5).respond({
			name: 'John',
			id: 5
		});

		assert.equal(1, 1, '1 should equal 1');

		$scope.test().then(function (user) {
			assert.deepEqual(user, {
				name: 'John',
				id: 5
			});
		});

		$scope.$apply();
		DS.flush();
	});
});
