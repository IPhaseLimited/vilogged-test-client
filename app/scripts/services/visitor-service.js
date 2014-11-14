'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorService
 * @description
 * # visitorService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorService', function visitorService($q, storageService, db, syncService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.VISITORS;

    function findByField(field, value) {
      return storageService.findByField(DB_NAME, field, value);
    }

    function getAllVisitors() {
      return storageService.all(DB_NAME);
    }

    function getChanges() {
      return syncService.getChanges(DB_NAME);
    }

    function visitorsGroupByCompanyName() {
      var deferred = $q.defer();
      getAllVisitors()
        .then(function(response) {
          var visitors = {};
          for (var i=0; i<response.length; i++) {
            var visitor = response[i];
            if (!visitors.hasOwnProperty(visitor.company_name)) {
              visitors[visitor.company_name] = [];
              visitors[visitor.company_name].push(visitor);
            } else {
              visitors[visitor.company_name].push(visitor);
            }
          }
          deferred.resolve(visitors);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    this.findByField = findByField;

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.get = function(id) {
      return storageService.find(DB_NAME, id);
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

    this.findByPassCodeOrPhone = function (value) {
      var deferred = $q.defer();
      getAllVisitors()
        .then(function (response) {
          var filtered = response.filter(function (row) {
            return (String(row.visitor_pass_code) === String(value)) || (String(row.visitor_phone) === String(value));
          });

          if (filtered.length > 0) {
            deferred.resolve(filtered[0]);
          } else {
            deferred.reject(filtered);
          }
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.all = getAllVisitors;
    this.changes = getChanges;
    this.getVisitorsGroupedByCompany = visitorsGroupByCompanyName;
    this.DBNAME = DB_NAME;
  });
