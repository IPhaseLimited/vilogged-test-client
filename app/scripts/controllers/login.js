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
        controller: 'LoginCtrl',
        controllerAs: 'LoginCtrl'
      })
      .state('logout', {
        url: '/logout?back',
        templateUrl: 'views/login/login.html',
        controller: 'LogoutCtrl',
        controllerAs: 'LoginCtrl'
      });
  })
  .controller('LoginCtrl', function($scope, $state, loginService, $rootScope, notificationService, $location, toastr) {
    var vm = this;
    $scope.displayVisitorLogin = true;

    vm.toggleForm = function() {
      $scope.displayVisitorLogin = !$scope.displayVisitorLogin;
    };

    $rootScope.busy = false;
    $scope.visitorCredential = {};
    $scope.visitorLogin = function() {
      $rootScope.busy = true;
      loginService.visitorLogin($scope.visitorCredential)
        .then(function(response) {
          $scope.loginError = false;
          $rootScope.busy = false;
          //FIXME:: fix redirection on login
          $state.go('show-visitor', {visitor_id: response.loginRawResponse._id})
        })
        .catch(function(reason) {
          toastr.error(reason.loginMessage);
          $scope.visitorCredential.identity = '';
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        })
    };

    $scope.credentials = {};
    $scope.login = function() {
      $rootScope.busy = true;
      loginService.login($scope.credentials)
        .then(function() {
          $rootScope.busy = false;
          var returnUrl = $location.search().back;
          var back = '/';
          if (returnUrl) {
            back = decodeURIComponent(returnUrl);
            delete $location.search().back;
          }
          $location.path(back);
        })
        .catch(function(reason) {
          toastr.error(reason.loginMessage);
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }
  })
  .controller('LogoutCtrl', function($scope, $state, $location, loginService, $rootScope) {
    $rootScope.busy = false;
    var currentUrl = $location.search().back;
    var back = '/';
    if (currentUrl) {
      back = decodeURIComponent(currentUrl);
      delete $location.search().back;
    }
    $location.search('back', back);
    loginService.logout();
    $location.path('/login');

  });
