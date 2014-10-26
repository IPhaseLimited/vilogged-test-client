'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:CompanyDepartmentsCtrl
 * @description
 * # CompanyDepartmentsCtrl
 * Controller of the viLoggedClientApp
 */

function formController($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, _id) {
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

    companyDepartmentsService.save($scope.companyDepartments)
      .then(function(response) {
        if (angular.isDefined($modalInstance)) {
          $modalInstance.close(true);
        } else {
          $state.go('company-departments');
        }
      })
      .catch(function(reason) {
        if (angular.isDefined($modalInstance)) {
          $modalInstance.close(true);
        }
        console.log(reason);
      });
  }
}
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('company-departments', {
        parent: 'root.index',
        url: '/company-departments',
        templateUrl: 'views/company-departments/index.html',
        controller: 'CompanyDepartmentsCtrl'
      })
      .state('add-company-department', {
        parent: 'root.index',
        url: '/company-departments/add',
        templateUrl: 'views/company-departments/widget-form.html',
        controller: 'CompanyDepartmentsFormCtrl'
      })
      .state('edit-company-department', {
        parent: 'root.index',
        url: '/company-departments/:id',
        templateUrl: 'views/company-departments/widget-form.html',
        controller: 'CompanyDepartmentsFormCtrl'
      });
  })
  .controller('CompanyDepartmentsCtrl', function ($scope, companyDepartmentsService, $modal, $state) {
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

    $scope.addDepartment = function(id) {

      var modalInstance = $modal.open({
        templateUrl: 'views/company-departments/modal-form.html',
        controller: function($scope, $state, companyDepartmentsService, $stateParams, $modalInstance) {
          formController($scope, $state, companyDepartmentsService, $stateParams, $modalInstance, id);
        }
      });

      modalInstance.result
        .then(function() {
          getDepartments();
        });

    }

  })
  .controller('CompanyDepartmentsFormCtrl', function($scope, $state, companyDepartmentsService, $stateParams) {
    formController($scope, $state, companyDepartmentsService, $stateParams);
  });
