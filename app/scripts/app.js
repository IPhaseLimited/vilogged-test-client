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
  'webcam',
  'ngResource',
  'ncy-angular-breadcrumb'
])
  .run(function($cookieStore, $rootScope, $state, $http, $location, $interval, loginService) {

    $rootScope.pageTitle = 'Visitor Management System';
    $rootScope.pageHeader = 'Dashboard';
    function redirectToLogin() {
      loginService.logout();
      $location.path('/login');
    }


    $rootScope.$on('$stateChangeSuccess', function() {

      /*if ($state.$current.name === 'visitor-registration') {
        loginService.anonymousLogin()
      }

      var userLoginStatus =
        !$cookieStore.get('vi-token') && ($cookieStore.get('no-login') === 0);

      if (userLoginStatus && !$cookieStore.get('vi-visitor') && !$cookieStore.get('vi-anonymous-token')) {
        $state.go('login');
      }

      if ($cookieStore.get('vi-anonymous-token') && $state.$current.name !== 'visitor-registration') {
        loginService.logout();
        $state.go('login');
      }*/



      if (angular.isDefined($state.$current.self.data)) {
        $rootScope.pageTitle =
          angular.isDefined($state.$current.self.data.label) ? $state.$current.self.data.label : $rootScope.pageTitle;

        $rootScope.pageHeader = $state.$current.name === 'home' ? 'Dashboard' : $rootScope.pageTitle;

        /*if ($state.current.data.requiredPermission !== undefined) {
          var authorized = authorizationService.authorize($state.current.data.requiredPermission);

          if (!authorized) {


            //$state.go('access-rejected');
          }
        }*/
      }

      if (angular.isUndefined($rootScope.user)) {
        if ($cookieStore.get('current-user')) {
          $rootScope.user = $cookieStore.get('current-user');
        } else if ($rootScope.user = $cookieStore.get('vi-visitor')) {
          $rootScope.user = $cookieStore.get('vi-visitor');
        } else {
          redirectToLogin();
        }
      }

      if ($state.$current.name === 'login') {
        redirectToLogin();
      }

      if (angular.isDefined($rootScope.user)) {
        var page = $state.$current.name;
        var visitorsPages = ['show-visitor', 'create-appointment-visitor'];
        if ($rootScope.user.is_vistor && visitorsPages.indexOf(page) === -1) {
          //flash.danger = 'Access Denied';
          $location.path('/visitors/'+$rootScope.user.id);
        }

        var staffPages = ['profile', 'editUser', 'change-password', 'visitors', 'create-visitor-profile', 'show-visitor', 'home'];
        if ($rootScope.user.is_staff && staffPages.indexOf(page) === -1) {
          $location.path('/');
        }

        var activeUserPages = ['profile', 'appointments', 'create-appointment-host'];
        if ($rootScope.user.is_active && activePages.indexOf(page) === -1) {
          $location.path('/profile');
        }
      }



    });
  })
  .config(function($httpProvider) {
    $httpProvider.interceptors.push([
      '$cookieStore', '$location',
      function($cookieStore, $location) {
        return {
          'request': function(config) {
            if ($cookieStore.get('vi-token') && $location.path() !== '/login') {
              $httpProvider.defaults.headers.common['Authorization'] = 'Token ' + $cookieStore.get('vi-token');
            }
            return config;
          }
        };
      }
    ]);
  })
  .config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(50000);
  }])
  .config(function($compileProvider) {
    // to bypass Chrome app CSP for images.
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
  })
  .config(function(uiSelectConfig) {
    uiSelectConfig.theme = 'bootstrap';
  })
  .config(function($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
      prefixStateName: 'home',
      template: 'bootstrap2'
    })
  });
