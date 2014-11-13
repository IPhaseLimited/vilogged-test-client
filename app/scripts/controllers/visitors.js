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
        templateUrl: 'views/visitors/index.html',
        controller: 'VisitorsCtrl'
      })
      .state('create-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/add',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('visitor-registration', {
        url: '/register',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('edit-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/:visitor_id/edit',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl'
      })
      .state('show-visitor', {
        parent: 'root.index',
        url: '/visitors/:visitor_id',
        templateUrl: 'views/visitors/detail.html',
        controller: 'VisitorDetailCtrl'
      })
  })
  .controller('VisitorsCtrl', function ($scope, visitorService, $interval) {
    $scope.visitors = [];
    var DELAY = 300; //30ms
    var busy = false;

    function getVisitors() {
      visitorService.all()
        .then(function (response) {
          busy = false;
          $scope.visitors = response;
          $scope.totalItems = $scope.visitors.length;
          $scope.numPages = Math.ceil($scope.totalItems/$scope.itemsPerPage);
        })
        .catch(function (reason) {
          busy = false;
          console.log(reason);
          console.log('some message')
        });
    }
    getVisitors();

    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 10;

    $scope.syncPromises['visitors'] = $interval(function() {
      if (!busy) {
        busy = true;
        visitorService.changes()
          .then(function(reponse) {
            if (reponse.update) {
              getVisitors();
            } else {
              busy = false;
            }
          })
          .catch(function(reason) {
            busy = false;
            console.log(reason);
          });
      }

    }, DELAY);
  })
  .controller('VisitorFormCtrl', function ($scope, $state, $stateParams, $rootScope, $window, visitorService, validationService,
                                           countryStateService, guestGroupConstant, userService, flash) {
    $scope.visitors = [];
    $scope.visitor = {};
    $scope.countryState = {};
    $scope.countries = [];
    $scope.states = [];
    $scope.lgas = [];
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
      var emailValidation = validationService.EMAIL;
      emailValidation.required = true;
      emailValidation.unique = true;
      emailValidation.dbName = visitorService.DBNAME;
      emailValidation.dataList = $scope.visitors;

      var phoneNumberValidation = validationService.BASIC;
      phoneNumberValidation.unique = true;
      phoneNumberValidation.dbName = visitorService.DBNAME;
      phoneNumberValidation.pattern = '/^[0-9]/';


      var visitor_location = {
        contact_address: validationService.BASIC,
        residential_country: validationService.BASIC,
        residential_lga: validationService.BASIC,
        residential_state: validationService.BASIC
      };


      var validationParams = {
        first_name: validationService.BASIC,
        last_name: validationService.BASIC,
        visitor_phone: phoneNumberValidation,
        visitor_email: emailValidation,
        visitor_location: visitor_location
      };

      if (!angular.isDefined($scope.visitor.visitor_pass_code)) {
        $scope.visitor.visitor_pass_code = new Date().getTime();
      }

      if (!angular.isDefined($scope.visitor.group_type) || $scope.visitor.group_type === '')
      {
        $scope.visitor.group_type = 'normal';
      }

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.visitor);
      if (!Object.keys($scope.validationErrors).length) {
        visitorService.save($scope.visitor)
          .then(function () {
            if (userService.user) {
              flash.success= $scope.visitor._id ? 'Visitor profile was successfully updated' : 'Visitor profile successfully created.';
              $state.go('visitors');
            } else {
              if (!angular.isDefined($scope.visitor._id)) {
                flash.success = 'Your profile was successfully created.';
                $state.go('login');
              } else {
                flash.success = 'Your profile was successfully updated.';
                $state.go('show-visitor', {visitor_id: $scope.visitor._id});
              }
            }
          })
          .catch(function (reason) {
            flash.error = 'An error occurred while saving visitor\'s profile';
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
  .controller('VisitorDetailCtrl', function ($scope, $stateParams, visitorService, appointmentService) {
    $scope.visitor = {};
    $scope.appointments = [];
    $scope.upcomingAppointments = [];
    $scope.appointmentsCurrentPage = 1;
    $scope.appointmentsPerPage = 10;
    $scope.maxSize = 5;

    visitorService.get($stateParams.visitor_id)
      .then(function (response) {
        $scope.visitor = response;
      })
      .catch(function (reason) {
        console.log(reason);
      });

    appointmentService.getVisitorUpcomingAppointments($stateParams.visitor_id)
      .then(function (response) {
        $scope.upcomingAppointments = response;
      })
      .catch(function (reason) {
        console.log(reason);
      });

    appointmentService.getAppointmentsByVisitor($stateParams.visitor_id)
      .then(function (response) {
        $scope.appointments = response;
        $scope.totalAppointments = $scope.appointments.length;
        $scope.appointmentNumPages =
          Math.ceil($scope.totalAppointments/$scope.appointmentsPerPage);
      })
      .catch(function (reason) {
        console.log(reason);
      });
  })
;
