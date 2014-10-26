'use strict';

angular.module('viLoggedClientApp')
  .config(function($stateProvider){
    $stateProvider.state('entrance', {
      parent: 'root.index',
      url: '/entrance',
      template: 'views/entrance/index.html',
      controller: 'EntranceCtrl'
    })
  })
  .controller('EntranceCtrl', function ($scope) {
    $scope.entrance = [
      {
        uuid: 1,
        entrance_name: 'Gate 1'
      },
      {
        uuid: 2,
        entrance_name: 'Gate 2'
      },
      {
        uuid: 3,
        entrance_name: 'Gate 3'
      },
      {
        uuid: 4,
        entrance_name: 'Gate 4'
      }
    ]
  });
