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
      $http.get(config.api.backend+'/api/v1/users/')
      //$http.get(config.api.backend+'/scripts/fixtures/users.json')
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
      $http.get(config.api.backend+'/api/v1/user/'+id+'/')
        .then(function(response) {
          deferred.resolve(response.data);
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

    function saveUserAccount(user) {
      var deferred = $q.defer();
      $http.post(config.api.backend+'/api/v1/user/', user)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function updateUserAccount(id, user) {
      var deferred = $q.defer();
      $http.put(config.api.backend+'/api/v1/user/'+id, user)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function toggleUserAccountActive(id) {
      var deferred = $q.defer();
      getUser(id)
        .then(function (response) {
          response.is_active = !response.is_active;
          updateUserAccount(id, response);
        })
        .catch(function(reason) {
          console.log(reason);
        });
      return deferred.promise;
    }

    this.all = getAllUsers;
    this.get = getUser;
    this.currentUser = getCurrentUser;
    this.save = saveUserAccount;
    this.user = $cookieStore.get('current-user');
    this.toggleUserActivationStatus = toggleUserAccountActive;
  });
