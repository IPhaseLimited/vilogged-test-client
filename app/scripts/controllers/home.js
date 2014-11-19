'use strict';

angular.module('viLoggedClientApp')
  .config(function ($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('home', {
      parent: 'root.index',
      url: '/',
      templateUrl: 'views/home/index.html',
      controller: 'MainCtrl',
      ncyBreadcrumb: {
        label: 'Home'
      }
    })
      .state('home.index', {
        abstract: true,
        views: {
          'nav': {
            templateUrl: 'views/home/nav.html',
            controller: function ($scope, $state) {
              $scope.$state = $state;
            }
          },
          'sidebar': {
            templateUrl: 'views/home/sidebar.html'
          }
        }
      })
  })
  .controller('MainCtrl', function ($scope, flash, appointmentService, utility) {
    var appointments = appointmentService.all();

    appointments
      .then(function (response) {
        $scope.currentAppointments = response
          .filter(function (appointment) {
            var startTime = utility.getTimeStamp(appointment.appointment_date, appointment.start_time);
            var endTime = utility.getTimeStamp(appointment.appointment_date, appointment.end_time);
            var date = new Date().getTime();
            return appointment.is_approved && ( date >= startTime || date <= endTime) && appointment.checked_in;
          });
      })
      .catch(function (reason) {
        flash.error = reason.message;
      });

    appointments
      .then(function (response) {
        $scope.appointmentsAwaitingApproval = response
          .filter(function (appointment) {
            return !appointment.is_approved && utility.getTimeStamp(appointment.appointment_date) > new Date().getTime();
          });
      })
      .catch(function (reason) {
        flash.error = reason.message;
      });

    appointments
      .then(function (response) {
        $scope.appointmentsNotCheckedIn = response
          .filter(function (appointment) {
            return appointment.is_approved && appointment.checked_in !== null;
          });
      })
      .catch(function (reason) {
        flash.error = reason.message;
      });

    appointments
      .then(function (response) {
        $scope.expiredAppointments = response
          .filter(function (appointment) {
            return utility.getTimeStamp(appointment.appointment_date) < new Date().getTime()
              || appointment.checked_out !== null;
          });
      })
      .catch(function (reason) {
        flash.error = reason.message;
      });

    appointments
      .then(function (response) {
        $scope.appointmentsNeverUsed = response
          .filter(function (appointment) {
            return appointment.is_approved && appointment.checked_in === null &&
              (appointment.is_expired || utility.getTimeStamp(appointment.appointment_date) < new Date().getTime());
          });
      })
      .catch(function (reason) {
        flash.error = reason.message;
      })
  })
;
