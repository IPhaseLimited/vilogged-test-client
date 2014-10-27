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
        url: '/visitors/new',
        templateUrl: 'views/visitors/form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('edit-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/:id/edit',
        templateUrl: 'views/visitors/form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('show-visitor', {
        parent: 'root.index',
        url: '/visitors/:id',
        templateUrl: 'views/visitors/detail.html',
        controller: 'VisitorDetailCtrl'
      })
  })
  .controller('VisitorsCtrl', function ($scope, visitorService) {
    $scope.visitors = [];

    visitorService.getAllVisitors()
      .then(function (response) {
        $scope.visitors = response;
      });
  })
  .controller('VisitorFormCtrl', function($scope, $state, $stateParams, visitorService, validationService) {
    $scope.visitors = [];

    visitorService.getAllVisitors()
      .then(function (response) {
        $scope.visitors = response;
      });
    $scope.visitor = {};
    $scope.vehicle = {};
    $scope.document = {};
    $scope.default = {};
    $scope.title = 'Create Visitor Profile';
    $scope.vehicleTypes = [{name: 'Car'}, {name: 'Bus'}, {name: 'Motor Cycle'}, {name: 'Tri-Cycle'}, {name: 'Lorry'}];

    if ($stateParams.id !== null && $stateParams.id !== undefined) {
      var deferred = visitorService.get($stateParams.id);

      deferred
        .then(function(response) {
          $scope.visitor = response;

          $scope.title = 'Edit ' + $scope.visitor.firstName + '\'s Profile';
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    $scope.createProfile = function () {
      //TODO:: Complete validations
      var emailValidation = validationService.EMAIL;
      emailValidation.required = true;
      emailValidation.unique = true;
      emailValidation.dbName = visitorService.DBNAME;
      emailValidation.dataList = $scope.visitors;
      var validationParams = {
        first_name: validationService.BASIC,
        last_name: validationService.BASIC,
        lga_of_origin: validationService.BASIC,
        state_of_origin: validationService.BASIC,
        nationality: validationService.BASIC,
        visitor_email: emailValidation
      };

      //TODO:: Work on a better generator for visitor's pass code possibly a service
      $scope.visitor.visitorPassCode = angular.isDefined($scope.visitor.visitorPassCode)
        ? new Date().getTime(): $scope.visitor.visitorPassCode;

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
  .controller('VisitorDetailCtrl', function ($scope, $stateParams, visitorService) {
    $scope.visitor = {};

    var deferred = visitorService.get($stateParams.id);

    deferred
      .then(function(response) {
        console.log(response);
        $scope.visitor = response;
        $scope.title = $scope.visitor.firstName + ' ' + $scope.visitor.lastName + '\'s Detail';
      })
      .catch(function(reason) {
        console.log(reason);
      });
  })
;
