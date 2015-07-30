'use strict';

angular.module('viLoggedClientApp')
  .service('cacheService', function cacheService($q) {


    this.get = function (dbName) {
      var deferred = $q.defer();
      localforage.getItem(dbName, function(err, value) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(value);
        }
      });
      return deferred.promise;
    };

    this.save = function (dbName, value) {
      var deferred = $q.defer();

      localforage.setItem(dbName, value, function(err, value) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(value);
        }
      });
      return deferred.promise;
    }

  });
