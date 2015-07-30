'use strict';

angular.module('viLoggedClientApp', [
  'ui.bootstrap',
  'ui.router',
  'ui.select',
  'pouchdb',
  'nvd3ChartDirectives',
  'ngAnimate',
  'ngCookies',
  'db',
  'db.names',
  'config',
  'webcam',
  'ngResource',
  'ncy-angular-breadcrumb',
  'ngSanitize',
  'ngCsv',
  'toastr'
])
  .run(function() {})
  .config(function($httpProvider) {
    $httpProvider.interceptors.push([
      'sessionService', '$location', '$q', '$window',
      function($window, $location, $q, sessionService) {
        return {
          // Intercept 401s and redirect you to login
          responseError: function(response) {
            if (response.status === 401) {
              console.log('here');
              return sessionService.logout()
                .then(function () {
                  var currentUrl = $location.path();
                  var back = '/';
                  if (currentUrl !== '/login' && currentUrl !== '/logout') {
                    back = currentUrl;
                  }
                  $location.search('back', back);
                  $location.path('/login');
                  $window.reload();
                  return $q.reject(response);
                });
            }
            else {
              return $q.reject(response);
            }
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
  .config(function($breadcrumbProvider) {

    $breadcrumbProvider.setOptions({
      prefixStateName: 'home',
      template: 'bootstrap2'
    })
  })
  .config(function() {
    localforage.config({
      name        : 'viLogged',
      storeName   : 'viLogged'
    });
  });
