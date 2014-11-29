'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:CompanyDepartmentsCtrl
 * @description
 * # CompanyDepartmentsCtrl
 * Controller of the viLoggedClientApp
 */

function formController($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, _id, validationService,
                        $rootScope, alertService) {
  var id = angular.isDefined(_id) ? _id : $stateParams.id;
  $scope.companyDepartments = {};
  if (angular.isDefined($modalInstance)) {
    $scope.dismiss = $modalInstance.dismiss;
  }

  if (id !== undefined && id !== null) {
    $rootScope.busy = true;
    companyDepartmentsService.get(id)
      .then(function(response) {
        $rootScope.busy = false;
        $scope.companyDepartments = response;
        console.log(response);
      })
      .catch(function(reason) {
        $rootScope.busy = false;
        console.error(reason)
      });
  }

  $scope.save = function() {
    $rootScope.busy = true;

    var validationParams = {
      department_name: validationService.BASIC
    };
    $scope.validationErrors = validationService.validateFields(validationParams, $scope.companyDepartments);
    if (Object.keys( $scope.validationErrors).length === 0) {
      companyDepartmentsService.save($scope.companyDepartments)
        .then(function() {
          $rootScope.busy = false;
          if (angular.isDefined($modalInstance)) {
            $modalInstance.close(true);
          } else {
            $rootScope.busy = false;
            $state.go('company-departments');
          }
        })
        .catch(function(reason) {
          if (angular.isDefined($modalInstance)) {
            //$modalInstance.close(true);
            $rootScope.busy = false;
          }
          (Object.keys(reason)).forEach(function(key) {
            $scope.validationErrors[key] = reason[key];
          });
          console.log(reason);
        });
    }
  }
}
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('company-departments', {
        parent: 'root.index',
        url: '/company-departments',
        templateUrl: 'views/company-departments/index.html',
        controller: 'CompanyDepartmentsCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Departments'
        },
        ncyBreadcrumb: {
          label: 'Departments'
        }
      })
      .state('add-company-department', {
        parent: 'root.index',
        url: '/company-departments/add',
        templateUrl: 'views/company-departments/widget-form.html',
        controller: 'CompanyDepartmentsFormCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Add Department'
        },
        ncyBreadcrumb: {
          label: 'Add Department',
          parent: 'company-departments'
        }
      })
      .state('edit-company-department', {
        parent: 'root.index',
        url: '/company-departments/:id',
        templateUrl: 'views/company-departments/widget-form.html',
        controller: 'CompanyDepartmentsFormCtrl',
        data: {
          requiredPermission: 'is_superuser',
          label: 'Edit Department'
        },
        ncyBreadcrumb: {
          label: 'Edit Department',
          parent: 'company-departments'
        }
      });
  })
  .controller('CompanyDepartmentsCtrl', function($scope, companyDepartmentsService, $modal, notificationService,
                                                 $interval, $rootScope, alertService) {
    $scope.pagination = {
      itemsPerPage: 10,
      currentPage: 1,
      maxSize: 5
    };

    $scope.departments = [];
    function getDepartments() {
      $rootScope.busy = true;
      companyDepartmentsService.all()
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
          companyDepartmentsService.remove(id)
            .then(function(response) {
              $rootScope.busy = false;
              console.log(response);
              getDepartments();
            })
            .catch(function(reason) {
              $rootScope.busy = false;
              notificationService.setTimeOutNotification(reason);
            });
        });

    };

    $scope.addDepartment = function(id) {

      $rootScope.busy = true;
      var modalInstance = $modal.open({
        templateUrl: 'views/company-departments/modal-form.html',
        controller: function($scope, $state, companyDepartmentsService, $stateParams, $modalInstance,
                             validationService, $rootScope) {
          formController($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, id,
            validationService, $rootScope);
        }
      });

      modalInstance.result
        .then(function() {
          $rootScope.busy = false;
          getDepartments();
        });

    };

  })
  .controller('CompanyDepartmentsFormCtrl', function($scope, $state, companyDepartmentsService, $stateParams,
                                                     validationService, $rootScope, alertService) {
    formController($scope, $state, companyDepartmentsService, $stateParams, validationService, $rootScope, alertService);
  });
