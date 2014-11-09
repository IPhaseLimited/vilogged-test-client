'use strict';

angular.module('viLoggedClientApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('home', {
      parent: 'root.index',
      url: '/',
      templateUrl: 'views/home/index.html',
      controller: function($state, $scope, $window) {
        $scope.fileToUpload = {};
        $scope.form = {};

        $scope.setFiles = function(element) {
          $scope.$apply(function(scope) {

            var fileToUpload = element.files[0];
            if (fileToUpload.type.match('image*')) {
              var reader = new $window.FileReader();
              reader.onload = function(theFile) {
                $scope.form.binImage = theFile.target.result;
                console.log(theFile.target.result);
              };
              reader.readAsDataURL(fileToUpload);
            }

          });
        };

        $scope.checkUpload = function() {
          console.log($scope.form);
        };

        if ($window.File && $window.FileReader && $window.FileList && $window.Blob) {

        } else {
          $scope.scopeData = 'nop';
        }
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
  });