'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:ConfigurationCtrl
 * @description
 * # ConfigurationCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('settings', {
        'parent': 'root.index',
        'url': '/settings',
        'templateUrl': '/views/settings/setting.html',
        'controller': 'SettingFormCtrl',
        data: {
          label: 'Settings Page',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'Settings'
        }
      })
  })
  .controller('SettingFormCtrl', function ($scope, utility, $http, $rootScope) {
    $rootScope.busy = true;
    $scope.currentPage = 'server-setting';
    $scope.pageTile = utility.toTitleCase('Server Setting');
    $scope.currentPageTemplateUrl = '/views/settings/server-setting.html';

    $scope.settings = {
      serverSetting: {},
      databaseSetting: {},
      systemSetting: {},
      localSetting: {}
    };

    $scope.settings.localSetting = {
      backend: "http://localhost:8000",
      cron: "http://localhost:8088",
      remoteBackend: "http://ncc.vilogged.com:8088",
      backendCommon: "/api/v1",
      couchDB: "http://ncc.db.vilogged.com:5984",
      localDB: "http://localhost:5984"
    };

    console.log($scope.settings)

    $http.get('/api/save-settings')
      .success(function (response) {
        $rootScope.busy = false;
        $scope.settings = response;
      })
      .error(function (reason) {
        $rootScope.busy = false;
        console.log(reason);
      });

    $scope.save = function () {
      $http.post('/api/save-settings', $scope.settings)
        .success(function (response) {

        })
        .error(function (reason) {
          console.log(reason);
        });
    };

    $scope.setCurrentPage = function (page) {
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
        case 'local-setting':
          $scope.currentPage = 'local-setting';
          $scope.pageTile = utility.toTitleCase('local setting');
          $scope.currentPageTemplateUrl = '/views/settings/local-setting.html';
          break;
        default:
          $scope.currentPage = 'about';
          $scope.pageTile = utility.toTitleCase('about');
          $scope.currentPageTemplateUrl = '/views/settings/about.html';
          break;
      }
      $rootScope.busy = false;
    }
  });
