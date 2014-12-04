'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:CompanyDepartmentsCtrl
 * @description
 * # CompanyDepartmentsCtrl
 * Controller of the viLoggedClientApp
 */

function formController($scope, $state, visitorGroupsService, $stateParams, $modalInstance, _id, validationService,
                        $rootScope, alertService, notificationService) {
  var id = angular.isDefined(_id) ? _id : $stateParams.id;
  $scope.visitorGroup = {};
  if (angular.isDefined($modalInstance)) {
    $scope.dismiss = $modalInstance.dismiss;
  }

  if (id !== undefined && id !== null) {

    visitorGroupsService.get(id)
      .then(function(response) {
        $rootScope.busy = false;
        $scope.visitorGroup = response;

      })
      .catch(function(reason) {
        $rootScope.busy = false;
        notificationService.setTimeOutNotification(reason);
      });
  }

  $scope.save = function() {
    $rootScope.busy = true;

    var validationParams = {
      group_name: validationService.BASIC
    };
    $scope.validationErrors = validationService.validateFields(validationParams, $scope.visitorGroup);
    if (Object.keys( $scope.validationErrors).length === 0) {
      visitorGroupsService.save($scope.visitorGroup)
        .then(function() {
          $rootScope.busy = false;
          if (angular.isDefined($modalInstance)) {
            $modalInstance.close(true);
          } else {
            $rootScope.busy = false;
            $state.go('visitor-groups');
          }
        })
        .catch(function(reason) {
          if (angular.isDefined($modalInstance)) {
            $rootScope.busy = false;
          }
          (Object.keys(reason)).forEach(function(key) {
            $scope.validationErrors[key] = reason[key];
          });
          notificationService.setTimeOutNotification(reason);
        });
    }
  }
}
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('visitor-groups', {
        parent: 'root.index',
        url: '/visitor-groups',
        templateUrl: 'views/visitor-groups/index.html',
        controller: 'VisitorGroupsCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Visitor Groups'
        },
        ncyBreadcrumb: {
          label: 'Visitor Groups'
        }
      })
      .state('add-visitor-groups', {
        parent: 'root.index',
        url: '/visitor-groups/add',
        templateUrl: 'views/visitor-groups/widget-form.html',
        controller: 'VisitorGroupFormCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Add Visitor Group'
        },
        ncyBreadcrumb: {
          label: 'Add Visitor Group',
          parent: 'visitor-groups'
        }
      })
      .state('edit-visitor-group', {
        parent: 'root.index',
        url: '/visitor-group/:id',
        templateUrl: 'views/visitor-groups/widget-form.html',
        controller: 'VisitorGroupFormCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Edit Visitor Group'
        },
        ncyBreadcrumb: {
          label: 'Edit Visitor Group',
          parent: 'visitor-groups'
        }
      })
  })
  .controller('VisitorGroupsCtrl', function($scope, visitorGroupsService, $modal, notificationService,
                                                 $interval, $rootScope, alertService) {
    $scope.pagination = {
      itemsPerPage: 10,
      currentPage: 1,
      maxSize: 5
    };

    $scope.visitorGroups = [];
    function getVisitorGroups() {
      $rootScope.busy = true;
      visitorGroupsService.all()
        .then(function(visitorGroups) {
          $rootScope.busy = false;
          $scope.visitorGroups = visitorGroups;
          $scope.pagination.totalItems = visitorGroups.length;
          $scope.pagination.numberOfPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);
        })
        .catch(function(reason) {
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }
    getVisitorGroups();

    $scope.remove = function(id) {

      var dialogParams = {
        modalHeader: 'Delete Visitor Group',
        modalBodyText: 'Are you sure you want to delete the following?'
      };

      notificationService.modal.confirm(dialogParams)
        .then(function() {
          $rootScope.busy = true;
          visitorGroupsService.remove(id)
            .then(function(response) {
              $rootScope.busy = false;
              getVisitorGroups();
            })
            .catch(function(reason) {
              $rootScope.busy = false;
              notificationService.setTimeOutNotification(reason);
            });
        });

    };

    $scope.addVisitorGroup = function(id) {

      var modalInstance = $modal.open({
        templateUrl: 'views/visitor-groups/modal-form.html',
        controller: function($scope, $state, visitorGroupsService, $stateParams, $modalInstance,
                             validationService, $rootScope) {
          formController($scope, $state, visitorGroupsService, $stateParams, $modalInstance, id,
            validationService, $rootScope);
        }
      });

      modalInstance.result
        .then(function() {
          $rootScope.busy = false;
          getVisitorGroups();
        });

    };

  })
  .controller('VisitorGroupsFormCtrl', function($scope, $state, visitorGroupsService, $stateParams,
                                                     validationService, $rootScope, alertService) {
    formController($scope, $state, visitorGroupsService, $stateParams, validationService, $rootScope, alertService);
  });
