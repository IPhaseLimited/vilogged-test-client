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
  .controller('SettingFormCtrl', function ($scope, utility, $http, $rootScope, notificationService, settingsService, $q,
                                           config, alertService) {
    //$rootScope.busy = true;
    $scope.appConfig = {
      backend: config.api.backend,
      localBrowserPort: config.api.localBrowserPort,
      remoteBackend: config.api.remoteBackend,
      backendCommon: config.api.backendCommon,
      couchDB: config.api.couchDB,
      localDB: config.api.localDB
    };

    $scope.ldapSettings = {};
    $scope.databaseSetting = {};
    $scope.smsSetting = {};
    $scope.emailSetting = {};
    $scope.systemSetting = {};
    $scope.validationErrors = {};

    $scope.currentPage = 'emailSetting';
    $scope.pages = {
      appConfig: {
        urlName: 'app-config',
        pageTitle: 'App Configuration'
      },
      databaseSetting: {
        urlName: 'database-settings',
        pageTitle: 'Database Configuration'
      },
      ldapSettings: {
        urlName: 'ldap-settings',
        pageTitle: 'Database Configuration'
      },
      emailSetting: {
        urlName: 'email-settings',
        pageTitle: 'Email Configuration'
      },
      smsSetting: {
        urlName: 'sms-settings',
        pageTitle: 'SMS Configuration'
      },
      systemSetting: {
        urlName: 'system-settings',
        pageTitle: 'System Configuration'
      }
    };

    getFromRemote('ldapSettings');
    getFromRemote('databaseSetting');
    getFromRemote('emailSetting');
    getFromRemote('smsSetting');
    //getFromRemote('systemSetting');

    $scope.save = function() {
      if ($scope.currentPage === 'appConfig') {
        saveAppConfig();
      } else {
        saveSettings();
      }
    };


    function saveAppConfig() {
      $rootScope.busy = false;
      var promises = [
        settingsService.testUrl($scope.appConfig.backend),
        settingsService.testUrl($scope.appConfig.remoteBackend),
        settingsService.testUrl($scope.appConfig.couchDB),
        settingsService.testUrl($scope.appConfig.localDB)
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
            $http.post(notificationService.BASE_URL+':8088/api/app-config', $scope.appConfig)
              .success(function() {
                alertService.success('Setting Saved successfully');
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

    function getFromRemote(key) {
      $http.get(notificationService.BASE_URL+':8088/api/'+$scope.pages[key].urlName)
        .success(function(response) {
          $scope[key] = response;
        })
        .error(function(reason) {
          notificationService.setTimeOutNotification(reason);
        });
    }

    function saveSettings() {
      $scope.validationErrors = {};
      $http.post(notificationService.BASE_URL+':8088/api/'+$scope.pages[$scope.currentPage].urlName,
        $scope[$scope.currentPage])
        .success(function() {
          alertService.success('settings saved successfully');
        })
        .error(function(reason) {
          notificationService.setTimeOutNotification(reason);
        });
    }

  });
