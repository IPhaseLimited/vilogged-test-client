'use strict';

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
        url: '/appointments/add/:id',
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
        $scope.appointments = response;
      })
      .catch(function (reason) {
        console.log(reason)
      })
  })
  .controller('AppointmentFormCtrl', function ($scope, $stateParams, $state,
                                               $timeout, visitorService, userService, appointmentService) {
    $scope.appointment = {};

    if (angular.isDefined($stateParams.id)) {
      visitorService.get($stateParams.id)
        .then(function (response) {
          $scope.appointment.visitor = response;
        })
        .catch(function(reason) {
          console.log(reason);
        });
    }

    $scope.host = {};
    $scope.refreshHostsList = function () {
      userService.getAllUsers()
        .then(function(response){
          $scope.hosts = response;
        })
        .catch(function(reason){
          console.log(reason);
        });
    };

    $scope.createAppointment = function () {
      console.log($scope.appointment);
//      appointmentService.save($scope.visitor)
//        .then(function (response) {
//          $scope.appointment = angular.copy($scope.default);
//          $state.go('appointments');
//        })
//        .catch(function (reason) {
//          console.log(reason);
//        });
    };
  });
