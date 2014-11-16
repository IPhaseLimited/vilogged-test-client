'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorService
 * @description
 * # visitorService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorService', function visitorService($q, storageService, db, syncService, config, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.VISITORS;
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';

    function findByField(field, value) {
      //return storageService.findByField(DB_NAME, field, value);

      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/?' + field + '=' + value)
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getAllVisitors() {
      //return storageService.all(DB_NAME);
      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/nested/')
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
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
      findByField('visitors_pass_code', visitorPassCode)
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

      var promises = [
        findByField('visitors_pass_code', value),
        findByField('visitors_phone', value)
      ];
      $q.all(promises)
        .then(function(response) {
          if (response[0].length || response[1].length ) {
            if (response[0].length) {
              deferred.resolve(response[0][0]);
            } else {
              deferred.resolve(response[1][0]);
            }
          } else {
            deferred.reject({message: 'no match found'});
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
