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
    'db',
    'db.names'
  ])
  .run(function($rootScope, $state, $stateParams, storageService) {
    $rootScope.pageTitle = 'CouchDB Console';
    $rootScope.$on('$stateChangeSuccess', function () {
      if(angular.isDefined($state.$current.self.data)){
        $rootScope.pageTitle =
          angular.isDefined($state.$current.self.data.label) ? $state.$current.self.data.label : $rootScope.pageTitle;
      }
    });
  })
  .config(function($compileProvider) {
    // to bypass Chrome app CSP for images.
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(chrome-extension):/);
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
