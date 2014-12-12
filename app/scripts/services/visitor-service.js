'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorService
 * @description
 * # visitorService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorService', function visitorService($q, storageService, db, syncService, $http, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.VISITORS;
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';

    var EMAIL_TEMPLATE = 'Hello &&first_name&& &&last_name&&,\n\nYour profile as a visitor has ' +
      'successfully been created.\n\nYou can gain access to out premises using either your Phone Number: &&phone&& '
      + 'OR Pass Code: &&pass_code&&\n\nNigerian Communication Commission';

    var SMS_TEMPLATE = 'Hello &&first_name&& &&last_name&&, your profile as a visitor has been created. You can ' +
      'now log on using either, Phone Number: &&phone&& OR Pass Code: &&pass_code&&';

    function findByField(field, value) {
      //return storageService.findByField(DB_NAME, field, value);

      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/?' + field + '=' + value)
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
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
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
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
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
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
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    this.findByPhone = function(value) {
      var deferred = $q.defer();

      findByField('visitors_phone', value)
        .then(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    this.findByPassCodeOrPhone = function(value) {
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
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    this.all = getAllVisitors;
    this.changes = getChanges;
    this.getVisitorsGroupedByCompany = visitorsGroupByCompanyName;
    this.DBNAME = DB_NAME;
    this.EMAIL_TEMPLATE = EMAIL_TEMPLATE;
    this.SMS_TEMPLATE = SMS_TEMPLATE;
    this.getUpdates = syncService.getUpdates;
  });
