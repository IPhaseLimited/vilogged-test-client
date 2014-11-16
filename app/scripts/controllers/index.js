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
            templateUrl: 'views/index/header.html'
          },
          'breadcrumbs': {
            templateUrl: 'views/index/breadcrumbs.html'
          },
          'sidebar': {
            templateUrl: 'views/index/sidebar.html',
            controller: 'MenuCtrl'
          },
          'content': {},
          'footer': {
            templateUrl: 'views/index/footer.html'
          }
        }
      })
  })
  .controller('MenuCtrl', function($scope, userService) {
    $scope.currentUser = userService.user;
  });
