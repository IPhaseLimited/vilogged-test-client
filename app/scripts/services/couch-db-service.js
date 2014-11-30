'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.couchDbService
 * @description
 * # couchDbService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('couchDbService', function couchDbService(pouchdb, utility, couchDbFactory) {
  // AngularJS will instantiate a singleton by calling "new" on this function

    this.put = function(db, data) {
      return couchDbFactory.put({_db:db, _action: data.uuid}, data).$promise;
      //return db.put(data, data.uuid);
    };

    this.allDocs = function(db) {
      return couchDbFactory.allDocs({
        // jshint camelcase: false
        _db: db,
        include_docs: true
      }).$promise
        .then(function(result) {
          return utility.pluck(result.rows, 'doc');
        });
    };

    this.get = function(db, id) {
      return couchDbFactory.get({_db: db, _action: id}).$promise;
    };

    this.remove = function(db, id, rev) {
      return couchDbFactory.remove({_db: db, _action: id, rev: rev}).$promise;
    };

    this.destroy = function(db) {
      return couchDbFactory.deleteDB({_db: db}).$promise
        .then(function() {
          return couchDbFactory.createDB({_db: db});
        });
    };

    this.bulkDocs = function(db, docs) {
      return couchDbFactory.bulkDocs({_db: db}, {docs: docs}).$promise;
    };

    this.compact = function(db){
      return couchDbFactory.compact({_db: db, _action: '_compact'}).$promise;
    };

    this.viewCleanup = function(db){
      db = pouchdb.create(db);
      return db.viewCleanup();
    };

    this.query = function(db, key, value){
      db = pouchdb.create(db);
      //TODO: fix to use query i.e map reduce. currently map throw error on pouchdb.
      return db.allDocs({include_docs: true})
        .then(function(res){
          return res.rows
            .map(function(r){
              if(r.doc[key] === value && r.doc){
                return r.doc;
              }
            });
        });
    };
  });
