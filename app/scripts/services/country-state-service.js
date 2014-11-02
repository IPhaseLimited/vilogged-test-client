'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.countryStateService
 * @description
 * # countryStateService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('countryStateService', function countryStateService($q, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    function getAllCountryStates() {
      var deferred = $q.defer();
      $http.get('scripts/fixtures/countries.json')
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    this.all = getAllCountryStates
  });
