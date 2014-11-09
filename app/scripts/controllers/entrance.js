'use strict';
angular.module('viLoggedClientApp')
  .config(function($stateProvider){
    $stateProvider
      .state('entrance', {
        parent: 'root.index',
        url: '/entrance',
        data: {
          label: 'Entrance List'
        },
        templateUrl: 'views/entrance/index.html',
        controller: 'CompanyEntranceCtrl'
      })
      .state('add-company-entrance', {
        parent: 'root.index',
        url: '/entrance/add',
        data: {
          label: 'Add Entrance'
        },
        templateUrl: 'views/entrance/widget-form.html',
        controller: 'EntranceFormCtrl'
      })
      .state('edit-company-entrance', {
        parent: 'root.index',
        url: '/entrance/:entrance_id/edit',
        data: {
          label: 'Add Entrance'
        },
        templateUrl: 'views/entrance/widget-form.html',
        controller: 'EntranceFormCtrl'
      })
  })
  .controller('CompanyEntranceCtrl', function ($scope, entranceService) {
    $scope.entrance = [];

    $scope.deleteEntrance = function(id) {
      entranceService.remove(id)
        .then(function(response) {})
        .catch(function(reason) {})
    };

    entranceService.all()
      .then(function(response) {
        $scope.entrance = response;
      })
      .catch(function(reason) {});
  })
  .controller('EntranceFormCtrl', function($scope, $state, $stateParams, entranceService) {
    $scope.entrance = {};

    if ($stateParams.entrance_id !== null || $stateParams.entrance_id !== undefined) {
      entranceService.get($stateParams.entrance_id)
        .then(function(response) {
          $scope.entrance = response;
        })
        .catch(function(){});
    }

    $scope.addEntrance = function() {
      entranceService.save($scope.entrance)
        .then(function(response){
          $state.go("entrance")
        })
        .catch(function(reason) {});
    }
  });
