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
      .state('company-departments', {
        parent: 'root.index',
        url: '/company-departments',
        templateUrl: 'views/company-departments/index.html',
        controller: 'CompanyDepartmentsCtrl'
      })
      .state('add-company-department', {
        parent: 'root.index',
        url: '/add-company-departments',
        templateUrl: 'views/company-departments/form.html',
        controller: 'CompanyDepartmentsFormCtrl'
      });
  })
  .controller('CompanyDepartmentsCtrl', function ($scope, companyDepartmentsService) {
    $scope.departments = [];
    companyDepartmentsService.all()
      .then(function(departments) {
        $scope.departments = departments;
      })
      .catch(function(reason) {
        console.log(reason);
      });

  })
  .controller('CompanyDepartmentsFormCtrl', function($scope, companyDepartmentsService) {
    $scope.companyDepartments = {};

    $scope.save = function() {
      companyDepartmentsService.save($scope.companyDepartments)
        .then(function(response) {
          console.log(response);
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }
  });
