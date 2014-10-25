'use strict';

angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        templateUrl: 'views/index/index.html'
      })
      .state('root.index', {
        abstract: true,
        views: {
          'header': {
            templateUrl: 'views/index/header.html',
            controller: function($scope, $state) {

            }
          },
          'breadcrumbs': {
            templateUrl: 'views/index/breadcrumbs.html',
            controller: function($scope, $state) {

            }
          },
          'sidebar': {
            templateUrl: 'views/index/sidebar.html',
            controller: function($scope, $state) {

            }
          },
          'content': {},
          'footer': {
            templateUrl: 'views/index/footer.html',
            controller: function($scope, $window) {

            }
          }
        }
      })
  });
