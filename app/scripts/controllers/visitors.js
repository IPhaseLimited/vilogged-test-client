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
        controller: 'VisitorsCtrl',
        data: {
          label: 'Visitors',
          requiredPermission: 'is_active'
        }
      })
      .state('create-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/add',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl',
        resolve: {
          countryState: function(countryStateService) {
            return countryStateService.all();
          }
        },
        data: {
          label: '',
          requiredPermission: 'is_active'
        }
      })
      .state('visitor-registration', {
        url: '/register',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl',
        resolve: {
          countryState: function(countryStateService) {
            return countryStateService.all();
          }
        },
        data: {
          label: '',
          requiredPermission: 'is_active'
        }
      })
      .state('edit-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/:visitor_id/edit',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl',
        resolve: {
          countryState: function(countryStateService) {
            return countryStateService.all();
          }
        },
        data: {
          label: '',
          requiredPermission: 'is_active'
        }
      })
      .state('show-visitor', {
        parent: 'root.index',
        url: '/visitors/:visitor_id',
        templateUrl: 'views/visitors/detail.html',
        controller: 'VisitorDetailCtrl',
        data: {
          label: '',
          requiredPermission: 'is_active'
        }
      })
  })
  .controller('VisitorsCtrl', function ($scope, visitorService, visitorsLocationService) {
    $scope.visitors = [];
        function getVisitors() {
      visitorService.all()
        .then(function (response) {
          $scope.visitors = response;
          $scope.totalItems = $scope.visitors.length;
          $scope.numPages = Math.ceil($scope.totalItems/$scope.itemsPerPage);
        })
        .catch(function (reason) {
          console.log(reason);
        });
    }
    getVisitors();

    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 10;
  })
  .controller('VisitorFormCtrl', function ($scope, $state, $stateParams, $rootScope, $window, visitorService,
                                           validationService, countryStateService, guestGroupConstant, userService,
                                           flash, countryState, visitorsLocationService) {
    $scope.visitors = [];
    $scope.visitor = {};
    $scope.visitorsLocation = {};
    $scope.countryState = {};
    $scope.countries = [];
    $scope.states = [];
    $scope.lgas = [];
    $scope.visitorGroups = guestGroupConstant;
    $scope.countryState = countryState;
    $scope.countries = Object.keys(countryState);

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
    $scope.visitor_location = {};
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

          if ($scope.visitor.nationality) {
            $scope.states = Object.keys($scope.countryState[$scope.visitor.nationality].states).sort();
          }

          if ($scope.visitor.state_of_origin) {
            if ($scope.countryState[$scope.visitor.nationality].states[$scope.visitor.state_of_origin]) {
              $scope.lgas = $scope.countryState[$scope.visitor.nationality].states[$scope.visitor.state_of_origin].lga.sort();
            }
          }
          visitorsLocationService.findByField('visitor_id', response.uuid)
            .then(function(response) {
              if (response.length) {
                $scope.visitorsLocation = response[0];

                $scope.locationStates = Object.keys($scope.countryState[$scope.visitorsLocation.residential_country].states).sort();
                if ($scope.countryState[$scope.visitorsLocation.residential_country].states[$scope.visitorsLocation.residential_state]) {
                  $scope.locationLgas = $scope.countryState[$scope.visitorsLocation.residential_country].states[$scope.visitorsLocation.residential_state].lga.sort();
                }
              }

            })
            .catch(function(reason) {
              console.log(reason);
            });
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

      var validationParams = {
        first_name: validationService.BASIC,
        last_name: validationService.BASIC,
        visitors_phone: phoneNumberValidation,
        visitors_email: emailValidation
      };

      var validationParams2 = {
        contact_address: validationService.BASIC,
        residential_country: validationService.BASIC,
        residential_lga: validationService.BASIC,
        residential_state: validationService.BASIC
      };

      var validateLocation = validationService.validateFields(validationParams2, $scope.visitorsLocation);

      if (!angular.isDefined($scope.visitor.visitors_pass_code)) {
        $scope.visitor.visitors_pass_code = new Date().getTime();
      }

      if (!angular.isDefined($scope.visitor.group_type) || $scope.visitor.group_type === '')
      {
        $scope.visitor.group_type = 'normal';
      }

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.visitor);
      (Object.keys(validateLocation)).forEach(function(key) {
        $scope.validationErrors[key] = validateLocation[key];
      });
      if (!Object.keys($scope.validationErrors).length) {
        visitorService.save($scope.visitor)
          .then(function (response) {
            $scope.visitor = response;

            function afterRegistration() {

              if (userService.user) {

                flash.success= $scope.visitor.uuid ? 'Visitor profile was successfully updated' : 'Visitor profile successfully created.';
                $state.go('visitors');
              } else {

                if (!angular.isDefined($scope.visitor.uuid)) {
                  flash.success = 'Your profile was successfully created.';
                  $state.go('login');
                } else {
                  flash.success = 'Your profile was successfully updated.';
                  $state.go('show-visitor', {visitor_id: $scope.visitor.uuid});
                }

              }
            }

            $scope.visitorsLocation.visitor_id = response.uuid;
            visitorsLocationService.save($scope.visitorsLocation)
              .then(function() {
                afterRegistration();
              })
              .catch(function(reason) {
                Object.keys(reason).forEach(function(key) {
                  $scope.validationErrors[key] = reason[key];
                });
                //afterRegistration();
              });
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
      $scope.visitorsLocation.residential_state = '';
      $scope.locationStates = Object.keys($scope.countryState[country].states).sort();
    };

    $scope.getResidentialLGAS = function(state, country) {
      $scope.visitorsLocation.residential_lga = '';
      if ($scope.countryState[country].states[state]) {
        $scope.locationLgas = $scope.countryState[country].states[state].lga.sort();
      }
    };
  })
  .controller('VisitorDetailCtrl', function ($scope, $stateParams, visitorService, appointmentService, visitorsLocationService) {
    $scope.visitor = {};
    $scope.visitorsLocation = {};
    $scope.appointments = [];
    $scope.upcomingAppointments = [];
    $scope.appointmentsCurrentPage = 1;
    $scope.appointmentsPerPage = 10;
    $scope.maxSize = 5;

    visitorService.get($stateParams.visitor_id)
      .then(function (response) {
        $scope.visitor = response;
      if (response.uuid) {
        visitorsLocationService.findByField('visitor_id', response.uuid)
          .then(function(response) {
            if (response.length) {
              $scope.visitorsLocation = response[0];
            }
          })
          .catch(function(reason) {
            console.log(reason);
          });
      }

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
