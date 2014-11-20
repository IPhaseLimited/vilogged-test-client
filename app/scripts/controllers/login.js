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
  .controller('LoginCtrl', function ($scope, $state, loginService) {
    $scope.displayVisitorLogin = true;

    $scope.visitorCredential = {};
    $scope.visitorLogin = function() {
      $scope.busy = true;
      loginService.visitorLogin($scope.visitorCredential)
        .then(function (response) {
          $scope.loginError = false;
          $scope.busy = false;
          //FIXME:: fix redirection on login
          $state.go('show-visitor', {visitor_id: response.loginRawResponse.uuid})
        })
        .catch(function (reason) {
          $scope.loginError = true;
          $scope.errorMessages = reason.loginMessage;
          $scope.visitorCredential.identity = '';
          $scope.busy = false;
        })
    };

    $scope.credentials = {};
    $scope.login = function() {
      $scope.busy = true;
      loginService.login($scope.credentials)
        .then(function() {
          $scope.loginError = false;
          $scope.busy = false;
          $state.go('home');
        })
        .catch(function(reason) {
          $scope.loginError = true;
          $scope.errorMessages = reason.loginMessage;
          console.log(reason);
          $scope.busy = false;
        });
    }
  })
  .controller('LogoutCtrl', function ($scope, $state, $location, loginService) {
    loginService.logout();
    $location.path('');
    $state.go('login');
  });
