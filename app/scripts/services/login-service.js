'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.loginService
 * @description
 * # loginService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('loginService', function loginService($q, userService, $cookieStore, $http, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function login(credentials) {
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
                $cookieStore.put('current-user', user);
                deferred.resolve(loginResponse);
              })
              .catch(function(reason) {
                deferred.resolve(loginResponse);
                console.log(reason);
              });
          })
          .error(function(reason, status) {
            loginResponse.status = status;
            loginResponse.loginRawResponse = reason.non_field_errors[0];
            deferred.reject(loginResponse);
          });
      } else {
        loginResponse.status = 401;
        loginResponse.loginMessage = 'username and password didn\'t match. Please try again';
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
