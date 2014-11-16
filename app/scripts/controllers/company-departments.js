'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:CompanyDepartmentsCtrl
 * @description
 * # CompanyDepartmentsCtrl
 * Controller of the viLoggedClientApp
 */

function formController($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, _id, validationService) {
  var id = angular.isDefined(_id) ? _id : $stateParams.id;
  $scope.companyDepartments = {};
  if (angular.isDefined($modalInstance)) {
    $scope.dismiss = $modalInstance.dismiss;
  }

  if (id !== undefined && id !== null) {
    companyDepartmentsService.get(id)
      .then(function(response) {
        $scope.companyDepartments = response;
        console.log(response);
      })
      .catch(function(reason) {
        console.error(reason)
      });
  }

  $scope.save = function() {

    var validationParams = {
      department_name: validationService.BASIC
    };
    $scope.validationErrors = validationService.validateFields(validationParams, $scope.companyDepartments);
    if (Object.keys( $scope.validationErrors).length === 0) {
      companyDepartmentsService.save($scope.companyDepartments)
        .then(function () {
          if (angular.isDefined($modalInstance)) {
            $modalInstance.close(true);
          } else {
            $state.go('company-departments');
          }
        })
        .catch(function (reason) {
          if (angular.isDefined($modalInstance)) {
            //$modalInstance.close(true);
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
        }
      });
  })
  .controller('CompanyDepartmentsCtrl', function ($scope, companyDepartmentsService, $modal, notificationService, $interval) {
    $scope.departments = [];
    function getDepartments() {
      companyDepartmentsService.all()
        .then(function (departments) {
          $scope.departments = departments;
        })
        .catch(function (reason) {
          console.log(reason);
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
          companyDepartmentsService.remove(id)
            .then(function(response) {
              console.log(response);
              getDepartments();
            })
            .catch(function(reason) {
              console.log(reason);
            });
        });

    };

    $scope.addDepartment = function(id) {

      var modalInstance = $modal.open({
        templateUrl: 'views/company-departments/modal-form.html',
        controller: function($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, validationService) {
          formController($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, id, validationService);
        }
      });

      modalInstance.result
        .then(function() {
          getDepartments();
        });

    };

  })
  .controller('CompanyDepartmentsFormCtrl', function($scope, $state, companyDepartmentsService, $stateParams, validationService) {
    formController($scope, $state, companyDepartmentsService, $stateParams, validationService);
  });
