'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorsLocationService
 * @description
 * # visitorsLocationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorsLocationService', function visitorsLocationService($q, storageService, db, $http, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';
    var DB_NAME = db.VISITORS_LOCATION.replace(/_/, '-');

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.get = function(id) {
      return storageService.find(DB_NAME, id);
    };

    this.findByField = function(field, value) {
      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '?' + field + '=' + value)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }
  });
