'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.couchDbFactory
 * @description
 * # couchDbFactory
 * Factory in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .factory('couchDbFactory', function($resource, config) {

    return $resource(config.api.localDB +'/'+ ':_db/:_action/:_param/:_sub/:_sub_param',
      {
        _db: '@_db'
      },
      {
        allDocs: {
          method: 'GET',
          withCredentials: true,
          params: {
            _action: '_all_docs',
            include_docs: true
          }
        },
        bulkDocs: {
          method: 'POST',
          withCredentials: true,
          params: {
            _action: '_bulk_docs'
          }
        },
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
        compact: {
          method: 'POST',
          withCredentials: true,
          params: {
            _action: '_compact'
          }
        },
        view: {
          method: 'GET',
          withCredentials: true,
          params: {
            _action: '_design',
            _sub: '_view'
          }
        },
        mapReduce: {
          method: 'POST',
          withCredentials: true,
          params: {
            _action: '_temp_view'
          }
        },
        createDB: {
          method: 'PUT',
          withCredentials: true
        },
        deleteDB: {
          method: 'DELETE',
          withCredentials: true
        },
        session: {
          method: 'GET',
          withCredentials: true,
          params: {
            _db: '_session'
          }
        },
        login: {
          method: 'POST',
          withCredentials: true,
          params: {
            _db: '_session'
          }
        },
        logout: {
          method: 'DELETE',
          withCredentials: true,
          params: {
            _db: '_session'
          }
        }
      });
  });
