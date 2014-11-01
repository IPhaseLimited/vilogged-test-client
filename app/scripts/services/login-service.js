'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.loginService
 * @description
 * # loginService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('loginService', function loginService($q, userService, $cookieStore, $http, config, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function login(credentials) {
      var ERROR_MESSAGE = 'username and password didn\'t match. Please try again';
      var deferred = $q.defer();
      var loginResponse = {
        loginMessage: {},
        loginRawResponse: {},
        status: ''
      };
      if (credentials.username && credentials.password) {
        $http.defaults.useXDomain = true;
        $http.post(config.api.backend + '/api-token-auth/', credentials)
          .success(function(response, status) {
            loginResponse.status = status;
            loginResponse.loginMessage = 'login was successful';
            loginResponse.loginRawResponse = response;
            $cookieStore.put('vi-token', response.token);
            $http.defaults.headers.common['Authorization'] = 'Token ' + response.token;
            userService.currentUser()
              .then(function(user) {
                $rootScope.user = user;
                $cookieStore.put('current-user', user);
                deferred.resolve(loginResponse);
              })
              .catch(function(reason) {
                deferred.resolve(loginResponse);
              });
          })
          .error(function(reason, status) {
            loginResponse.status = status;
            if (angular.isDefined(reason.non_field_errors)){
              loginResponse.loginMessage = reason.non_field_errors[0];
            }
            if (angular.isDefined(reason.detail)) {
              loginResponse.loginMessage = reason.detail === 'Invalid Token' ? ERROR_MESSAGE : reason.detail;
            }

            deferred.reject(loginResponse);
          });
      } else {
        loginResponse.status = 401;
        loginResponse.loginMessage = ERROR_MESSAGE;
        deferred.reject(loginResponse);
      }

      return deferred.promise;
    }

    function logout() {
      $cookieStore.remove('vi-token');
      $cookieStore.remove('no-login');
      $cookieStore.remove('current-user');
    }

    this.login = login;
    this.logout = logout;
  });
