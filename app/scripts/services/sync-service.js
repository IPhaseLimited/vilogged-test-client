'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.syncService
 * @description
 * # syncService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('syncService', function syncService($q, $http, pouchdb, config, db, $cookieStore, $interval, $rootScope) {
    var dbNames = db;

    if ($rootScope.config) {
      config = $rootScope.config
    }

    function updateRecord(fn, _delay) {
      var delay = angular.isDefined(_delay) ? _delay : 30000; //3 minutes
      $interval(function() {
        if (!$rootScope.busy) {
          fn();
        }
      }, delay);
    }

    function getDBChanges(db) {
      var lastSeq = $cookieStore.get(db);
      if (angular.isUndefined(lastSeq)) {
        lastSeq = 1;
      }
      var deferred = $q.defer();
      var status = {
        update: false,
        lastSeq: lastSeq
      };
      $http.get(config.api.localDB+'/'+db+'/_changes?since='+lastSeq)
        .success(function(response) {
          if (response.last_seq > lastSeq) {
            $cookieStore.put(db, response.last_seq);
            status.update = true;
            status.lastSeq = response.last_seq;
          } else {
            status.update = false;
          }
          deferred.resolve(status);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function replicateTo(db) {
      var deferred = $q.defer();
      var syncParams = {
        continuous: true,
        create_target: true,
        target: config.api.couchDB+'/'+db,
        source: db
      };
      $http.post(config.api.localDB+'/_replicate', syncParams)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason.error === 'db_not_found') {
            createDB(db)
              .success(function(response) {
                deferred.resolve(response);
                return replicateTo(db);
              })
              .error(function(reason) {
                deferred.reject(reason);
              });
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    }

    function replicateFrom(db) {
      var deferred = $q.defer();
      var syncParams = {
        continuous: true,
        create_target: true,
        source: config.api.couchDB+'/'+db,
        target: db
      };
      $http.post(config.api.localDB+'/_replicate', syncParams)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason.error === 'db_not_found') {
            createDB(db)
              .success(function(response) {
                deferred.resolve(response);
                return replicateFrom(db);
              })
              .error(function(reason) {
                deferred.reject(reason);
              });
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    }

    function createDB(db) {
      return  $http.put(config.api.localDB+'/'+db);
    }

    function startUpReplication() {
      (Object.keys(dbNames)).forEach(function(key) {
        var DB_NAME = dbNames[key];
        replicateFrom(DB_NAME)
          .then(function() {
            replicateTo(DB_NAME)
              .then(function() {

              })
              .catch(function(reason) {

              });
          })
          .catch(function(reason) {

          });
      });
    }

    this.startReplication = startUpReplication;
    this.getChanges = getDBChanges;
    this.getUpdates = updateRecord;
  });
