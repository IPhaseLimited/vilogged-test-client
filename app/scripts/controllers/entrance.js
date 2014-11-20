'use strict';
angular.module('viLoggedClientApp')
  .config(function($stateProvider){
    $stateProvider
      .state('entrance', {
        parent: 'root.index',
        url: '/entrance',
        data: {
          label: 'Entrance List',
          requiredPermission: 'is_superuser'
        },
        templateUrl: 'views/entrance/index.html',
        controller: 'CompanyEntranceCtrl',
        ncyBreadcrumb: {
          label: 'Entrance'
        }
      })
      .state('add-company-entrance', {
        parent: 'root.index',
        url: '/entrance/add',
        data: {
          label: 'Add Entrance',
          requiredPermission: 'is_superuser'
        },
        templateUrl: 'views/entrance/widget-form.html',
        controller: 'EntranceFormCtrl',
        ncyBreadcrumb: {
          label: 'Create Entrance'
        }
      })
      .state('edit-company-entrance', {
        parent: 'root.index',
        url: '/entrance/:entrance_id/edit',
        data: {
          label: 'Add Entrance',
          requiredPermission: 'is_superuser'
        },
        templateUrl: 'views/entrance/widget-form.html',
        controller: 'EntranceFormCtrl',
        ncyBreadcrumb: {
          label: 'Edit Entrance'
        }
      })
  })
  .controller('CompanyEntranceCtrl', function ($scope, entranceService) {
    $scope.busy = false;
    $scope.entrance = [];

    $scope.deleteEntrance = function(id) {
      $scope.busy = true;
      entranceService.remove(id)
        .then(function(response) {
          $scope.busy = false;
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        })
    };

    entranceService.all()
      .then(function(response) {
        $scope.busy = false;
        $scope.entrance = response;
      })
      .catch(function(reason) {
        $scope.busy = false;
        console.log(reason);
      });
  })
  .controller('EntranceFormCtrl', function($scope, $state, $stateParams, entranceService) {
    $scope.entrance = {};

    if ($stateParams.entrance_id !== null || $stateParams.entrance_id !== undefined) {
      $scope.busy = true;
      entranceService.get($stateParams.entrance_id)
        .then(function(response) {
          $scope.busy = false;
          $scope.entrance = response;
        })
        .catch(function(){
          $scope.busy = false;
        });
    }

    $scope.addEntrance = function() {
      $scope.busy = true;
      entranceService.save($scope.entrance)
        .then(function(response){
          $scope.busy = false;
          $state.go("entrance")
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        });
    }
  });
