'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.apiFactory
 * @description
 * # apiFactory
 * Factory in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .factory('apiFactory', function($resource, $rootScope, config) {
    if ($rootScope.config) {
      config = $rootScope.config
    }
    return $resource(config.api.backend + config.api.backendCommon+ '/:_db/:_param/:_param2/:_param3',
      {
        _db: '@_db'
      },
      {
        put: {
          method: 'PUT',
          withCredentials: true
        },
        get: {
          method: 'GET',
          withCredentials: true
        },
        remove: {
          method: 'DELETE',
          withCredentials: true
        },
        post: {
          method: 'POST',
          withCredentials: true
        }
      });
  });
