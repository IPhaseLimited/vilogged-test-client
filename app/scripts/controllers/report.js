'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('reports', {
        parent: 'root.index',
        url: '/reports',
        data: {
          label: 'Reports'
        },
        templateUrl: 'views/reports/index.html',
        controller: 'ReportCtrl'
      });
  })
  .controller('ReportCtrl', function ($scope, reportService) {

  });
