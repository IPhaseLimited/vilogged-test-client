'use strict';

angular.module('viLoggedClientApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('home', {
      parent: 'root.index',
      url: '/',
      templateUrl: 'views/home/index.html',
      controller: 'MainCtrl',
      ncyBreadcrumb: {
        label: 'Home'
      }
    })
      .state('home.index', {
        abstract: true,
        views: {
          'nav': {
            templateUrl: 'views/home/nav.html',
            controller: function($scope, $state) {
              $scope.$state = $state;
            }
          },
          'sidebar': {
            templateUrl: 'views/home/sidebar.html'
          }
        }
      })
  })
  .controller('MainCtrl', function ($scope, appointmentService) {

  });
