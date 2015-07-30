'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.localStorageService
 * @description
 * # localStorageService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('localStorageService', function localStorageService($q, utility) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.put = function(table, data) {
      var deferred = $q.defer();

      localforage.setItem(table, data, function(err, value) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(value);
        }
      });
      return deferred.promise;
    };

    this.allDocs = function(table) {
      var deferred = $q.defer();
      localforage.getItem(table, function(err, value) {
        var objectList = [];
        if (err) {
          deferred.reject(err);
        } else {
          if (Object.prototype.toString.call(value) === '[object Object]') {

            for (var i = 0; i < (Object.keys(value)).length; i++) {
              objectList.push(value[i]);
            }
          }
          deferred.resolve(objectList);
        }
      });
      return deferred.promise;
    };

    this.get = function(table, id) {
      var deferred = $q.defer();
      localforage.getItem(table, function(err, value) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(value);
        }
      });
      return deferred.promise;
    };

    this.remove = function(table, id) {

    };

    this.destroy = function(table) {

    };

    this.bulkDocs = function(table, docs) {

    };

    this.getRemoteData = function(db){
    };


  });
