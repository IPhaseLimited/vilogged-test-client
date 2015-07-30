'use strict';

angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        templateUrl: 'views/index/index.html',
        controller: function(
          $cookies,
          $rootScope,
          $state,
          $http,
          $location,
          $interval,
          loginService,
          authorizationService,
          utility,
          alertService
        ) {

          function redirectToLogin() {
            if ($state.$current.name === 'settings') {
              return;
            }
            loginService.logout()
              .then(function () {
                $location.path('/login');
              });
          }

          if (angular.isUndefined($rootScope.user)) {
            var loggedInUser = $cookies.getObject('current-user');
            var loggedInVisitor = $cookies.getObject('vi-visitor');
            if (!utility.isEmptyObject(loggedInUser)) {
              $rootScope.user = loggedInUser;
            } else if (!utility.isEmptyObject(loggedInVisitor)) {
              $rootScope.user = loggedInVisitor;
            } else {
              redirectToLogin();
            }
          }

          $rootScope.getFileName = utility.getFileName;

          $rootScope.pageTitle = 'Visitor Management System';
          $rootScope.pageHeader = 'Dashboard';
          $rootScope.busy = false;

          $rootScope.$on('$stateChangeSuccess', function() {
            //utility.scrollToTop();

            if (angular.isDefined($state.$current.self.data)) {
              $rootScope.pageTitle =
                angular.isDefined($state.$current.self.data.label) ? $state.$current.self.data.label : $rootScope.pageTitle;

              $rootScope.pageHeader = $state.$current.name === 'home' ? 'Dashboard' : $rootScope.pageTitle;
            }

            if (angular.isDefined($rootScope.user)) {
              var page = $state.$current.name;
              var visitorsPages = authorizationService.allowedPages.visitors;

              if ($rootScope.user.is_vistor && visitorsPages.indexOf(page) === -1) {
                alertService.error('Access Denied');
                $location.path('/visitors/'+$rootScope.user._id);
              }

              var staffPages = authorizationService.allowedPages.staff;
              if (($rootScope.user.is_staff && !$rootScope.user.is_superuser) &&  staffPages.indexOf(page) === -1) {
                alertService.error('Access Denied');
                $location.path('/');
              }

              var activeUserPages = authorizationService.allowedPages.users;
              if ($rootScope.user.is_active && !$rootScope.user.is_staff && activeUserPages.indexOf(page) === -1) {
                $location.path('/profile');
              }
            }
          });
        }
      })
      .state('root.index', {
        abstract: true,
        views: {
          'header': {
            templateUrl: 'views/index/header.html',
            controller: function ($scope, $window, $rootScope, $location) {
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
