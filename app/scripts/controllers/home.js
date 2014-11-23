'use strict';

angular.module('viLoggedClientApp')
  .config(function($urlRouterProvider, $stateProvider) {
    // Initial state
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        parent: 'root.index',
        url: '/',
        templateUrl: 'views/home/index.html',
        controller: 'MainCtrl',
        data: {
          label: 'Dashboard'
        },
        ncyBreadcrumb: {
          label: 'Home'
        }
      })
      .state('home.index', {
        abstract: true,
        views: {
          'nav': {
            templateUrl: 'views/home/nav.html',
            controller: function($scope, $state) {
              $scope.$state = $state;
            }
          },
          'sidebar': {
            templateUrl: 'views/home/sidebar.html'
          }
        }
      })
  })
  .controller('MainCtrl', function($scope, appointmentService, utility, growl) {


    growl.addWarnMessage("This adds a warn message");
    growl.addInfoMessage("This adds a info message");
    growl.addSuccessMessage("This adds a success message");
    growl.addErrorMessage("This adds a error message");

    $scope.busy = true;
    var appointments = appointmentService.all();

    appointments
      .then(function(response) {
        $scope.currentAppointments = response
          .filter(function(appointment) {
            var startTime = utility.getTimeStamp(appointment.appointment_date, appointment.start_time);
            var endTime = utility.getTimeStamp(appointment.appointment_date, appointment.end_time);
            var date = new Date().getTime();
            return appointment.is_approved && ( date >= startTime || date <= endTime) && appointment.checked_in;
          });
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function(response) {
        $scope.appointmentsAwaitingApproval = response
          .filter(function(appointment) {
            return !appointment.is_approved && utility.getTimeStamp(appointment.appointment_date) > new Date().getTime();
          });
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function(response) {
        $scope.appointmentsNotCheckedIn = response
          .filter(function(appointment) {
            return appointment.is_approved && appointment.checked_in !== null;
          });
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function(response) {
        $scope.expiredAppointments = response
          .filter(function(appointment) {
            return utility.getTimeStamp(appointment.appointment_date) < new Date().getTime()
              || appointment.checked_out !== null;
          });
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function(response) {
        $scope.appointmentsNeverUsed = response
          .filter(function(appointment) {
            return appointment.is_approved && appointment.checked_in === null &&
              (appointment.is_expired || utility.getTimeStamp(appointment.appointment_date) < new Date().getTime());
          });
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function() {
        $scope.busy = false;
      })
      .catch(function() {
        $scope.busy = false;
      })
  })
;
