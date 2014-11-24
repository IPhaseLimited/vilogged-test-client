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
  .run(function($cookieStore, $rootScope, $state, $http, $location, $interval, loginService, growl, authorizationService) {

    $rootScope.pageTitle = 'Visitor Management System';
    $rootScope.pageHeader = 'Dashboard';

    function redirectToLogin() {
      loginService.logout();
      $location.path('/login');
    }


    $rootScope.$on('$stateChangeSuccess', function() {

      if (angular.isDefined($state.$current.self.data)) {
        $rootScope.pageTitle =
          angular.isDefined($state.$current.self.data.label) ? $state.$current.self.data.label : $rootScope.pageTitle;

        $rootScope.pageHeader = $state.$current.name === 'home' ? 'Dashboard' : $rootScope.pageTitle;
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
        var visitorsPages = authorizationService.allowedPages.visitors;
        if ($rootScope.user.is_vistor && visitorsPages.indexOf(page) === -1) {
          //flash.danger = 'Access Denied';
          $location.path('/visitors/'+$rootScope.user.id);
        }

        var staffPages = authorizationService.allowedPages.staff;
        if (($rootScope.user.is_staff && !$rootScope.user.is_superuser) &&  staffPages.indexOf(page) === -1) {
          growl.addErrorMessage('Access Denied');
          $location.path('/');
        }

        var activeUserPages = authorizationService.allowedPages.users;
        if ($rootScope.user.is_active && !$rootScope.user.is_staff && activeUserPages.indexOf(page) === -1) {
          $location.path('/profile');
        }
      }



    });
  })
  .config(function($httpProvider) {
    $httpProvider.interceptors.push([
      '$cookieStore', '$location', '$q',
      function($cookieStore, $location, $q) {
        return {
          'request': function(config) {
            if ($cookieStore.get('vi-token')) {
              $httpProvider.defaults.headers.common['Authorization'] = 'Token ' + $cookieStore.get('vi-token');
              if ($location.path() === '/login') {
                delete $httpProvider.defaults.headers.common['Authorization'];
              }
            }
            return config;
          },
          // Intercept 401s and redirect you to login
          responseError: function(response) {
            if (response.status === 401) {
              $location.path('/login');
              return $q.reject(response);
            }
            else {
              return $q.reject(response);
            }
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
