angular.module('viLoggedClientApp')
  .service('sessionService', function sessionService($q, $cookies) {
    this.logout = function () {
      var deferred = $q.defer();

      $cookies.remove('vi-token');
      $cookies.remove('no-login');
      $cookies.remove('current-user');
      $cookies.remove('vi-visitor');
      $cookies.remove('vi-anonymous-token');
      deferred.resolve(true);
      return deferred.promise;
    }
  });
