'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.entranceService
 * @description
 * # entranceService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('entranceService', function entranceService($q, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function getAllEntrance() {
      var deferred = $q.defer();
      $http.get('scripts/fixtures/entrance.json')
        .success(function(entrance) {
          deferred.resolve(entrance)
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getEntrance(id) {
      var deferred = $q.defer();
      getAllEntrance()
        .then(function(entrance) {
          var user = {};
          var filtered = entrance
            .filter(function(row) {
              return parseInt(row.id) === parseInt(id);
            });
          if (filtered > 0) {
            user = filtered[0];
          }
          deferred.resolve(entrance);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    this.all = getAllEntrance;
    this.get = getEntrance;
  });
