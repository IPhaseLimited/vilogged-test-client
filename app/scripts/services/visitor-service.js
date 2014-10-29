'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorService
 * @description
 * # visitorService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorService', function visitorService($q, storageService, db) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.VISITORS;

    var findByField = function(field, value) {
      return storageService.findByField(DB_NAME, field, value);
    };

    this.findByField = findByField;

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.get = function(id) {
      return storageService.find(DB_NAME, id);
    };

    var getAllVisitors = function() {
      return storageService.all(DB_NAME);
    };

    this.findByVisitorPassCode = function(visitorPassCode) {
      var deferred = $q.defer();
      findByField('visitor_pass_code', visitorPassCode)
        .then(function(response) {
          var filtered = {};
          if (response.length > 0) {
            filtered = response[0];
          }
          deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.all = getAllVisitors;
    this.DBNAME = DB_NAME;
  });
