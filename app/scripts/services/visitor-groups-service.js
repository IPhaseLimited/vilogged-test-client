'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorGroupsService
 * @description
 * # visitorGroupsService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorGroupsService', function visitorGroupsService($q, storageService, db, utility, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.Visitor_Group.replace(/_/, '-'), _this = this;

    _this.all = function(options) {
      return storageService.all(DB_NAME, options);
    };

    _this.getAllObject = function(options) {
      var deferred = $q.defer();
      _this.all(options)
        .then(function(response) {
          deferred.resolve(utility.castArrayToObject(response));
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    _this.changes = function() {
      return syncService.getChanges(DB_NAME);
    };

    _this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    _this.get = function(id) {

      return storageService.find(DB_NAME, id);
    };

    _this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id);
    };

    _this.getUpdates = syncService.getUpdates;

  });
