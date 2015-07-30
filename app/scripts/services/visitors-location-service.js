'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorsLocationService
 * @description
 * # visitorsLocationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorsLocationService', function visitorsLocationService($q, storageService, db, $http, config, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var BASE_URL = config.api.backend + config.api.backendCommon + '/', _this = this;
    var DB_NAME = db.VISITORS_LOCATION.replace(/_/, '-');

    _this.all = function(options) {
      return storageService.all(DB_NAME, options);
    };

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    _this.get = function(id, options) {
      return storageService.find(DB_NAME, id, options);
    };

    _this.findByField = function(field, value) {
      var options = {};
      options[field] = value;
      return storageService.all(options);
    };

    _this.getUpdates = syncService.getUpdates;
  });
