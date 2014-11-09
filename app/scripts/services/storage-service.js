'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.storageService
 * @description
 * # storageService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('storageService', function storageService($q, $window, utility, collections, pouchStorageService,
                                                     couchDbService, db) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    /**
     * Add new table data to the store.
     *
     * @param {string} table - Table name.
     * @param {mixed} data - rows of the table (all values are stored as JSON.)
     * @return {promise|Function|promise|promise|promise|*}
     * @private
     */
    var setData = function (table, data) {
      if(!data.hasOwnProperty('uuid')){
        throw 'data should have a uuid or primary key field.';
      }
      return couchDbService.put(table, data)
        .then(function(result) {
          return result.id;
        });
    };

    var getData = function(key) {
      return couchDbService.allDocs(key);
      //return pouchStorageService.allDocs(key);
    };
    /**
     * This function removes a given record with the given uuid from the given
     * tableName and returns True if it was done successfully else rejects
     * with reason why removeData failed.
     *
     * @param tableName
     * @param uuid
     * @returns {promise|Function|promise|promise|promise|*}
     */
    var removeRecordFromTable = function(tableName, uuid){
      return couchDbService.get(tableName, uuid)
        .then(function(doc) {
          return couchDbService.remove(tableName, uuid, doc._rev);
        });
    };

    /**
     * Remove a table from the store.
     *
     * @param key - Table name.
     * @returns {*|boolean|Array|Promise|string}
     */
    var removeData = function(key) {
      return pouchStorageService.destroy(key);
    };

    /**
     * Clear all data from the storage (will not work on API).
     *
     * @returns {*|boolean|!Promise|Promise}
     */
    var clearStorage = function() {
      var promises = [];
      for(var i in collections){
        var dbName  = collections[i];
        promises.push(pouchStorageService.destroy(dbName));
      }
      return $q.all(promises);
    };

    /**
     * Insert new database table row.
     *
     * @param table
     * @param data
     * @returns {Promise}
     */
    var insertData = function(table, data) {
      if(data.hasOwnProperty('uuid')){
        throw 'insert should only be called with fresh record that has not uuid or primary key field.';
      }
      data.uuid = utility.uuidGenerator();
      data.created = data.modified = utility.getDateTime();
      return setData(table, data);
    };

    /**
     * Update database table row.
     *
     * @param table
     * @param data
     * @returns {Promise}
     */
    var updateData = function(table, data, updateDateModified) {
      if(!data.hasOwnProperty('uuid')){
        throw 'update should only be called with data that has UUID or primary key already.';
      }
      if(updateDateModified !== false){
        data.modified = utility.getDateTime();
      }

      return couchDbService.get(table, data.uuid)
        .then(function(doc) {
          data._rev = doc._rev;
          return setData(table, data);
        })
        .catch(function() {
          return setData(table, data);
        });
    };

    /**
     *  Encapsulates insert/update database table row operations.
     *
     * @param table
     * @param data
     * @returns {*}
     */
    var saveData = function(table, data) {

      if ((typeof data === 'object') && (data !== null)) {
        if (Object.keys(data).indexOf('uuid') !== -1 && data.uuid.length > 0) {
          return updateData(table, data);
        } else {
          return insertData(table, data);
        }
      } else {
        var deferred = $q.defer();
        deferred.reject(data + ' is null or non-object data.');
        return deferred.promise;
      }

    };

    var getFromTableByKey = function(table, key) {
      //key = String(key);//force conversion to string
      //return pouchStorageService.get(table, key);
      return couchDbService.get(table, key);
    };

    /**
     * this is basically just filter() but the idea is that there are probably ways to pass this
     * to the storage layer to get the filtering done in the db, so make it a separae fn and figure that out later
     */
    var getFromTableByLambda = function (tableName, fn) {
      var deferred = $q.defer();
      var results = [];
      try {
        getData(tableName)
          .then(function (data) {
            results = data.filter(fn);
            deferred.resolve(results);
          }).catch(function (reason) {
            deferred.reject(reason);
          });
      } catch (e) {
        deferred.reject(e);
      } finally {
        return deferred.promise;
      }
    };

    /**
     * This returns an array or collection of rows in the given table name,
     * this collection can not be indexed via key, to get table rows that can
     * be accessed via keys use all() or getData()
     */
    var getAllFromTable = function (tableName) {
      var deferred = $q.defer();
      getData(tableName)
        .then(function (data) {
          var rows = [];
          for (var key in data) {
            rows.push(data[key]);
          }
          deferred.resolve(rows);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    /**
     * this gets data from table by searching given field and comparing
     * data with provided value
     * @param tableName
     * @param field
     * @param value
     * @returns {promise}
     */

    var findByField = function(tableName, field, value) {

      var deferred = $q.defer();
      getAllFromTable(tableName)
        .then(function(response) {

          var filtered = response
           .filter(function(row) {
              return String(row[field]) === value;
           });

           deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

        return deferred.promise;
    };

    var validateBatch = function(batch) {
      var now = utility.getDateTime();
      if (!utility.has(batch, 'uuid')) {
        batch.uuid = utility.uuidGenerator();
        batch.created = now;
      }
      batch.modified = now;
      return batch;
    };

    var insertBatch = function(table, batches) {
      if (!angular.isArray(batches)) {
        throw 'batches is not an array';
      }

      var _batches = [];
      for (var i = batches.length - 1; i >= 0; i--) {
        _batches.push(validateBatch(batches[i]));
      }
      return couchDbService.bulkDocs(table, _batches);
      //return pouchStorageService.bulkDocs(table, _batches);
    };

    var setDatabase = function(table, data) {
      return couchDbService.bulkDocs(table, data);
      //return pouchStorageService.bulkDocs(table, data);
    };

    var compactDatabases = function() {
      var promises = [];
      var dbNames = Object.keys(db);
      dbNames.forEach(function(key) {
        promises.push(couchDbService.compact(db[key]));
      });
      return $q.all(promises);
    };

    var viewCleanups = function() {
      var promises = [];
      for (var i in collections) {
        var dbName = collections[i];
        promises.push(pouchStorageService.viewCleanup(dbName));
      }
      return $q.all(promises);
    };

    var api = {
      all: getAllFromTable,
      findByField: findByField,
      add: setData,
      get: getData,
      removeRecord: removeRecordFromTable,
      remove: removeData,
      clear: clearStorage,
      uuid: utility.uuidGenerator,
      insert: insertData,
      update: updateData,
      save: saveData,
      setDatabase: setDatabase,
      compactDatabases: compactDatabases,
      viewCleanups: viewCleanups,
      where: getFromTableByLambda,
      find: getFromTableByKey,
      insertBatch: insertBatch
    };

    return angular.extend(api, collections);
  });
