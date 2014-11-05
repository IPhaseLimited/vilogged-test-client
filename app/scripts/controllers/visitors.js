'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:VisitorsCtrl
 * @description
 * # VisitorsCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('visitors', {
        parent: 'root.index',
        url: '/visitors',
        data: {
          label: 'Visitors List'
        },
        templateUrl: 'views/visitors/index.html',
        controller: 'VisitorsCtrl'
      })
      .state('create-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/add',
        data: {
          label: 'Add Visitor'
        },
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('edit-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/:visitor_id/edit',
        data: {
          label: 'Edit Visitor\'s record'
        },
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('show-visitor', {
        parent: 'root.index',
        url: '/visitors/:visitor_id',
        data: {
          label: 'Visitor\'s Detail'
        },
        templateUrl: 'views/visitors/detail.html',
        controller: 'VisitorDetailCtrl'
      })
  })
  .controller('VisitorsCtrl', function ($scope, visitorService) {
    $scope.visitors = [];

    visitorService.all()
      .then(function (response) {
        $scope.visitors = response;
      })
      .catch(function (reason) {

      });
  })
  .controller('VisitorFormCtrl', function ($scope, $state, $stateParams, visitorService, validationService, $window,
                                           countryStateService, guestGroupConstant) {
    $scope.visitors = [];
    $scope.visitor = {};
    $scope.countryState = {};
    $scope.countries = [];
    $scope.states = [];
    $scope.lgas = [];
    $scope.visitor.group_type = 'normal';
    $scope.visitorGroups = guestGroupConstant;

    countryStateService.all()
      .then(function(response) {
        $scope.countryState = response;
        $scope.countries = Object.keys(response);
      })
      .catch(function(reason) {
        console.log(reason);
      });

    $scope.setFiles = function(element, field) {
      $scope.$apply(function() {

        var fileToUpload = element.files[0];
        if (fileToUpload.type.match('image*')) {
          var reader = new $window.FileReader();
          reader.onload = function(theFile) {
            $scope.visitor[field] = theFile.target.result;
          };
          reader.readAsDataURL(fileToUpload);
        }

      });
    };

    visitorService.all()
      .then(function (response) {
        $scope.visitors = response;
      });
    $scope.visitor = {};
    $scope.vehicle = {};
    $scope.document = {};
    $scope.default = {};
    $scope.title = 'Create Visitor Profile';
    $scope.vehicleTypes = [
      {name: 'Car'},
      {name: 'Bus'},
      {name: 'Motor Cycle'},
      {name: 'Tri-Cycle'},
      {name: 'Lorry'}
    ];

    if ($stateParams.visitor_id !== null && $stateParams.visitor_id !== undefined) {
      visitorService.get($stateParams.visitor_id)
        .then(function (response) {
          $scope.visitor = response;

          $scope.title = 'Edit ' + $scope.visitor.firstName + '\'s Profile';
        })
        .catch(function (reason) {
          console.log(reason);
        });
    }

    $scope.createProfile = function () {
      //TODO:: Complete validations
      var emailValidation = validationService.EMAIL;
      emailValidation.required = true;
      emailValidation.unique = true;
      emailValidation.dbName = visitorService.DBNAME;
      emailValidation.dataList = $scope.visitors;
      var validationParams = {
        first_name: validationService.BASIC,
        last_name: validationService.BASIC,
        lga_of_origin: validationService.BASIC,
        state_of_origin: validationService.BASIC,
        nationality: validationService.BASIC,
        visitor_email: emailValidation
      };

      //TODO:: Work on a better generator for visitor's pass code possibly a service
      if (!angular.isDefined($scope.visitor.visitor_pass_code)) {
        $scope.visitor.visitor_pass_code = new Date().getTime();
      }

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.visitor);
      if (!Object.keys($scope.validationErrors).length) {
        visitorService.save($scope.visitor)
          .then(function () {
            $scope.visitor = angular.copy($scope.default);
            $state.go('visitors')
          })
          .catch(function (reason) {
            console.log(reason);
          });
      }

    };

    $scope.getStates = function(country) {
      $scope.visitor.state_of_origin = '';
      $scope.states = Object.keys($scope.countryState[country].states).sort();
    };

    $scope.getLGAs = function(state, country) {
      $scope.visitor.lga_of_origin = '';
      if ($scope.countryState[country].states[state]) {
        $scope.lgas = $scope.countryState[country].states[state].lga.sort();
      }
    };

    $scope.getResidentialStates = function(country) {
      $scope.visitor.visitor_location.residential_state = '';
      $scope.locationStates = Object.keys($scope.countryState[country].states).sort();
    };

    $scope.getResidentialLGAS = function(state, country) {
      $scope.visitor.visitor_location.residential_lga = '';
      if ($scope.countryState[country].states[state]) {
        $scope.lgas = $scope.countryState[country].states[state].lga.sort();
      }

      console.log($scope.lgas)
    };
  })
  .controller('VisitorDetailCtrl', function ($scope, $stateParams, visitorService) {
    $scope.visitor = {};

    visitorService.get($stateParams.visitor_id)
      .then(function (response) {
        console.log(response);
        $scope.visitor = response;
        $scope.title = $scope.visitor.firstName + ' ' + $scope.visitor.lastName + '\'s Detail';
      })
      .catch(function (reason) {
        console.log(reason);
      });
  })
;
