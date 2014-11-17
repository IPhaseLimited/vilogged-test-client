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
  .controller('AppointmentCtrl', function ($scope, appointmentService, utility) {
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 10;

    $scope.isAppointmentUpcoming = function (appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() < appointmentTimeStamp;
    };

    $scope.isAppointmentExpired = function (appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() > appointmentTimeStamp;
    };

    appointmentService.all()
      .then(function (response) {
        $scope.appointments = response;
        $scope.totalItems = $scope.appointments.length;
        $scope.numPages = Math.ceil($scope.totalItems/$scope.itemsPerPage);
      })
      .catch(function (reason) {
        console.log(reason);
      });
  })
  .controller('AppointmentDetailCtrl', function ($scope, $stateParams, appointmentService, utility) {
    appointmentService.getNested($stateParams.appointment_id)
      .then(function (response) {
        $scope.appointment = response;
      })
      .catch(function (reason) {
        console.log(reason);
      });


    $scope.isAppointmentUpcoming = function (appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() < appointmentTimeStamp;
    };

    $scope.isAppointmentExpired = function (appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() > appointmentTimeStamp;
    };
  })
  .controller('AppointmentFormCtrl', function ($scope, $stateParams, $state, $timeout, $filter, visitorService,
                                               userService, appointmentService, utility, validationService) {
    $scope.appointment = {};
    $scope.visit_start_time = new Date();
    $scope.visit_end_time = new Date();
    $scope.appointment_host = {};
    $scope.appointment_visitor = {};

    $scope.appointmentDate = {
      opened: false,
      open: function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.opened = true
      }
    };

    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.getHost = function(hostPhone) {
      if (timeout) timeout.cancel();
      var timeout = $timeout(userService.getUserByPhone(hostPhone)
        .then(function(response) {
          $scope.appointment_host.selected = response[0];
          console.log(response[0]);
        })
        .catch(function(reason) {
          console.log(reason);
        }), 1000);
    };

    $scope.hostLookUp = {
      refreshHostsList: function (phone) {
        userService.getUserByPhone(phone)
          .then(function (response) {
            $scope.hosts = response;
          })
          .catch(function (reason) {
            console.log(reason);
          });
      },
      listHosts: function() {
        userService.all()
          .then(function(response) {
            $scope.hosts = response;
          })
          .catch(function (reason) {
            console.log(reason);
          })
      }
    };

    $scope.visitorLookUp = {
      refreshVisitorsList: function(visitorPhone) {
        visitorService.findByPhone(visitorPhone)
          .then(function (response) {
            $scope.visitors = response;
          })
          .catch(function (reason) {
            console.log(reason);
          })
      },
      listVisitors: function () {
        visitorService.all()
          .then(function (response) {
            $scope.visitors = response;
          })
          .catch(function (reason) {
            console.log(reason);
          })
      }
    };

    if (angular.isDefined($scope.user)) {
      if (!$scope.user.is_staff && $scope.user.is_active) $scope.appointment_host = $scope.user;

      if ($scope.user.is_staff) $scope.hostLookUp.listHosts();

      if ($scope.user.is_active) $scope.visitorLookUp.listVisitors();
    }

    $scope.createAppointment = function () {
      $scope.appointment.label_code = utility.generateRandomInteger();
      $scope.appointment.appointment_date =$filter('date')($scope.appointment.appointment_date, 'yyyy-MM-dd');
      $scope.appointment.is_expired = false;
      $scope.appointment.check_in = null;
      $scope.appointment.check_out = null;

      $scope.appointment.visit_start_time = $filter('date')($scope.visit_start_time, 'hh:mm a');
      $scope.appointment.visit_end_time = $filter('date')($scope.visit_end_time, 'hh:mm a');

      $scope.appointment.host_id = $scope.appointment_host.selected.id;
      $scope.appointment.visitor_id = $scope.appointment_visitor.selected.uuid;

      var validationParams = {
        appointment_date: validationService.BASIC,
        visit_start_time: validationService.BASIC,
        visit_end_time: validationService.BASIC,
        purpose: validationService.BASIC,
        host_id: validationService.BASIC,
        visitor_id: validationService.BASIC
      };

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.appointment);
      if (!Object.keys($scope.validationErrors).length) {
        appointmentService.save($scope.appointment)
          .then(function (response) {
            //TODO:: implement notification service here
            $state.go('appointments');
          })
          .catch(function (reason) {
            Object.keys(reason).forEach(function(key) {
              $scope.validationErrors[key] = reason[key];
            });
            console.log(reason);
          });
      }
    };
  })
  .controller('CheckInCtrl', function ($scope, $state, $stateParams, $q,
                                       visitorService, appointmentService, entranceService,
                                       vehicleTypeConstant, notificationService, utility, authorizationService) {
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

    appointmentService.getNested($stateParams.appointment_id)
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
      $scope.appointment.check_in = utility.getDateTime();
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
