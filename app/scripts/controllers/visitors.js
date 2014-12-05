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
        },
        ncyBreadcrumb: {
          label: 'Visitors'
        }
      })
      .state('create-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/add',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl',
        resolve: {
          countryState: function (countryStateService) {
            return countryStateService.all();
          }
        },
        data: {
          label: 'Create Visitor',
          requiredPermission: 'is_active'
        },
        ncyBreadcrumb: {
          label: 'Create Visitor Profile',
          parent: 'visitors'
        }
      })
      .state('visitor-registration', {
        url: '/register',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl',
        resolve: {
          countryState: function (countryStateService) {
            return countryStateService.all();
          }
        },
        data: {
          label: 'Register'
        }
      })
      .state('edit-visitor-profile', {
        parent: 'root.index',
        url: '/visitors/:visitor_id/edit',
        templateUrl: 'views/visitors/widget-form.html',
        controller: 'VisitorFormCtrl',
        resolve: {
          countryState: function (countryStateService) {
            return countryStateService.all();
          }
        },
        data: {
          label: 'Edit Profile',
          requiredPermission: 'is_active'
        },
        ncyBreadcrumb: {
          label: 'Edit Visitor\'s Profile',
          parent: 'visitors'
        }
      })
      .state('show-visitor', {
        parent: 'root.index',
        url: '/visitors/:visitor_id',
        templateUrl: 'views/visitors/detail.html',
        controller: 'VisitorDetailCtrl',
        data: {
          label: 'Details',
          requiredPermission: 'is_active'
        },
        ncyBreadcrumb: {
          label: 'Visitor\'s Detail',
          parent: 'visitors'
        }
      });
  })
  .controller('VisitorsCtrl', function ($scope, visitorService, $rootScope, guestGroupConstant, alertService, $filter) {
    $scope.visitors = [];
    $scope.search = {};
    var rows = [];

    var exports = [];

    $scope.csvHeader = [
      'Visitor\'s Name',
      'Email',
      'Phone',
      'Company Name',
      'Group Type',
      'Created Date'
    ];

    $scope.createdDate = {
      opened: false,
      date: moment().endOf('day').toDate(),
      open: function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.opened = true;
      }
    };

    function getVisitors() {
      $rootScope.busy = true;
      visitorService.all()
        .then(function (response) {
          $rootScope.busy = false;
          rows = response;
          $scope.pagination.totalItems = rows.length;
          $scope.pagination.numPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);
          updateTableData();
        })
        .catch(function (reason) {
          $rootScope.busy = false;

        });
    }

    getVisitors();
    $scope.$watch('search', function () {
      updateTableData();
    }, true);

    $scope.orderByColumn = {
      created: {
        reverse: true
      }

    };

    $scope.sort = function(column) {
      if ($scope.orderByColumn[column]) {
        $scope.orderByColumn[column].reverse = !$scope.orderByColumn[column].reverse;
      } else {
        $scope.orderByColumn = {};
        $scope.orderByColumn[column]= {reverse: true};
      }
      $scope.visitors = $filter('orderBy')($scope.visitors, column, $scope.orderByColumn[column].reverse);
    };

    function updateTableData() {
      $scope.visitors = rows.filter(function (row) {
        var date = moment(row.created);
        var include = true;

        if (include && $scope.search.name) {
          include = row.first_name.toLowerCase().indexOf($scope.search.name.toLowerCase()) > -1 ||
          row.last_name.toLowerCase().indexOf($scope.search.name.toLowerCase()) > -1;
        }

        if (include && $scope.search.visitors_email) {
          include = row.visitors_email.toLowerCase().indexOf($scope.search.visitors_email.toLowerCase()) > -1;
        }

        if (include && $scope.search.visitors_phone) {
          include = row.visitors_phone.toLowerCase().indexOf($scope.search.visitors_phone.toLowerCase()) > -1;
        }

        if (include && $scope.search.company_name) {
          include = row.company_name.toLowerCase().indexOf($scope.search.company_name.toLowerCase()) > -1;
        }

        if (include && $scope.search.group_type && row.group_type) {
          include = guestGroupConstant[row.group_type].toLowerCase().indexOf($scope.search.company_name.toLowerCase()) > -1;
        }

        if (include && $scope.search.created) {
          include = include && (date.isSame($scope.search.created, 'day'));
        }


        return include;
      });

      $scope.visitors.forEach(function (row) {
        exports.push({
          name: row.first_name + ' ' + row.last_name,
          email: row.email,
          phone: row.phone,
          company_name: row.company_name,
          group_type: row.group_type,
          created_date: row.created
        });
      });
      $scope.export = exports;
    }

    $scope.pagination = {
      currentPage: 1,
      maxSize: 5,
      itemsPerPage: 10
    };

    $scope.getGroupType = function (index) {
      return guestGroupConstant[index];
    }
  })
  .controller('VisitorFormCtrl', function ($scope, $state, $stateParams, $rootScope, $window, $filter, visitorService,
                                           validationService, countryStateService, guestGroupConstant, userService,
                                           countryState, visitorGroupsService,visitorsLocationService, notificationService, utility, alertService) {
    $scope.visitors = [];
    $scope.visitor = {};
    $scope.visitorsLocation = {};
    $scope.countryState = {};
    $scope.countries = [];
    $scope.states = [];
    $scope.lgas = [];
    $scope.countryState = countryState;
    $scope.countries = Object.keys(countryState);
    $scope.validationErrors = {};
    $scope.activateImageUploader = false;
    $scope.activateCamera = false;
    $scope.imageCapture = false;

    $rootScope.busy = true;
    visitorGroupsService.all()
      .then(function(response) {
        $scope.visitorGroups = response;
        $rootScope.busy = false;
      })
      .catch(function(reason) {
        $rootScope.busy = false;
      });

    $scope.dob = {
      opened: false,
      open: function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.opened = true;
      }
    };

    $scope.activateImageCapturing = function () {
      $scope.imageCapture = true;
      $scope.activateCamera = true;
      $scope.btnText = 'Activate Image Uploader';
    };

    $scope.activateImageCapture = function () {
      if ($scope.activateCamera) {
        $scope.activateImageUploader = true;
        $scope.activateCamera = false;
        $scope.btnText = 'Activate Camera';
      } else {
        $scope.activateImageUploader = false;
        $scope.activateCamera = true;
        $scope.btnText = 'Activate Image Uploader';
      }
    };

    $scope.validateBirthDate = function (dateString) {
      var checkAge = [];
      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 14) {
        var minYear = today.getFullYear() - 14;
        checkAge.push('Birth year can\'t be less than year ' + minYear);
      }

      if (age <= 0) {
        checkAge.push('Date of birth can\'t be in the future or present');
      }

      if (checkAge.length) {
        $scope.validationErrors['date_of_birth'] = checkAge;
      } else {
        delete $scope.validationErrors['date_of_birth'];
      }
    };

    $scope.setFiles = function (element, field) {
      $scope.$apply(function () {

        var fileToUpload = element.files[0];
        if (fileToUpload.type.match('image*')) {
          var reader = new $window.FileReader();
          reader.onload = function (theFile) {
            $scope.visitor[field] = theFile.target.result;
          };
          reader.readAsDataURL(fileToUpload);
        }

      });
    };

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
      $rootScope.busy = true;
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
            .then(function (response) {
              if (response.length) {
                $scope.visitorsLocation = response[0];

                $scope.locationStates = Object.keys($scope.countryState[$scope.visitorsLocation.residential_country].states).sort();
                if ($scope.countryState[$scope.visitorsLocation.residential_country].states[$scope.visitorsLocation.residential_state]) {
                  $scope.locationLgas = $scope.countryState[$scope.visitorsLocation.residential_country].states[$scope.visitorsLocation.residential_state].lga.sort();
                }
              }
              $rootScope.busy = false;
            })
            .catch(function (reason) {
              $rootScope.busy = false;

            });
          $scope.title = 'Edit ' + $scope.visitor.firstName + '\'s Profile';
        })
        .catch(function (reason) {
          notificationService.setTimeOutNotification(reason);
          $rootScope.busy = false;
        });
    }

    $scope.saveProfile = function () {

      /**
       * sends email and sms to new visitor account
       */
      function sendNotification() {
        var visitor = {
          first_name: $scope.visitor.first_name,
          last_name: $scope.visitor.last_name,
          phone: $scope.visitor.visitors_phone,
          pass_code: $scope.visitor.visitors_pass_code
        };

        var emailTemplate = visitorService.EMAIL_TEMPLATE;
        var compiledEmailTemplate = utility.compileTemplate(visitor, emailTemplate);


        var smsTemplate = visitorService.SMS_TEMPLATE;
        var compiledSMSTemplate = utility.compileTemplate(visitor, smsTemplate, '&&');


        if (angular.isDefined($scope.visitor.visitors_phone) && $scope.visitor.visitors_phone !== '') {
          notificationService.send.sms({
            message: compiledSMSTemplate,
            mobiles: $scope.visitor.visitors_phone
          });
        }

        if (angular.isDefined($scope.visitor.visitors_email) && $scope.visitor.visitors_email !== '') {
          notificationService.send.email({
            to: $scope.visitor.visitors_email,
            subject: 'Visitor\'s account created.',
            message: compiledEmailTemplate
          });
        }
      }

      $rootScope.busy = true;
      var emailValidation = validationService.EMAIL;
      var phoneNumberValidation = validationService.BASIC;
      phoneNumberValidation.pattern = '/^[0-9]/';

      var validationParams = {
        first_name: validationService.BASIC,
        last_name: validationService.BASIC,
        gender: validationService.BASIC,
        visitors_phone: phoneNumberValidation,
        visitors_email: emailValidation
        //group_type_id: validationService.BASIC
      };

      var validationParams2 = {
        contact_address: validationService.BASIC
        //residential_country: validationService.BASIC,
        //residential_lga: validationService.BASIC,
        //residential_state: validationService.BASIC
      };

      var validateLocation = validationService.validateFields(validationParams2, $scope.visitorsLocation);

      if (!angular.isDefined($scope.visitor.visitors_pass_code)) {
        $scope.visitor.visitors_pass_code = new Date().getTime();
      }

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.visitor);
      (Object.keys(validateLocation)).forEach(function (key) {
        $scope.validationErrors[key] = validateLocation[key];
      });
      if (!Object.keys($scope.validationErrors).length) {
        if (!angular.isDefined($scope.visitor.company_name)) {
          $scope.visitor.company_name = 'Anonymous';
        }

        $scope.visitor.image = $scope.takenImg;
        if ($scope.visitor.date_of_birth) {
          $scope.visitor.date_of_birth = $filter('date')($scope.visitor.date_of_birth, 'yyyy-MM-dd');
        }

        $scope.visitor.group_type = $scope.visitor.group_type_id;
        if (!angular.isDefined($scope.visitorsLocation.residential_country)) {
          $scope.visitorsLocation.residential_country = 'Other';
          $scope.visitorsLocation.residential_state = 'Not set';
          $scope.visitorsLocation.residential_lga = 'Not Set';
        }

        visitorService.save($scope.visitor)
          .then(function (response) {
            $scope.visitor = response;

            function afterRegistration() {

              if ($scope.user.is_staff) {
                alertService.success('Visitor profile was saved successfully.');
                $state.go('visitors');
              } else {
                alertService.success('Your profile was saved successfully.');
                $state.go('show-visitor', {visitor_id: $scope.visitor.uuid});
              }
              sendNotification();
            }

            $scope.visitorsLocation.visitor_id = response.uuid;
            visitorsLocationService.save($scope.visitorsLocation)
              .then(function () {
                $rootScope.busy = false;
                afterRegistration();
              })
              .catch(function (reason) {
                Object.keys(reason).forEach(function (key) {
                  $scope.validationErrors[key] = reason[key];
                  $rootScope.busy = false;
                });
                notificationService.setTimeOutNotification(reason);
                //afterRegistration();
              });
          })
          .catch(function (reason) {
            notificationService.setTimeOutNotification(reason);
            $rootScope.busy = false;
          });
      }

    };

    $scope.getStates = function (country) {
      $scope.visitor.state_of_origin = '';
      $scope.states = Object.keys($scope.countryState[country].states).sort();
    };

    $scope.getLGAs = function (state, country) {
      $scope.visitor.lga_of_origin = '';
      if ($scope.countryState[country].states[state]) {
        $scope.lgas = $scope.countryState[country].states[state].lga.sort();
      }
    };

    $scope.getResidentialStates = function (country) {
      $scope.visitorsLocation.residential_state = '';
      $scope.locationStates = Object.keys($scope.countryState[country].states).sort();
    };

    $scope.getResidentialLGAS = function (state, country) {
      $scope.visitorsLocation.residential_lga = '';
      if ($scope.countryState[country].states[state]) {
        $scope.locationLgas = $scope.countryState[country].states[state].lga.sort();
      }
    };
  })
  .controller('VisitorDetailCtrl', function ($scope, $stateParams, visitorService, appointmentService,
                                             visitorsLocationService, $rootScope, notificationService) {
    $scope.visitor = {};
    $scope.visitorsLocation = {};
    $scope.appointments = [];
    $scope.upcomingAppointments = [];
    $scope.pagination = {
      appointmentsCurrentPage: 1,
      appointmentsPerPage: 10,
      maxSize: 5
    };
    $rootScope.busy = true;
    $scope.visitorLoaded = false;
    $scope.appointmentLoaded = false;

    visitorService.get($stateParams.visitor_id)
      .then(function (response) {
        $scope.visitor = response;
        if (response.uuid) {
          visitorsLocationService.findByField('visitor_id', response.uuid)
            .then(function (response) {
              if (response.length) {
                $scope.visitorsLocation = response[0];
              }
              $scope.visitorLoaded = true;
              if ($scope.appointmentLoaded) {
                $rootScope.busy = false;
              }
            })
            .catch(function (reason) {
              $scope.visitorLoaded = true;
              if ($scope.appointmentLoaded) {
                $rootScope.busy = false;
              }
              notificationService.setTimeOutNotification(reason);
            });
        }

      })
      .catch(function (reason) {
        notificationService.setTimeOutNotification(reason);

      });

    var appointments = appointmentService.getNestedAppointmentsByVisitor($stateParams.visitor_id);

    appointments
      .then(function () {
        $scope.appointmentLoaded = true;
        if ($scope.appointmentLoaded) {
          $rootScope.busy = false;
        }
      })
      .catch(function (reason) {
        notificationService.setTimeOutNotification(reason);
        $scope.appointmentLoaded = true;
        if ($scope.visitorLoaded) {
          $rootScope.busy = false;
        }
      });

    appointments
      .then(function (response) {
        $scope.upcomingAppointments = response
          .filter(function (appointment) {
            return appointment.is_approved &&
              new Date(appointment.appointment_date).getTime() > new Date().getTime() && !appointment.is_expired;
          });
      })
      .catch(function (reason) {
        notificationService.setTimeOutNotification(reason);
      });

    appointments
      .then(function (response) {
        $scope.appointments = response;
        $scope.pagination.totalAppointments = $scope.appointments.length;
        $scope.pagination.appointmentNumPages =
          Math.ceil($scope.pagination.totalAppointments / $scope.pagination.appointmentsPerPage);
      })
      .catch(function (reason) {
        notificationService.setTimeOutNotification(reason);
      });
  })
;
