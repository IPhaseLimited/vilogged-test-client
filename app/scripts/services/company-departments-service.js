'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.companyDepartmentsService
 * @description
 * # companyDepartmentsService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('companyDepartmentsService', function companyDepartmentsService($q, storageService, db) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.COMPANY_DEPARTMENTS;

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.all = function() {
      return storageService.all(DB_NAME);
    };
  });
