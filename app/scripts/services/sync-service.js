'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.syncService
 * @description
 * # syncService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('syncService', function syncService($http, pouchdb, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var db = pouchdb.create('visitors');
    db.replicate.to(config.api.localDB+'/visitors', {live: true})
      .then(function(response) {
        console.log(response);
      }).catch(function(reason){
        console.log(reason);
      });

    db.replicate.from(config.api.localDB+'/visitors', {live: true})
      .then(function(response) {
        console.log(response);
      }).catch(function(reason){
        console.log(reason);
      });

    var failCount = 0;

    var replicate = {
      to: function() {
        var syncParams = {
          continuous: true,
          create_target: true,
          source: config.api.couchDB+'/visitors',
          target: 'visitors'
        };
        return $http.post(config.api.localDB+'/_replicate', syncParams)
      },
      from: function() {
        var syncParams = {
          continuous: true,
          create_target: true,
          target: config.api.couchDB+'/visitors',
          source: 'visitors'
        };
        return $http.post(config.api.localDB+'/_replicate', syncParams);
      }
    };

    replicate.to()
      .success(function () {
        replicate.from()
          .success(function() {

          })
          .error(function(reason) {
            failCount += 1;
            if (failCount < 5) {
              replicate.from();
            }
            console.log(reason);
          });

      })
      .error(function(reason) {
        failCount += 1;
        if (failCount < 5) {
          replicate.to();
        }
        console.log(reason);
      });


  });
