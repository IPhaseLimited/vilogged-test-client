'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:ConfigurationCtrl
 * @description
 * # ConfigurationCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('settings', {
        'parent': 'root.index',
        'url': '/settings',
        'templateUrl': '/views/settings/setting.html',
        'controller': 'SettingFormCtrl',
        data: {
          label: 'Settings Page',
          requiredPermission: 'is_superuser'
        }
      })
  })
  .controller('SettingFormCtrl', function ($scope, utility) {
    $scope.currentPage = 'server-setting';
    $scope.pageTile = utility.toTitleCase('Server Setting');
    $scope.currentPageTemplateUrl = '/views/settings/server-setting.html';

    $scope.settings = {
      serverSetting: {},
      databaseSetting: {},
      systemSetting: {}
    };

    $scope.setCurrentPage = function(page) {
      switch (page) {
        case 'server-setting':
              $scope.currentPage = 'server-setting';
              $scope.currentPageTemplateUrl = '/views/settings/server-setting.html';
              break;
        case 'database-setting':
              $scope.currentPage = 'database-setting';
              $scope.pageTile = utility.toTitleCase('database setting');
              $scope.currentPageTemplateUrl = '/views/settings/database-setting.html';
              break;
        case 'system-setting':
              $scope.currentPage = 'system-setting';
              $scope.pageTile = utility.toTitleCase('system setting');
              $scope.currentPageTemplateUrl = '/views/settings/system-setting.html';
              break;
        default:
              $scope.currentPage = 'server-setting';
              $scope.pageTile = utility.toTitleCase('server setting');
              $scope.currentPageTemplateUrl = '/views/settings/server-setting.html';
              break;
      }
    }
  });
