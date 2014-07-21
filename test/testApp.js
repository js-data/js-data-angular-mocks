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

      return DS.find('user', 5);
    };
  });
