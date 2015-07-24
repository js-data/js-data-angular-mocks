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

describe('definitions', function () {
  var $q;
  var DS;

  beforeEach(inject(function(_$q_, _DS_) {
    $q = _$q_;
    DS = _DS_;
  }));

  it('should be matched by args', function (done) {
    DS.when('findAll', 'post', { user: 1 })
      .respond([{ id: 1, user: 1 }]);

    DS.when('findAll', 'post', { user: 2 })
      .respond([{ id: 2, user: 2 }]);

    $q.all(
      DS.findAll('post', { user: 1 })
        .then(function(posts) {
          assert.deepEqual(posts, [{ id: 1, user: 1 }]);
        }),
      DS.findAll('post', { user: 2 })
        .then(function(posts) {
          assert.deepEqual(posts, [{ id: 2, user: 2 }]);
        })
    ).finally(done);

    DS.flush();
  });
});
