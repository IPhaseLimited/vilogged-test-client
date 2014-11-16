'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.apiService
 * @description
 * # apiService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('apiService', function apiService($http, apiFactory, config, $q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';
    this.put = function(db, data) {
      var deferred = $q.defer();
      //return apiFactory.put({_db:db, _param: data.uuid}, data).$promise;
      $http.put(BASE_URL + db, data)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.post = function(db, data) {
      //return apiFactory.post({_db:db}, data).$promise;
      var deferred = $q.defer();
      $http.post(BASE_URL + db, data)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.allDocs = function(db) {
      /*return apiFactory.get({
        // jshint camelcase: false
        _db: db
      }).$promise;*/

      var deferred = $q.defer();
      $http.get(BASE_URL + db)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.get = function(db, id) {
      //return apiFactory.get({_db: db, _param: id}).$promise;
      var deferred = $q.defer();

      $http.get(BASE_URL + db + '/'+ id)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.remove = function(db, id) {
      //return apiFactory.remove({_db: db, _param: id}).$promise;
      var deferred = $q.defer();

      $http.delete(BASE_URL + db + '/'+ id)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.destroy = function(db) {
    };

    this.bulkDocs = function(db, docs) {

    };

    this.compact = function(db){

    };

    this.viewCleanup = function(db){

    };

    this.query = function(db, key, value){

    };
  });
