'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:CompanyDepartmentsCtrl
 * @description
 * # CompanyDepartmentsCtrl
 * Controller of the viLoggedClientApp
 */

angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('departments', {
        parent: 'root.index',
        url: '/departments',
        templateUrl: 'views/departments/index.html',
        controller: 'DepartmentsCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Departments'
        },
        ncyBreadcrumb: {
          label: 'Departments'
        }
      })
      .state('add-department', {
        parent: 'root.index',
        url: '/departments/add',
        templateUrl: 'views/departments/widget-form.html',
        controller: 'DepartmentsFormCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Add Department'
        },
        ncyBreadcrumb: {
          label: 'Add Department',
          parent: 'departments'
        }
      })
      .state('edit-department', {
        parent: 'root.index',
        url: '/departments/:id',
        templateUrl: 'views/departments/widget-form.html',
        controller: 'DepartmentsFormCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Edit Department'
        },
        ncyBreadcrumb: {
          label: 'Edit Department',
          parent: 'departments'
        }
      });
  })
  .controller('DepartmentsCtrl', function($scope, departmentService, $modal, notificationService,
                                                 $interval, $rootScope, alertService) {
    $scope.pagination = {
      itemsPerPage: 10,
      currentPage: 1,
      maxSize: 5
    };

    $scope.departments = [];
    function getDepartments() {
      $rootScope.busy = true;
      departmentService.all()
        .then(function(departments) {
          $rootScope.busy = false;
          $scope.departments = departments;
          $scope.pagination.totalItems = departments.length;
          $scope.pagination.numberOfPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);
        })
        .catch(function(reason) {
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }
    getDepartments();

    $scope.remove = function(id) {

      var dialogParams = {
        modalHeader: 'Delete Department',
        modalBodyText: 'are you sure you want to delete the following?'
      };

      notificationService.modal.confirm(dialogParams)
        .then(function() {
          $rootScope.busy = true;
          departmentService.remove(id)
            .then(function(response) {
              $rootScope.busy = false;
              getDepartments();
            })
            .catch(function(reason) {
              $rootScope.busy = false;
              notificationService.setTimeOutNotification(reason);
            });
        });

    };

  })
  .controller('DepartmentsFormCtrl', function(
    $scope,
    $state,
    departmentService,
    $stateParams,
    validationService,
    $rootScope,
    alertService,
    notificationService
  ) {


    var id = $stateParams.id;
    $scope.department = {};

    if (id !== undefined && id !== null) {

      departmentService.get(id)
        .then(function(response) {
          $rootScope.busy = false;
          $scope.department = response;

        })
        .catch(function(reason) {
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }

    $scope.save = function() {
      $rootScope.busy = true;

      var validationParams = {
        name: validationService.BASIC()
      };
      $scope.validationErrors = validationService.validateFields(validationParams, $scope.department);
      if (Object.keys( $scope.validationErrors).length === 0) {
        departmentService.save($scope.department)
          .then(function() {
            $rootScope.busy = false;
            $state.go('departments');
          })
          .catch(function(reason) {
            $rootScope.busy = false;
            var error = reason.detail;
            (Object.keys(error)).forEach(function(key) {
              $scope.validationErrors[key] = reason[key];
            });
            notificationService.setTimeOutNotification(reason);
          });
      }
    }

  });
