'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.userService
 * @description
 * # userService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('userService', function userService($q, $http, config, $cookieStore) {
    // AngularJS will instantiate a singleton by calling "new" on this function
     function getAllUsers() {
      var deferred = $q.defer();
      //$http.get(config.api.backend+'/api/v1/users')
      $http.get(config.api.backend+'/scripts/fixtures/users.json')
        .success(function(users) {
          deferred.resolve(users)
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getUser(id) {
      var deferred = $q.defer();
      getAllUsers()
        .then(function(users) {
          var user = {};
          var filtered = users
            .filter(function(row) {
              return parseInt(row.id) === parseInt(id);
            });
          if (filtered > 0) {
            user = filtered[0];
          }
          deferred.resolve(user);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function getCurrentUser() {
      var deferred = $q.defer();
      $http.get(config.api.backend+'/api/v1/current-user/')
        .success(function(user) {
          deferred.resolve(user);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    this.all = getAllUsers;
    this.get = getUser;
    this.currentUser = getCurrentUser;
    this.user = $cookieStore.get('current-user');
  });
