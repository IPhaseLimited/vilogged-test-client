'use strict';

angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
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
            controller: function ($scope, $window, $rootScope) {
              $rootScope.$on('$stateChangeSuccess', function () {
                $scope.back = $location.path();
              });

              $scope.reload = function () {
                $window.location.reload();
              };
            }
          },
          'breadcrumbs': {
            templateUrl: 'views/index/breadcrumbs.html'
          },
          'sidebar': {
            templateUrl: 'views/index/sidebar.html'
          },
          'content': {},
          'footer': {
            templateUrl: 'views/index/footer.html'
          }
        }
      })
  })
;
