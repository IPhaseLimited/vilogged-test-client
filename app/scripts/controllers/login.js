'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('logout', {
        url: '/logout',
        templateUrl: 'views/login/login.html',
        controller: 'LogoutCtrl'
      });
  })
  .controller('LoginCtrl', function ($scope, $state, loginService, visitorService) {
    $scope.displayVisitorLogin = true;

    $scope.toggleLoginScreen = function() {
      $scope.displayVisitorLogin = !$scope.displayVisitorLogin;
    };

    $scope.visitor = {};
    $scope.visitorLogin = function() {
      visitorService.findByPassCodeOrPhone($scope.visitor.identity)
        .then(function(response) {
          loginService.visitorLogin($scope.visitor);
          $state.go("show-visitor");
        })
        .catch(function(reason) {
          loginService.visitorLogin($scope.visitor);
          $state.go("create-visitor-profile");
        })
    };

    $scope.credentials = {};
    $scope.login = function() {
      loginService.login($scope.credentials)
        .then(function() {
          $scope.loginError = false;
          $state.go('home');
        })
        .catch(function(reason) {
          $scope.loginError = true;
          $scope.errorMessages = reason.loginMessage;
          console.log(reason);
        });
    }
  })
  .controller('LogoutCtrl', function ($scope, $state, loginService) {
    $state.go('login');
    loginService.logout();
  });
