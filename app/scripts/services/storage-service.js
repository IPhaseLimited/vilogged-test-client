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
                                                     couchDbService, db, apiService, $cookies, localStorageService) {

    var driver = 'api';

    var drivers = {
      localDB: localStorageService,
      pouchDB: pouchStorageService,
      api: apiService,
      couchDB: couchDbService
    };

    var dataManagementService = drivers[driver];

    // AngularJS will instantiate a singleton by calling "new" on this function

    /**
     * Add new table data to the store.
     *
     * @param {string} table - Table name.
     * @param data - rows of the table (all values are stored as JSON.)
     * @param options
     * @return {promise|Function|promise|promise|promise|*}
     * @private
     */
    var setData = function(table, data, options) {
      options = options || {};
      var identifier = options.identifier || '_id';
      var deferred = $q.defer();
      if(!data.hasOwnProperty(identifier)){
        deferred.reject('data should have a uuid or primary key field.');
        return deferred.promise;
      }
      dataManagementService.put(table, data, options)
        .then(function(result) {
          deferred.resolve(result);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    var getData = function(key, options) {
      return dataManagementService.allDocs(key, options);
    };
    /**
     * This function removes a given record with the given uuid from the given
     * tableName and returns True if it was done successfully else rejects
     * with reason why removeData failed.
     *
     * @param tableName
     * @param id
     * @param options
     * @returns {promise|Function|promise|promise|promise|*}
     */
    var removeRecordFromTable = function(tableName, id, options){
      if (driver === 'api') {
        return dataManagementService.remove(tableName, id, options);
      }
      return dataManagementService.get(tableName, id, options)
        .then(function(doc) {
          return dataManagementService.remove(tableName, id, doc._rev, options);
        });
    };

    /**
     * Remove a table from the store.
     *
     * @param key - Table name.
     * @returns {*|boolean|Array|Promise|string}
     */
    var removeData = function(key, options) {
      return dataManagementService.destroy(key, options);
    };

    /**
     * Clear all data from the storage (will not work on API).
     *
     * @returns {*|boolean|!Promise|Promise}
     */
    var clearStorage = function() {
      var promises = [];
      for(var i in collections){
        if (collections.hasOwnProperty(i)) {
          var dbName  = collections[i];
          promises.push(dataManagementService.destroy(dbName));
        }
      }
      return $q.all(promises);
    };

    /**
     * Insert new database table row.
     *
     * @param table
     * @param data
     * @param options
     * @returns {Promise}
     */
    var insertData = function(table, data, options) {
      var currentUser = $cookies.getObject('current-user');
      options = options || {};
      var identifier = options.identifier || '_id';
      var DEFAULT_USER = {
        id: 1
      };

      if (angular.isUndefined(currentUser)) {
        currentUser = DEFAULT_USER;
      }

      if(data.hasOwnProperty('_id')){
        throw 'insert should only be called with fresh record that has not uuid or primary key field.';
      }
      if (identifier === '_id') {
        data[identifier] = utility.uuidGenerator();
      }

      data.created = data.modified = utility.getDateTime();
      data.created_by = currentUser._id;
      return setData(table, data, options);
    };

    /**
     * Update database table row.
     *
     * @param table
     * @param data
     * @param options
     * @param updateDateModified
     * @returns {Promise}
     */
    var updateData = function(table, data, options, updateDateModified) {
      options = options || {};
      var currentUser = $cookies.getObject('current-user');
      var identifier = options.identifier || '_id';
      var DEFAULT_USER = {
        _id: 1
      };

      if (angular.isUndefined(currentUser)) {
        currentUser = DEFAULT_USER;
      }
      if(!data.hasOwnProperty(identifier)){
        throw 'update should only be called with data that has UUID or primary key already.';
      }
      if(updateDateModified !== false){
        data.modified = utility.getDateTime();
        data.modified_by = currentUser._id;
      }

      if (driver === 'api') {
        return setData(table, data, options);
      }

      return dataManagementService.get(table, data[identifier], options)
        .then(function(doc) {
          data._rev = doc._rev;
          return setData(table, data, options);
        })
        .catch(function() {
          return setData(table, data, options);
        });
    };

    /**
     *  Encapsulates insert/update database table row operations.
     *
     * @param table
     * @param data
     * @param options
     * @returns {*}
     */
    var saveData = function(table, data, options) {
      options = options || {};
      var identifier = options.identifier || '_id';

      if ((typeof data === 'object') && (data !== null)) {
        if (Object.keys(data).indexOf(identifier) !== -1 && data[identifier].length > 0) {
          return updateData(table, data, options);
        } else {
          return insertData(table, data, options);
        }
      } else {
        var deferred = $q.defer();
        deferred.reject(data + ' is null or non-object data.');
        return deferred.promise;
      }

    };

    var getFromTableByKey = function(table, key, options) {
      //key = String(key);//force conversion to string
      //return pouchStorageService.get(table, key);
      return dataManagementService.get(table, key, options);
    };

    /**
     * this is basically just filter() but the idea is that there are probably ways to pass this
     * to the storage layer to get the filtering done in the db, so make it a separae fn and figure that out later
     */
    var getFromTableByLambda = function(tableName, options, fn) {
      var deferred = $q.defer();
      var results = [];
      try {
        getData(tableName, options)
          .then(function(data) {
            results = data.filter(fn);
            deferred.resolve(results);
          }).catch(function(reason) {
            deferred.reject(reason);
          });
      } catch (e) {
        deferred.reject(e);
      }

      return deferred.promise;
    };

    /**
     * This returns an array or collection of rows in the given table name,
     * this collection can not be indexed via key, to get table rows that can
     * be accessed via keys use all() or getData()
     */
    var getAllFromTable = function(tableName, options) {

      return getData(tableName, options)
        .then(function(data) {
          if (angular.isArray(data)) {
            return data;
          }
          var rows = [];
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              rows.push(data[key]);
            }
          }
          return rows;
        });
    };

    /**
     * this gets data from table by searching given field and comparing
     * data with provided value
     * @param tableName
     * @param field
     * @param value
     * @param options
     * @returns {promise}
     */

    var findByField = function(tableName, field, value, options) {
      var deferred = $q.defer();
      getAllFromTable(tableName, options)
        .then(function(response) {
          var filtered = [];

          for (var i = 0; i < response.length; i++) {
            var row = response[i];
            if (row[field] === value) {
              filtered.push(row);
            }
          }

           deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

        return deferred.promise;
    };

    var validateBatch = function(batch) {
      var currentUser = $cookies.getObject('current-user');

      var DEFAULT_USER = {
        _id: 1
      };

      if (angular.isUndefined(currentUser)) {
        currentUser = DEFAULT_USER;
      } else if (currentUser.is_vistor) {
        currentUser._id = 1;
      }
      var now = utility.getDateTime();
      if (!utility.has(batch, '_id')) {
        batch.uuid = utility.uuidGenerator();
        batch.created = now;
        batch.created_by = currentUser._id;
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
      return dataManagementService.bulkDocs(table, _batches);
    };

    var setDatabase = function(table, data, options) {
      return dataManagementService.bulkDocs(table, data, options);
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
      where: getFromTableByLambda,
      find: getFromTableByKey,
      insertBatch: insertBatch
    };

    return angular.extend(api, collections);
  });
