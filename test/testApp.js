angular.module('testApp', ['angular-data.DS'])
  .controller('TestCtrl', function ($scope, DS) {
    'use strict';

    $scope.test = function () {

      DS.findAll('post', {
        where: {
          author: {
            '==': 'John Anderson'
          }
        }
      });

      DSHttpAdapter.GET('test.com');

      $scope.injected = DS.inject('user', {
        name: 'Sally',
        id: 6
      });

      DS.ejectAll('post', {
        where: {
          author: {
            '==': 'John Anderson'
          }
        }
      });

      DS.find('post', 1);

      DS.find('post', 1);

      return DS.find('user', 5);
    };
  });
