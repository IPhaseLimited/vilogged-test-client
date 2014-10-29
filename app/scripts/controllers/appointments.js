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
  })
  .controller('AppointmentCtrl', function ($scope, appointmentService) {
    appointmentService.getAllAppointments()
      .then(function (response) {
        console.log(response);
        $scope.appointments = response;
      })
      .catch(function (reason) {
        console.log(reason)
      })
  })
  .controller('AppointmentFormCtrl', function ($scope, $stateParams, $state, visitorService,
                                               userService, appointmentService) {
    $scope.appointment = {};
    $scope.default = {};

    if (angular.isDefined($stateParams.visitor_id)) {
      visitorService.get($stateParams.visitor_id)
        .then(function (response) {
          $scope.visitor = response;
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    if (angular.isDefined($stateParams.host_id)) {
      visitorService.get($stateParams.host_id)
        .then(function (response) {
          $scope.host = response;
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    $scope.convertDateStringToObject = function () {
      $scope.appointment.appointment_date = new Date($scope.appointment_date);
    };

    $scope.refreshHostsList = function () {
      userService.all()
        .then(function(response){
          $scope.hosts = response;
        })
        .catch(function(reason){
          console.log(reason);
        });
    };

    $scope.refreshVisitorsList = function () {
      visitorService.all()
        .then(function(response) {
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

      appointmentService.save($scope.appointment)
        .then(function (response) {
          $scope.appointment = angular.copy($scope.default);
          $state.go('appointments');
        })
        .catch(function (reason) {
          console.log(reason);
        });
    };
  });
