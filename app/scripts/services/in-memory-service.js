'use strict';

angular.module('viLoggedClientApp')
  .service('inMemoryService', function inMemoryService($q, cacheService, $http) {
    var getAllFromServer = function (dbName, apiUrl) {
      var deferred = $q.defer();
      var cache = cacheService.cache(dbName);

      $http.get(apiUrl)
        .success(function (response) {
          cache.put(dbName, response);
          deferred.resolve(response);
        })
        .error(function (reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    function getMultipleFromServer(objectList) {
      objectList = objectList || [];
      var promises = [];
      var deferred = $q.defer();

      objectList.forEach(function(row) {
        promises.push(getAllFromServer(row.dbName, row.apiUrl));
      });

      $q.all(promises)
        .finally(function() {
          deferred.resolve(true);
        });
      return deferred.promise();
    }

    function getMultipleFromServerSync(objectList, count) {
      objectList = objectList || [];
      count = count || 0;

      if (count <= (objectList.length - 1)) {
        var apiUrl = objectList[count].apiUrl;
        var dbName = objectList[count].dbName;
        getAllFromServer(dbName, apiUrl)
          .then(function() {
            getMultipleFromServerSync(objectList, count + 1);
          })
          .catch(function(reason) {
            console.log(reason);
            getMultipleFromServerSync(objectList, count + 1);
          });
      }
    }

  });
