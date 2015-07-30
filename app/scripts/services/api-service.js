'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.apiService
 * @description
 * # apiService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('apiService', function apiService($http, apiFactory, $q, config, utility, $cookies) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';
    var TIMEOUT = 90000; //1.5 minutes
    var _this = this, httpConfig = {
      timeout: TIMEOUT,
      headers: {
        Authorization: ''
      }
    };

    this.put = function(db, data, options) {
      options = options || {};
      var deferred = $q.defer();
      var identifier = options.identifier || '_id';
      //return apiFactory.put({_db:db, _param: data.uuid}, data).$promise;
      httpConfig.headers.Authorization = ['Token', $cookies.getObject('vi-token')].join(' ');
      $http.put(BASE_URL + db + '/' + data[identifier], data, httpConfig)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    _this.post = function(db, data, options) {
      //return apiFactory.post({_db:db}, data).$promise;
      options = options || {};
      var deferred = $q.defer();
      var identifier = options.identifier || '_id';
      httpConfig.headers.Authorization = ['Token', $cookies.getObject('vi-token')].join(' ');
      $http.post(BASE_URL + db + '/', data, httpConfig)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    _this.allDocs = function(db, options) {
      options = options || {};
      var deferred = $q.defer();
      httpConfig.headers.Authorization = ['Token', $cookies.getObject('vi-token')].join(' ');
      $http.get([BASE_URL, db, '/', prepareUrlParams(options)].join(''), httpConfig)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    _this.get = function(db, id, options) {
      //return apiFactory.get({_db: db, _param: id}).$promise;
      options = options || {};
      var deferred = $q.defer();
      httpConfig.headers.Authorization = ['Token', $cookies.getObject('vi-token')].join(' ');
      $http.get([BASE_URL, db, '/', id, prepareUrlParams(options)].join(''), httpConfig)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    _this.remove = function(db, id, options) {
      //return apiFactory.remove({_db: db, _param: id}).$promise;
      var deferred = $q.defer();
      httpConfig.headers.Authorization = ['Token', $cookies.getObject('vi-token')].join(' ');
      $http.delete([BASE_URL, db, '/', id, prepareUrlParams(options)].join(''), httpConfig)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          if (reason === null) {
            deferred.reject('timeout');
          } else {
            deferred.reject(reason);
          }
        });

      return deferred.promise;
    };

    this.destroy = function(db) {
    };

    this.bulkDocs = function(db, docs) {

    };

    this.compact = function(db){

    };

    this.viewCleanup = function(db){

    };

    this.query = function(db, key, value){

    };

    function prepareUrlParams(options) {
      var urlParams = '';
      if (options.urlParams  && !utility.isEmptyObject(options.urlParams)) {
        var urlData = [];
        for (var key in options.urlParams) {
          if (options.urlParams.hasOwnProperty(key)) {
            urlData.push([key, options.urlParams[key].join('=')]);
          }
        }
        if (urlData.length > 0) {
          urlParams = ['?', urlData.join('&')].join('');
        }
      }

      return urlParams;
    }
  });
