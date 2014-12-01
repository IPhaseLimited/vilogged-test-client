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
      .state('app-config', {
        url: '/app-config',
        templateUrl: '/views/settings/config.html',
        controller: 'ConfigCtrl',
        data: {
          label: 'App Configuration'
        }
      });
  })
  .controller('ConfigCtrl', function($scope, $rootScope, settingsService, $http, $q, alertService, config) {
    $scope.settings = {
      localSetting: {
        backend: config.api.backend,
        localBrowserPort: config.api.localBrowserPort,
        remoteBackend: config.api.remoteBackend,
        backendCommon: config.api.backendCommon,
        couchDB: config.api.couchDB,
        localDB: config.api.localDB
      }
    };

    $scope.save = function() {
      $rootScope.busy = false;
      $scope.validationErrors = {};
      var promises = [
        settingsService.testUrl($scope.settings.localSetting.backend),
        settingsService.testUrl($scope.settings.localSetting.remoteBackend),
        settingsService.testUrl($scope.settings.localSetting.couchDB),
        settingsService.testUrl($scope.settings.localSetting.localDB)
      ];
      $q.all(promises)
        .then(function(response) {
          var messages = [];

          if (parseInt(response[1].status) === 0) {
            messages.push('remote settings is wrong, you won\'t be able to access online server');
            $scope.validationErrors['couchDB'] = ['remote settings is wrong, you won\'t be able to access online server'];
          }
          if (parseInt(response[2].status) === 0) {
            messages.push('remote settings is wrong, you won\'t be able to access online couch db server ');
            $scope.validationErrors['remoteBackend'] = ['remote settings is wrong, you won\'t be able to access ' +
            'online couch db server '];
          }
          if (parseInt(response[3].status) === 0) {
            messages.push('remote settings is wrong, you won\'t be able to access local couch db server ');
            $scope.validationErrors['localDB'] = ['remote settings is wrong, you won\'t be able to access' +
            ' local couch db server '];
          }

          if (parseInt(response[0].status) !== 0) {
            if (messages.length) {
              alertService.error(messages.join('\n'));
            }
            $http.post('http://localhost:8088/api/app-config', $scope.settings)
              .success(function(response) {
                console.log(response);
              })
              .error(function(reason) {
                console.log(reason);
              });
          } else {
            $scope.validationErrors['backend'] = ['Server not responding, please check url and make sure server ' +
            'is running'];
          }
          $rootScope.busy = false;
        })
        .catch(function(reason) {
          $rootScope.busy = false;
        });

    }

  })
  .controller('SettingFormCtrl', function ($scope, utility, $http, $rootScope) {
    $rootScope.busy = true;
    $scope.currentPage = 'server-setting';
    $scope.pageTile = utility.toTitleCase('Server Setting');
    $scope.currentPageTemplateUrl = '/views/settings/server-setting.html';

    $scope.settings = {
      serverSetting: {},
      databaseSetting: {},
      systemSetting: {}
    };


    $http.get('http://localhost:8088/api/settings')
      .success(function (response) {
        $rootScope.busy = false;
        $scope.settings = response;
      })
      .error(function () {
        $rootScope.busy = false;

      });

    $scope.save = function () {
      $http.post('http://localhost:8088/api/settings', $scope.settings)
        .success(function (response) {

        })
        .error(function (reason) {

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
        default:
          $scope.currentPage = 'about';
          $scope.pageTile = utility.toTitleCase('about');
          $scope.currentPageTemplateUrl = '/views/settings/about.html';
          break;
      }
      $rootScope.busy = false;
    }
  });
