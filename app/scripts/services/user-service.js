angular.module('viLoggedClientApp')
  .service('userService', function userService($q, $cookies, storageService, cacheService) {
    var DB_NAME = 'user';

    var _this = this;

    _this.all = function(options) {
      return storageService.all(DB_NAME, options);
    };

    _this.get = function(id, options) {
      var deferred = $q.defer();
      storageService.find(DB_NAME, id, options)
        .then(function(response) {
          response = response || {};
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    _this.remove = function(id) {
      return storageService.removeRecord(DB_NAME, id)
    };

    _this.toggleUserAccountActive = function(user) {
      user.is_active = !user.is_active;
      return storageService.save(DB_NAME, user);
    };

    _this.save = function (dataObject) {
      return storageService.save(DB_NAME, dataObject);
    };

    this.user = $cookies.getObject('current-user');

    _this.getUserByName = function(value) {
      var deferred = $q.defer();
      var promises = [
        storageService.all(DB_NAME, {first_name: value}),
        storageService.all(DB_NAME, {last_name: value})
      ];
      $q.all(promises)
        .then(function(response) {
          var filtered = response[0].concat(response[1]);
          deferred.resolve(filtered[0] || {});
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    _this.getUserByPhone = function(value) {
      var deferred = $q.defer();
      var promises = [
        storageService.all(DB_NAME, {phone: value}),
        storageService.all(DB_NAME, {work_phone: value}),
        storageService.all(DB_NAME, {home_phone: value})
      ];
      $q.all(promises)
        .then(function(response) {
          var filtered = response[0].concat(response[1], response[2]);
          deferred.resolve(filtered[0] || {});
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    _this.getUserByNameOrPhone = function(value) {
      var deferred = $q.defer();

      var promises = [
        storageService.all(DB_NAME, {last_name: value}),
        storageService.all(DB_NAME, {first_name: value}),
        storageService.all(DB_NAME, {phone: value})
      ];

      $q.all(promises)
        .then(function(response) {
          var filtered = response[0].concat(response[1], response[2]);
          deferred.resolve(filtered[0] || {});
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

  });
