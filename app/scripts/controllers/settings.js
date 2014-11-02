'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('settings', {
        parent: 'root.index',
        url: '/settings',
        data: {
          label: 'System Settings'
        },
        templateUrl: 'views/settings/index.html',
        controller: 'SettingsCtrl'
      })
  })
  .controller('SettingsCtrl', function ($scope) {

  });
