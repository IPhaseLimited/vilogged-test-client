'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorService
 * @description
 * # visitorService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorService', function visitorService(storageService, db) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.VISITORS;

    this.save = function(object) {
      storageService.save(object)
    }

  });
