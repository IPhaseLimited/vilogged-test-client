'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.loginService
 * @description
 * # loginService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('loginService', function loginService($q, $cookieStore, $http, $rootScope, userService, config, visitorService) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var TIME_OUT = 5000;
    var CONFIG = {timeout: TIME_OUT};

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
        $http.post(config.api.backend + '/api-token-auth/', credentials, CONFIG)
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
                loginResponse.loginMessage = reason;
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

    function visitorLogin(credential) {
      var ERROR_MESSAGE = 'Phone number or passcode didn\'t match. Please try again or create a visitor account.';
      var deferred = $q.defer();
      var loginResponse = {
        loginMessage: {},
        loginRawResponse: {},
        status: ''
      };
      if (credential.identity) {
        visitorService.findByPassCodeOrPhone(credential.identity)
          .then(function(response) {
            loginResponse.status = 200;
            loginResponse.loginMessage = 'Login was successful';
            loginResponse.loginRawResponse = response;
            $rootScope.user = toUser(response);
            $cookieStore.put('vi-visitor', $rootScope.user );
            deferred.resolve(loginResponse);
          })
          .catch(function(reason) {
            if (reason === null) {
              deferred.reject('timeout');
            } else {
              loginResponse.status = 401;
              loginResponse.loginMessage = ERROR_MESSAGE;
              deferred.reject(loginResponse);
            }
          })
      }

      return deferred.promise;
    }

    function toUser(visitor) {
      return {
        last_name: visitor.last_name,
        first_name: visitor.first_name,
        username: visitor.visitors_pass_code,
        email: visitor.visitors_email,
        is_superuser: false,
        is_active: false,
        is_staff: false,
        id: visitor.uuid,
        is_vistor: true
      }
    }

    function anonymousLogin() {
      $cookieStore.put('vi-anonymous-token', Date.now())
    }

    function logout() {
      $cookieStore.remove('vi-token');
      $cookieStore.remove('no-login');
      $cookieStore.remove('current-user');
      $cookieStore.remove('vi-visitor');
      $cookieStore.remove('vi-anonymous-token');
    }

    this.login = login;
    this.visitorLogin = visitorLogin;
    this.anonymousLogin = anonymousLogin;
    this.logout = logout;
  });
