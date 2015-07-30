'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.entranceService
 * @description
 * # entranceService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('entranceService', function entranceService($q, db, storageService, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.ENTRANCE.replace(/_/, '-'), _this = this;

    _this.all = function(options) {
      return storageService.all(DB_NAME, options)
    };

    _this.get = function(id, options) {
      return storageService.find(DB_NAME, id, options);
    };

    _this.save = function(entrance) {
      return storageService.save(DB_NAME, entrance);
    };

    _this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id);
    };

    _this.hasUsage = function(id) {
      var deferred = $q.defer();
      var DB_NAME = db.APPOINTMENTS;

      storageService.all(DB_NAME, {entrance_id: id})
        .then(function(response) {
          deferred.resolve(!(response.length === 0));
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    this.getUpdates = syncService.getUpdates;
  });
