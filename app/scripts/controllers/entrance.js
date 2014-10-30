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
    $scope.entrance = [];
  });
