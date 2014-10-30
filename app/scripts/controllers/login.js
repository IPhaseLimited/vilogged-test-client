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
    $scope.credentials = {};
    $scope.login = function() {
      loginService.login($scope.credentials)
        .then(function() {
          $scope.loginError = false;
          $state.go('home');
        })
        .catch(function(reason) {
          $scope.loginError = true;
          console.log(reason);
        });
    }
  })
  .controller('LogoutCtrl', function ($scope, $state, loginService) {
    $state.go('login');
    loginService.logout();
  });
