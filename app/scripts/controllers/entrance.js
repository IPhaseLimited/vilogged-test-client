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
  .controller('CompanyEntranceCtrl', function($scope, entranceService, $rootScope, notificationService) {

    $scope.entrance = [];

    $scope.pagination = {
      itemsPerPage: 10,
      maxSize: 5,
      currentPage: 1
    };

    getEntrance();

    $scope.deleteEntrance = function(id) {
      var dialogParams = {
        modalHeader: 'Delete Entrance',
        modalBodyText: 'are you sure you want to delete the following?'
      };

      notificationService.modal.confirm(dialogParams)
        .then(function() {
          $rootScope.busy = true;
          entranceService.remove(id)
            .then(function(response) {
              $rootScope.busy = false;
              getEntrance();
            })
            .catch(function(reason) {
              $rootScope.busy = false;
              notificationService.setTimeOutNotification(reason);
            });
        });
    };
    function getEntrance() {
      $rootScope.busy = true;
      entranceService.all()
        .then(function(response) {
          $rootScope.busy = false;
          $scope.entrance = response;
          $scope.pagination.totalItems = $scope.entrance.length;
          $scope.pagination.numberOfPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);
        })
        .catch(function(reason) {
          $rootScope.busy = false;

        });
    }

  })
  .controller('EntranceFormCtrl', function($scope, $state, $stateParams, entranceService, $rootScope, notificationService) {
    $scope.entrance = {};

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
