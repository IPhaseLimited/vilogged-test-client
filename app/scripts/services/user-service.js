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

    var TIME_OUT = 90000; //1.5min
    var CONFIG = {timeout: TIME_OUT};

    function getAllUsers() {
      var deferred = $q.defer();
      $http.get(config.api.backend + '/api/v1/users/', CONFIG)
        .success(function(users) {
          deferred.resolve(users)
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    }

    function getUser(id) {
      var deferred = $q.defer();
      $http.get(config.api.backend + '/api/v1/user/' + id + '/', CONFIG)
        .then(function(response) {
          deferred.resolve(response.data);
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function getCurrentUser() {
      var deferred = $q.defer();
      $http.get(config.api.backend + '/api/v1/current-user/', CONFIG)
        .success(function(user) {
          deferred.resolve(user);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function getUserByName(value) {
      var deferred = $q.defer();

      var promises = [
        findUserBy('first_name', value),
        findUserBy('last_name', value)
      ];

      $q.all(promises)
        .then(function(response) {
          if (response[0].length || response[1].length) {
            if (response[0].length) {
              deferred.resolve(response[0]);
            } else {
              deferred.resolve(response[1]);
            }
          } else {
            deferred.resolve({message: 'no match found'});
          }
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
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
            deferred.resolve({message: 'no match found'});
          }
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    }

    function getUserByNameOrPhone(value) {
      var deferred = $q.defer();

      var promises = [
        getUserByPhone(value),
        getUserByName(value)
      ];

      $q.all(promises)
        .then(function(response) {
          if (response[0].length || response[1].length) {
            if (response[0].length) {
              deferred.resolve(response[0]);
            } else {
              deferred.resolve(response[1]);
            }
          } else {
            deferred.resolve({message: 'no match found'});
          }
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    }

    function getUsersFromLDAP() {
      var deferred = $q.defer();
      $http.get(config.api.backend + '/api/v1/import-users')
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function saveUserAccount(user) {
      var deferred = $q.defer();
      if (!user.id) {
        $http.post(config.api.backend + '/api/v1/user/', user, CONFIG)
          .success(function(response) {
            deferred.resolve(response);
          })
          .error(function(reason) {
            if (reason === null) {
              deferred.reject('timeout');
            } else {
              deferred.reject(reason);
            }
          });
      } else {
        return updateUser(user);
      }
      return deferred.promise;
    }

    function updateUser(user) {
      var deferred = $q.defer();
      $http.put(config.api.backend + '/api/v1/user/' + user.id + '/', user, CONFIG)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function toggleUserAccountActive(id) {
      var deferred = $q.defer();
      getUser(id)
        .then(function(response) {
          response.is_active = !response.is_active;
          updateUser(response)
            .then(function(response) {
              deferred.resolve(response);
            })
            .catch(function(reason) {
              if (reason === null) {
                deferred.reject('timeout');
              } else {
                deferred.reject(reason);
              }
            });
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function removeUser(id) {
      var deferred = $q.defer();
      $http.delete(config.api.backend + '/api/v1/user/' + id + '/', CONFIG)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    }

    function updatePassword(password) {
      var deferred = $q.defer();
      $http.post(config.api.backend + '/api/v1/user/set/password', password, CONFIG)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function findUserBy(field, value) {
      var deferred = $q.defer();
      $http.get(config.api.backend + '/api/v1/user/?' + field + '=' + value, CONFIG)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });
      return deferred.promise;
    }

    function listNestedUsers() {
      var deferred = $q.defer();

      $http.get(config.api.backend + '/api/v1/users/nested', CONFIG)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            if (reason === null) {
              deferred.reject('timeout');
            } else {
              deferred.reject(reason);
            }
          }

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
    this.getUserByName = getUserByName;
    this.getUserByNameOrPhone = getUserByNameOrPhone;
    this.getLDAPUsers = getUsersFromLDAP;
  });
