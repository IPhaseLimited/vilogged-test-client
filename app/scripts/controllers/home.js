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
  .controller('MainCtrl', function($scope, appointmentService, utility, $rootScope, notificationService) {
    $scope.currentAppointments = [];
    $scope.appointmentsAwaitingApproval = [];

    $rootScope.busy = true;
    var appointments = appointmentService.all();

    var appointmentsInProgressExports = [];

    $scope.csvHeader = [
      'Visitor\'s Name',
      'Host\'s Name',
      'Appointment Date',
      'Start Time',
      'End Time',
      'Checked In',
      'Created',
      'Modified'
    ];

    appointments
      .then(function(response) {
        $scope.currentAppointments = response
          .filter(function(appointment) {
            var startTime = utility.getTimeStamp(appointment.appointment_date, appointment.visit_start_time);
            var endTime = utility.getTimeStamp(appointment.appointment_date, appointment.visit_end_time);
            var date = new Date().getTime();
            return appointment.is_approved && ( date >= startTime || date <= endTime) && appointment.checked_in && !appointment.checked_out;
          });

        $scope.appointmentsAwaitingApproval = response
          .filter(function(appointment) {
            return appointment.is_approved === null && (new Date(appointment.appointment_date).getTime() > new Date().getTime());
          });

        $scope.appointmentsNotCheckedIn = response
          .filter(function(appointment) {
            return appointment.is_approved === 1 && appointment.checked_in === null;
          });

        $scope.expiredAppointments = response
          .filter(function(appointment) {
            return utility.getTimeStamp(appointment.appointment_date) < new Date().getTime()
              || appointment.checked_out !== null;
          });

        $scope.appointmentsNeverUsed = response
          .filter(function(appointment) {
            return appointment.is_approved && appointment.checked_in === null &&
              (utility.getTimeStamp(appointment.appointment_date) < new Date().getTime());
          });
        $rootScope.busy = false;
      })
      .catch(function(reason) {
        $rootScope.busy = false;
        notificationService.setTimeOutNotification(reason);
      });

    $scope.currentAppointments.forEach(function (row) {
      appointmentsInProgressExports.push({
        visitor_name: row.visitor_id.first_name + ' ' + row.visitor_id.last_name,
        host_name: row.host_id.first_name + ' ' + row.host_id.last_name,
        appointment_date: row.appointment_date,
        start_time: row.start_time,
        end_time: row.end_time,
        checked_in: row.checked_in,
        created: row.created,
        modified: row.modified
      })
    })

  })
;
