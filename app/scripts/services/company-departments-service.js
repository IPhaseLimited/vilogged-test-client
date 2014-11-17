'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.companyDepartmentsService
 * @description
 * # companyDepartmentsService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('companyDepartmentsService', function companyDepartmentsService($q, storageService, db, utility, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.COMPANY_DEPARTMENTS.replace(/_/, '-');

    function getAll() {
      return storageService.all(DB_NAME);
    }

    function getAllObject() {
      var deferred = $q.defer();
      getAll()
        .then(function(response) {
          deferred.resolve(utility.castArrayToObject(response));
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    this.changes = function() {
      return syncService.getChanges(DB_NAME);
    };

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.get = function(id) {

      return storageService.find(DB_NAME, id);
    };

    this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id);
    };

    this.all = getAll;


  });
