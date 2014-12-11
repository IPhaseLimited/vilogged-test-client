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
        parent: 'root.index',
        url: '/app-config',
        templateUrl: '/views/settings/config.html',
        controller: 'ConfigCtrl',
        data: {
          label: 'App Configuration'
        },
        ncyBreadcrumb: {
          label: 'App Configuration',
          parent: 'settings'
        }
      })
      .state('ldap-config', {
        url: '/ldap-config',
        parent: 'root.index',
        templateUrl: '/views/settings/active-directory.html',
        controller: 'ActiveDirectoryConfigCtrl',
        data: {
          label: 'Active Directory Configuration'
        },
        ncyBreadcrumb: {
          label: 'Active Directory Configuration',
          parent: 'settings'
        }
      });
  })
  .controller('ActiveDirectoryConfigCtrl', function($scope, $rootScope, settingsService, $http, $q, alertService,
                                                    notificationService, userService) {


    $scope.ldapSettings = {};
    $scope.showPassword = false;

    $scope.save = function() {
      $rootScope.busy = false;
      $scope.validationErrors = {};
      $http.post(notificationService.BASE_URL+':8088/api/ldap-config', $scope.ldapSettings)
        .success(function(response) {
          userService.getLDAPUsers()
            .then(function(response) {
              alertService.messageToTop.success('Users from LDAP server has successfully been imported.');
              getUsers();
              $rootScope.busy = false;
            })
            .catch(function(reason) {
              notificationService.setTimeOutNotification(reason);
              $rootScope.busy = false;
            });
          alertService.success('settings saved successfully');
        })
        .error(function(reason) {
          notificationService.setTimeOutNotification(reason);
        });

    }



  })
  .controller('ConfigCtrl', function($scope, $rootScope, settingsService, $http, $q, alertService, config, $state, notificationService) {
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
            $http.post(notificationService.BASE_URL+':8088/api/app-config', $scope.settings)
              .success(function(response) {
                $state.go('home');
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
  .controller('SettingFormCtrl', function ($scope, utility, $http, $rootScope, notificationService) {
    $rootScope.busy = true;
    $scope.currentPage = 'server-setting';
    $scope.pageTile = utility.toTitleCase('Server Setting');
    $scope.currentPageTemplateUrl = '/views/settings/server-setting.html';

    $scope.settings = {
      serverSetting: {},
      databaseSetting: {},
      systemSetting: {}
    };


    $http.get(notificationService.BASE_URL+':8088/api/settings')
      .success(function (response) {
        $rootScope.busy = false;
        $scope.settings = response;
      })
      .error(function () {
        $rootScope.busy = false;

      });

    $scope.save = function () {
      $http.post(notificationService.BASE_URL+':8088/api/settings', $scope.settings)
        .success(function (response) {

        })
        .error(function (reason) {
          notificationService.setTimeOutNotification(reason);
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
