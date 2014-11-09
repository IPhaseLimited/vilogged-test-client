'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.companyDepartmentsService
 * @description
 * # companyDepartmentsService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('companyDepartmentsService', function companyDepartmentsService($q, storageService, db, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.COMPANY_DEPARTMENTS;

    this.changes = function() {
      return syncService.getChanges(DB_NAME);
    };

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.all = function() {
      return storageService.all(DB_NAME);
    };

    this.get = function(id) {
      return storageService.find(DB_NAME, id);
    };

    this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id);
    }
  });
