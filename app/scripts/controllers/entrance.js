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
          label: 'Create Entrance',
          parent: 'entrance'
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
          label: 'Edit Entrance',
          parent: 'entrance'
        }
      })
  })
  .controller('CompanyEntranceCtrl', function($scope, entranceService, $rootScope) {
    $rootScope.busy = false;
    $scope.entrance = [];
    utility.scrollToTop();

    $scope.deleteEntrance = function(id) {
      $rootScope.busy = true;
      entranceService.remove(id)
        .then(function(response) {
          $rootScope.busy = false;
        })
        .catch(function(reason) {
          $rootScope.busy = false;
          console.log(reason);
        })
    };

    entranceService.all()
      .then(function(response) {
        $rootScope.busy = false;
        $scope.entrance = response;
      })
      .catch(function(reason) {
        $rootScope.busy = false;
        console.log(reason);
      });
  })
  .controller('EntranceFormCtrl', function($scope, $state, $stateParams, entranceService, $rootScope, notificationService) {
    $scope.entrance = {};
    utility.scrollToTop();

    if ($stateParams.entrance_id) {
      $rootScope.busy = true;
      entranceService.get($stateParams.entrance_id)
        .then(function(response) {
          $rootScope.busy = false;
          $scope.entrance = response;
        })
        .catch(function(reason){
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }

    $scope.addEntrance = function() {
      $rootScope.busy = true;
      entranceService.save($scope.entrance)
        .then(function(response){
          $rootScope.busy = false;
          $state.go("entrance")
        })
        .catch(function(reason) {
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }
  });
