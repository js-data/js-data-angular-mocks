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
    DS.inject.returns({ test: 'test' });

    DS.expectFindAll('post', {
      where: {
        author: {
          '==': 'John Anderson'
        }
      }
    }).respond([
      {
        author: 'John Anderson',
        id: 1
      }
    ]);

    DS.when('find', 'post', 1).respond({
      id: 1
    });

    DSHttpAdapter.expectGET('test.com').respond({
      name: 'John',
      id: 5
    });

    DS.expectFind('user', 4).respond({
      name: 'Sally',
      id: 4
    });

    DS.expectFind('user', 5).respond({
      name: 'John',
      id: 5
    });

    $scope.test().then(function (user) {
      assert.deepEqual(user, {
        name: 'John',
        id: 5
      });
    });

    $scope.$apply();
    DS.flush();

    assert.deepEqual($scope.injected, { test: 'test' });

    assert.equal(DS.find.callCount, 4);
  });
});
