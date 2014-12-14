'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.entranceService
 * @description
 * # entranceService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('entranceService', function entranceService($q, $http, db, storageService, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.ENTRANCE.replace(/_/, '-');

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

    this.all = getAllEntrance;
    this.get = getEntrance;
    this.getUpdates = syncService.getUpdates;
  });
