'use strict';

//TODO:: Work on model validations

angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('appointments', {
        parent: 'root.index',
        url: '/appointments',
        templateUrl: 'views/appointments/index.html',
        controller: 'AppointmentCtrl',
        data: {
          requiredPermission: 'is_active',
          label: 'Create Appointment'
        }
      })
      .state('show-appointment', {
        parent: 'root.index',
        url: '/appointments/:appointment_id',
        templateUrl: 'views/appointments/detail.html',
        controller: 'AppointmentDetailCtrl',
        data: {
          label: 'Appointment Detail'
        }
      })
      .state('create-appointment-visitor', {
        parent: 'root.index',
        url: '/appointments/add/:visitor_id',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          label: 'Create Appointment'
        }
      })
      .state('create-appointment-host', {
        parent: 'root.index',
        url: '/appointments/add/:host_id',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          requiredPermission: 'is_active',
          label: 'Create Appointment'
        }
      })
      .state('create-appointment', {
        parent: 'root.index',
        url: '/appointments/add/',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Create Appointment'
        }
      })
      .state('edit-appointment', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/edit/',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          requiredPermission: 'is_active',
          label: 'Edit Appointment'
        }
      })
      .state('visitor-check-in', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/check-in',
        templateUrl: 'views/appointments/check-in.html',
        controller: 'CheckInCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Check Visitor In'
        }
      })
      .state('print-visitor-label', {
        url: '/appointments/?appointment_id',
        templateUrl: 'views/appointments/visitor-pass.html',
        controller: 'VisitorPassCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Print Visitor Tag'
        }
      })
      .state('visitor-check-out', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/check-out',
        templateUrl: 'views/appointments/check-out.html',
        controller: 'CheckInCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Check Visitor Out'
        }
      })
  })
  .controller('AppointmentCtrl', function ($scope, appointmentService) {
    appointmentService.all()
      .then(function (response) {
        $scope.appointments = response;
      })
      .catch(function (reason) {
        console.log(reason);
      });
  })
  .controller('AppointmentDetailCtrl', function ($scope, $stateParams, appointmentService) {
    appointmentService.get($stateParams.appointment_id)
      .then(function (response) {
        $scope.appointment = response;
      })
      .catch(function (reason) {
        console.log(reason);
      });
  })
  .controller('AppointmentFormCtrl', function ($scope, $stateParams, $state, $timeout, visitorService,
                                               userService, appointmentService, utility, authorizationService) {
    $scope.appointment = {};
    $scope.default = {};
    $scope.host_number = '';
    $scope.some = '';

    $scope.lookupHost = function(hostNumber) {
      userService.findUserBy('phone', hostNumber)
        .then(function (response) {
          $scope.appointment.host = response;
        })
        .catch(function (reason) {
          console.log(reason);
        });
    };

    if ($stateParams.appointment_id !== null && $stateParams.appointment_id !== undefined) {
      appointmentService.get($stateParams.appointment_id)
        .then(function(response) {
          $scope.appointment = response;
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    if (angular.isDefined($stateParams.visitor_id)) {
      visitorService.get($stateParams.visitor_id)
        .then(function (response) {
          $scope.visitor = response;
        })
        .catch(function (reason) {
        });
    }

    if (angular.isDefined($stateParams.host_id)) {
      visitorService.get($stateParams.host_id)
        .then(function (response) {
          $scope.host = response;
        })
        .catch(function (reason) {
          console.log(reason);
        });
    }

    $scope.refreshHostsList = function () {
      userService.all()
        .then(function (response) {
          $scope.hosts = response;
        })
        .catch(function (reason) {
          console.log(reason);
        });
    };

    $scope.refreshVisitorsList = function () {
      visitorService.all()
        .then(function (response) {
          $scope.visitors = response;
        })
        .catch(function (reason) {
          console.log(reason);
        })
    };

    $scope.createAppointment = function () {
      var validationParams = {
        appointment_date: validationService.BASIC,
        appointment_visit_start_time: validationService.BASIC,
        appointment_visit_end_time: validationService.BASIC,
        purpose: validationService.BASIC
      };

      if (angular.isDefined($scope.visitor) && $scope.visitor !== null) {
        $scope.appointment.visitor = angular.copy($scope.visitor);
      }

      if (angular.isDefined($scope.host) && $scope.host !== null) {
        $scope.appointment.host = angular.copy($scope.host);
      }

      $scope.appointment.label_code = utility.generateRandomInteger();
      $scope.appointment.appointment_date = new Date($scope.appointment.appointment_date).toJSON();
      $scope.appointment.is_expired = false;
      $scope.appointment.check_in = null;
      $scope.appointment.check_out = null;

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.appointments);
      if (!Object.keys($scope.validationErrors).length) {
        appointmentService.save($scope.appointment)
          .then(function (response) {
            $scope.appointment = angular.copy($scope.default);
            //TODO:: implement notification service here
            $state.go('appointments');
          })
          .catch(function (reason) {
            console.log(reason);
          });
      }
    };
  })
  .controller('CheckInCtrl', function ($scope, $state, $stateParams, $q,
                                       visitorService, appointmentService, entranceService,
                                       vehicleTypeConstant, notificationService, utility, authorizationService) {
    if (!authorizationService.canCheckInOrCheckOutVisitor) {
      $state.go("appointments");
    }
    $scope.appointment = {};
    $scope.appointment.restricted_items = [{
      item_code: '',
      item_name: '',
      item_type: ''
    }];
    $scope.default = {};
    $scope.vehicleTypes = vehicleTypeConstant;

    entranceService.all()
      .then(function (response) {
        $scope.entrance = response;
      })
      .catch(function (reason) {
      });

    appointmentService.get($stateParams.appointment_id)
      .then(function (response) {
        $scope.appointment = response;
        if (angular.isUndefined($scope.appointment.restricted_items)) {
          $scope.appointment.restricted_items = [{
            item_code: '',
            item_name: '',
            item_type: ''
          }];
        }
      })
      .catch(function (reason) {
      });

    $scope.checkItemScope = function () {
      if ($scope.item === false) {
        $scope.appointment.restricted_items = [];
      }
    };

    $scope.addItem = function () {
      if (!angular.isDefined($scope.item)) {
        $scope.item = true;
        return;
      }

      if ($scope.item === false) {
        $scope.item = true;
      }

      $scope.appointment.restricted_items.push({
        item_code: '',
        item_name: '',
        item_type: ''
      });
    };

    $scope.removeItem = function (index) {
      $scope.appointment.restricted_items.splice(index, 1);

      if ($scope.appointment.restricted_items.length === 0) {
        $scope.item = false;
      }
    };

    $scope.checkVisitorIn = function () {
      $scope.appointment.checked_in = utility.getDateTime();
      $scope.appointment.label_code = utility.generateRandomInteger();
      appointmentService.save($scope.appointment)
        .then(function (response) {
          //TODO:: implement notification service
          $state.go('print-visitor-label', { appointment_id: $scope.appointment._id });
        })
        .catch(function (reason) {
        });
    };
  })
  .controller('VisitorPassCtrl', function($scope, $state, $stateParams, appointmentService) {
    $scope.appointment = {};
    console.log($stateParams.appointment_id);

    appointmentService.get($stateParams.appointment_id)
      .then(function (response) {
        $scope.appointment = response;
      })
      .catch(function (reason) {
        console.log(reason);
      })
  });
