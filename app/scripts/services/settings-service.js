'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.settingsService
 * @description
 * # settingsService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('settingsService', function settingsService($rootScope, $http, $location, $q, $cookieStore) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    function loadConfig() {
      var deferred = $q.defer();
      $http.get('/scripts/config.json')
        .success(function(response) {
          deferred.resolve(response);
          $cookieStore.put('config', response);
          $rootScope.config = response;
        })
        .error(function(reason, status) {
          deferred.reject(reason);
          console.log(reason, status);
        });
      return deferred.promise;
    }

    function getConfig() {
      var config = {};
      var storedConfig = $cookieStore.get('config');
      if (storedConfig) {
        config = storedConfig;
      }

      return config;
    }

    function testUrl(url) {
      var deferred = $q.defer();

      $http.get(url)
        .success(function(response, status) {
          deferred.resolve({
            response: response,
            status: status
          });
        })
        .error(function(response, status) {
          deferred.resolve({
            response: response,
            status: status
          });
        });
      return deferred.promise;
    }

    this.loadConfig = loadConfig;
    this.getConfig = getConfig;
    this.testUrl = testUrl;
  });
