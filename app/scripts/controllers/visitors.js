'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:VisitorsCtrl
 * @description
 * # VisitorsCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider){
    $stateProvider
      .state('visitors', {
        parent: 'root.index',
        url: '/visitors',
        templateUrl: 'views/visitors/index.html',
        controller: 'VisitorsCtrl'
      })
      .state('createVisitorProfile', {
        parent: 'root.index',
        url: '/create-visitor-profile',
        templateUrl: 'views/visitors/form.html',
        controller: 'CreateVisitorProfileCtrl'
      })
      .state('editVisitorProfile', {
        parent: 'root.index',
        url: '/edit-visitor-profile',
        templateUrl: 'views/visitors/edit-visitor-profile.html',
        controller: 'EditVisitorProfileCtrl'
      })
  })
  .controller('VisitorsCtrl', function ($scope) {
    $scope.visitors = [
      {
        id : 1,
        name : 'Jane Doe'
      },
      {
        id : 2,
        name : 'John Doe'
      },
      {
        id : 3,
        name : 'John Smith'
      }
    ];
  })
  .controller('CreateVisitorProfileCtrl', function($scope) {
    $scope.default = {};
    $scope.visitor = {};
    $scope.pageTitle = 'Create Visitor Profile';

    $scope.createProfile = function () {
      console.log($scope.visitor);

      $scope.visitor = angular.copy($scope.default);
    }
  });
