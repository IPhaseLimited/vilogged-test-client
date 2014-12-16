'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.entranceService
 * @description
 * # entranceService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('entranceService', function entranceService($q, $http, db, storageService, syncService, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.ENTRANCE.replace(/_/, '-');
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';

    function getAllEntrance() {
      return storageService.all(DB_NAME)
    }

    function getEntrance(id) {
      return storageService.find(DB_NAME, id);
    }

    this.save = function(entrance) {
      return storageService.save(DB_NAME, entrance);
    };

    this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id);
    };

    function hasUsage(id) {
      var deferred = $q.defer();
      var DB_NAME = db.APPOINTMENTS;

      $http.get(BASE_URL+DB_NAME+'?entrance_id='+id)
        .success(function(response) {
          deferred.resolve(!(response.length === 0));
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    this.all = getAllEntrance;
    this.get = getEntrance;
    this.hasUsage = hasUsage;
    this.getUpdates = syncService.getUpdates;
  });
