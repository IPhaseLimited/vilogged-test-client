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
      $http.get(config.api.backend + '/api/v1/users/')
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
      $http.get(config.api.backend + '/api/v1/user/' + id + '/')
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
      $http.get(config.api.backend + '/api/v1/current-user/')
        .success(function(user) {
          deferred.resolve(user);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function getUserByPhone(value) {
      var deferred = $q.defer();

      var promises = [
        findUserBy('user_profile__phone', value),
        findUserBy('user_profile__home_phone', value),
        findUserBy('user_profile__work_phone', value)
      ];

      $q.all(promises)
        .then(function(response) {
          if (response[0].length || response[1].length || response[2].length) {
            if (response[0].length) {
              deferred.resolve(response[0]);
            } else if (response[1].length) {
              deferred.resolve(response[1]);
            } else {
              deferred.resolve(response[2]);
            }
          } else {
            deferred.reject({message: 'no match found'});
          }
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function saveUserAccount(user) {
      var deferred = $q.defer();
      if (!user.id) {
        $http.post(config.api.backend + '/api/v1/user/', user)
          .success(function(response) {
            deferred.resolve(response);
          })
          .error(function(reason) {
            deferred.reject(reason);
          });
      } else {
        return updateUser(user);
      }
      return deferred.promise;
    }

    function updateUser(user) {
      var deferred = $q.defer();
      $http.put(config.api.backend + '/api/v1/user/' + user.id + '/', user)
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
        .then(function(response) {
          response.is_active = !response.is_active;
          updateUser(id, response)
            .then(function(response) {
              deferred.resolve(response);
            })
            .catch(function(reason) {
              deferred.reject(reason);
            });
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function removeUser(id) {
      var deferred = $q.defer();
      $http.delete(config.api.backend + '/api/v1/user/' + id + '/')
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function updatePassword(password) {
      var deferred = $q.defer();
      $http.post(config.api.backend + '/api/v1/user/set/password', password)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function findUserBy(field, value) {
      var deferred = $q.defer();
      $http.get(config.api.backend + '/api/v1/user/?' + field + '=' + value)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function listNestedUsers() {
      var deferred = $q.defer();

      $http.get(config.api.backend + '/api/v1/users/nested')
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    this.all = getAllUsers;
    this.get = getUser;
    this.currentUser = getCurrentUser;
    this.save = saveUserAccount;
    this.user = $cookieStore.get('current-user');
    this.toggleUserActivationStatus = toggleUserAccountActive;
    this.remove = removeUser;
    this.updatePassword = updatePassword;
    this.findUserBy = findUserBy;
    this.usersNested = listNestedUsers;
    this.getUserByPhone = getUserByPhone;
  });
