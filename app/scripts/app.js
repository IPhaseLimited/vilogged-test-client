'use strict';

angular.module('viLoggedClientApp', [
    'ui.bootstrap',
    'ui.router',
    'ui.select',
    'pouchdb',
    'config',
    'nvd3ChartDirectives',
    'angular-growl',
    'ngAnimate',
    'ngCookies',
    'db',
    'db.names',
    'MessageCenterModule'
  ])
  .run(function($cookieStore, $rootScope, $state, $http, $location, loginService, userService) {
    $rootScope.pageTitle = 'Visitor Management System';
    $rootScope.$on('$stateChangeSuccess', function () {
      if (angular.isDefined($location.search().disable_login) && $location.search().disable_login === 'true') {
        $cookieStore.put('no-login', 1);
      }

      if (angular.isDefined($location.search().disable_login) && $location.search().disable_login === 'false') {
        $cookieStore.put('no-login', 0);
      }

      var userLoginStatus =
        !$cookieStore.get('vi-token') && ($cookieStore.get('no-login') === 0 || $cookieStore.get('no-login') === undefined);
      if (userLoginStatus && !$cookieStore.get('vi-visitor-credential')) {
        $state.go('login');
      }

      if (angular.isDefined($state.$current.self.data)) {
        $rootScope.pageTitle =
          angular.isDefined($state.$current.self.data.label) ? $state.$current.self.data.label : $rootScope.pageTitle;
      }
      if (angular.isDefined(userService.user)) {
        $rootScope.user = userService.user;
      } else {
        $rootScope = $cookieStore.get('current-user');
      }
      if ($state.$current.name === 'login') {
        loginService.logout();
      }
    });
  })
  .config(function($httpProvider) {
    $httpProvider.interceptors.push([
      '$cookieStore',
      function($cookieStore) {
        return {
          'request': function(config) {
            if ($cookieStore.get('vi-token')) {
              $httpProvider.defaults.headers.common['Authorization'] = 'Token ' + $cookieStore.get('vi-token');
            }
            return config;
          }
        };
      }
    ]);
  })
  .config(function($compileProvider) {
    // to bypass Chrome app CSP for images.
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
  })
  .config(function(uiSelectConfig) {
      uiSelectConfig.theme = 'bootstrap';
    })
  .config(function(growlProvider) {
    growlProvider.globalTimeToLive({
      success: 5000,
      error: 5000,
      warning: 5000,
      info: 5000
    });
  });
