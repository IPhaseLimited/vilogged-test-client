'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.visitorService
 * @description
 * # visitorService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('visitorService', function visitorService($q, storageService, db, syncService, $http, config, $cookies, cacheService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.VISITORS, _this = this;
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';

    var EMAIL_TEMPLATE = 'Hello &&first_name&& &&last_name&&,\n\nYour profile as a visitor has ' +
      'successfully been created.\n\nYou can gain access to out premises using either your Phone Number: &&phone&& '
      + 'OR Pass Code: &&pass_code&&\n\nNigerian Communication Commission';

    var SMS_TEMPLATE = 'Hello &&first_name&& &&last_name&&, your profile as a visitor has been created. You can ' +
      'now log on using either, Phone Number: &&phone&& OR Pass Code: &&pass_code&&';


    _this.all = function() {
      return storageService.all(DB_NAME);
    };

    _this.get = function(id) {
      return storageService.find(DB_NAME);
    };

    _this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id);
    };

    _this.findByPassCodeOrPhone = function(value) {
      var deferred = $q.defer();

      var promises = [
        storageService.all(DB_NAME, {visitors_pass_code: value}),
        storageService.all(DB_NAME, {visitors_phone: value})
      ];
      $q.all(promises)
        .then(function(response) {
          var res = response[0].concat(response[1]);
          if (res.length > 0) {
            deferred.resolve(res[0]);
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

    _this.findByPhone = function(value) {
      var deferred = $q.defer();
      storageService(DB_NAME, {visitors_phone: value})
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

    _this.visitorsGroupByCompanyName = function() {
      var deferred = $q.defer();
      storageService.all(DB_NAME)
        .then(function(response) {
          var visitors = {};
          for (var i=0; i < response.length; i++) {
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
    };

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    _this.findByVisitorPassCode = function(visitorPassCode) {
      var deferred = $q.defer();
      storageService.all(DB_NAME, {visitors_pass_code: visitorPassCode})
        .then(function(response) {
          deferred.resolve(response[0] || {});
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

    _this.hasAppointments = function() {
      var deferred = $q.defer();
      var currentUser = $cookies.getObject('current-user') || {};
      var visitorsList = [];
      if (!currentUser.is_vistor && !currentUser.is_staff) {
        storageService.all(db.APPOINTMENTS, {host_id: currentUser._id})
          .then(function(response) {
            if (response.length) {
              var len = response.length;
              for (var i = 0; i < len; i++) {
                var row = response[i];
                if (visitorsList.indexOf(row.visitor_id) === -1) {
                  visitorsList.push(row.visitor_id);
                }
              }
            }
            deferred.resolve(visitorsList);
          })
          .catch(function(reason) {
            deferred.reject(reason);
          });

      } else {
        deferred.resolve(visitorsList);
      }

      return deferred.promise;
    };


    this.DBNAME = DB_NAME;
    this.EMAIL_TEMPLATE = EMAIL_TEMPLATE;
    this.SMS_TEMPLATE = SMS_TEMPLATE;
    this.getUpdates = syncService.getUpdates;
  });
