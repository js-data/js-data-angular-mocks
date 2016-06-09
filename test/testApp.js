angular.module('testApp', ['js-data'])
  .service('User', function (DS) {
    return DS.defineResource({
      name: 'user',
      computed: {
        fullName: {
          get: function () {
            return 'John Doe';
          }
        },
        nickname: function () {
          return 'Johny';
        },
        alternateNickname: [function () {
          return 'Doey';
        }],
        initials: ['fullName', function (fullName) {
          var names = fullName.split(' ');
          var initials = names.reduce(function (initials, name){
            return initials + name[0].toUpperCase();
          }, '')
          return initials;
        }]
      }
    });
  })
  .controller('TestCtrl', function ($scope, DS, User) {
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

      DS.find('post', 1);

      DS.find('post', 1);

      User.find(4);

      return DS.find('user', 5);
    };
  });
