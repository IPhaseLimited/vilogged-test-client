'use strict';

//TODO:: Work on model validations

angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('appointments', {
        parent: 'root.index',
        url: '/appointments',
        templateUrl: 'views/appointments/index.html',
        controller: 'AppointmentCtrl'
      })
      .state('create-appointment-visitor', {
        parent: 'root.index',
        url: '/appointments/add/:visitor_id',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl'
      })
      .state('create-appointment-host', {
        parent: 'root.index',
        url: '/appointments/add/:host_id',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl'
      })
      .state('create-appointment', {
        parent: 'root.index',
        url: '/appointments/add/',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl'
      })
      .state('visitor-check-in', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/check-in',
        templateUrl: 'views/appointments/check-in.html',
        controller: 'CheckInCtrl'
      })
  })
  .controller('AppointmentCtrl', function ($scope, appointmentService) {
    appointmentService.all()
      .then(function (response) {
        console.log(response);
        $scope.appointments = response;
      })
      .catch(function (reason) {
        console.log(reason)
      });
  })
  .controller('AppointmentFormCtrl', function ($scope, $stateParams, $state, visitorService,
                                               userService, appointmentService, utility) {
    $scope.appointment = {};
    $scope.default = {};

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

    $scope.convertDateStringToObject = function () {
      $scope.appointment.appointment_date = new Date($scope.appointment_date).toJSON();
    };

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
      if (angular.isDefined($scope.visitor) && $scope.visitor !== null) {
        $scope.appointment.visitor = angular.copy($scope.visitor);
      }

      if (angular.isDefined($scope.host) && $scope.host !== null) {
        $scope.appointment.host = angular.copy($scope.host);
      }

      $scope.appointment.label_code = utility.generateRandomInteger();

      appointmentService.save($scope.appointment)
        .then(function (response) {
          $scope.appointment = angular.copy($scope.default);
          $state.go('appointments');
        })
        .catch(function (reason) {
          console.log(reason);
        });
    };
  })
  .controller('CheckInCtrl', function ($scope, $state, $stateParams, $q,
                                       visitorService, appointmentService, entranceService,
                                       vehicleTypeConstant, notificationService, utility) {
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
        $scope.appointment = response;console.log($scope.appointment)
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

    $scope.checkItemScope = function() {
      if ($scope.item === false) {
        $scope.appointment.restricted_items = [];
      }
    };

    $scope.addItem = function() {
      if (!angular.isDefined($scope.item)) {
        $scope.item = true;
        return;
      }

      if ($scope.item ===  false) {
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
      appointmentService.save($scope.appointment)
        .then(function (response) {
          $scope.appointment = angular.copy($scope.default);
          $state.go('appointments');
        })
        .catch(function (reason) {
        });
    };
});
