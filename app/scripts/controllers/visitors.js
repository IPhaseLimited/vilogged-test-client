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
      .state('create-visitor-profile', {
        parent: 'root.index',
        url: '/create-visitor-profile',
        templateUrl: 'views/visitors/form.html',
        controller: 'VisitorProfileFormCtrl'
      })
      .state('edit-visitor-profile', {
        parent: 'root.index',
        url: '/visitor-profile/:id',
        templateUrl: 'views/visitors/form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('show-visitor', {
        parent: 'root.index',
        url: '/show-visitor',
        templateUrl: 'views/visitors/detail.html',
        controller: 'VisitorDetailCtrl'
      })
  })
  .controller('VisitorsCtrl', function ($scope, visitorService) {
    $scope.visitors = [];

    var deferred = visitorService.getAllVisitors();

    deferred
      .then(function (response) {
        $scope.visitors = response;
      });
  })
  .controller('VisitorFormCtrl', function($scope, $state, $stateParams , visitorService) {
    $scope.visitor = {};
    $scope.default = {};
    $scope.pageTitle = 'Create Visitor Profile';

    if ($stateParams.id !== null && $stateParams.id !== undefined) {
      var deferred = visitorService.get($stateParams.id);

      deferred
        .then(function(response) {
          $scope.visitor = response;

          $scope.pageTitle = 'Edit ' + $scope.visitor.firstName + '\'s Profile';
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    $scope.createProfile = function () {
      var deferred = visitorService.save($scope.visitor);
      deferred
        .then(function(response) {
          $scope.visitor = angular.copy($scope.default);
          $state.go('visitors')
        })
        .catch(function (reason) {
          console.log(reason);
        });
    }
  })
//  .controller('VisitorDetailCtrl', function () {
//    $scope
//  })
;
