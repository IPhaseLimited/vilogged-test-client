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
  .controller('MainCtrl', function($scope, appointmentService, utility, $rootScope, notificationService, $filter) {
    var inProgress = [],
        awaitingApproval = [],
        notCheckedIn = [],
        expiredAppointments = [],
        neverUsed = [],
        appointments = [];

    $scope.inProgress = [];
    $scope.appointmentsAwaitingApproval = [];
    $scope.appointmentsNotCheckedIn= [];
    $scope.expiredAppointments= [];
    $scope.appointmentsNeverUsed= [];
    $scope.search = {
      inProgress: {},
      awaitingApproval: {},
      notCheckedIn: {},
      expiredAppointments: {},
      neverUsed: {}
    };

    function dateFormat() {
      return {
        opened: false,
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();

          this.opened = true;
        }
      };
    }

    function getInProgress() {
      var appointmentsInProgressExports = [];
      $scope.inProgress = appointments.filter (function (row) {

        var include = true;
        var startTime = utility.getTimeStamp(row.appointment_date, row.visit_start_time);
        var endTime = utility.getTimeStamp(row.appointment_date, row.visit_end_time);
        var date = new Date().getTime();
        include = row.is_approved && ( date >= startTime || date <= endTime) && row.checked_in && !row.checked_out;

        if (include && $scope.search.inProgress.from) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') === $filter('date')($scope.search.inProgress.from, 'yyyy-MM-dd');
        }

        if (include && $scope.search.inProgress.to) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') === $filter('date')($scope.search.inProgress.to, 'yyyy-MM-dd');
        }

        return include;
      });

      $scope.inProgress.forEach(function (row) {
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
      });

      $scope.appointmentsInProgressExport = appointmentsInProgressExports;
    }
    $scope.getInProgress = getInProgress;

    $scope.dateRange = {
      awaiting: {
        from: dateFormat(),
        to: dateFormat()
      },
      inProgress: {
        from: dateFormat(),
        to: dateFormat()
      },
      expired: {
        from: dateFormat(),
        to: dateFormat()
      },
      neverUsed: {
        from: dateFormat(),
        to: dateFormat()
      }
    };



    $rootScope.busy = true;

    var appointmentsAwaitingApprovalExports = [];
    var appointmentsNotCheckedInExports = [];
    var expiredAppointmentsExports = [];
    var appointmentsNeverUsedExports = [];

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

    appointmentService.all()
      .then(function(response) {
        appointments = response;
        getInProgress();

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


        $scope.appointmentsAwaitingApproval.forEach(function (row) {
          appointmentsAwaitingApprovalExports.push({
            visitor_name: row.visitor_id.first_name + ' ' + row.visitor_id.last_name,
            host_name: row.host_id.first_name + ' ' + row.host_id.last_name,
            appointment_date: row.appointment_date,
            start_time: row.start_time,
            end_time: row.end_time,
            checked_in: row.checked_in,
            created: row.created,
            modified: row.modified
          })
        });

        $scope.appointmentsAwaitingApprovalExport = appointmentsAwaitingApprovalExports;

        $scope.appointmentsNotCheckedIn.forEach(function (row) {
          appointmentsNotCheckedInExports.push({
            visitor_name: row.visitor_id.first_name + ' ' + row.visitor_id.last_name,
            host_name: row.host_id.first_name + ' ' + row.host_id.last_name,
            appointment_date: row.appointment_date,
            start_time: row.start_time,
            end_time: row.end_time,
            checked_in: row.checked_in,
            created: row.created,
            modified: row.modified
          })
        });

        $scope.appointmentsNotCheckedInExport = appointmentsNotCheckedInExports;

        $scope.expiredAppointments.forEach(function (row) {
          expiredAppointmentsExports.push({
            visitor_name: row.visitor_id.first_name + ' ' + row.visitor_id.last_name,
            host_name: row.host_id.first_name + ' ' + row.host_id.last_name,
            appointment_date: row.appointment_date,
            start_time: row.start_time,
            end_time: row.end_time,
            checked_in: row.checked_in,
            created: row.created,
            modified: row.modified
          })
        });

        $scope.expiredAppointmentsExport = expiredAppointmentsExports;

        $scope.appointmentsNeverUsed.forEach(function (row) {
          appointmentsNeverUsedExports.push({
            visitor_name: row.visitor_id.first_name + ' ' + row.visitor_id.last_name,
            host_name: row.host_id.first_name + ' ' + row.host_id.last_name,
            appointment_date: row.appointment_date,
            start_time: row.start_time,
            end_time: row.end_time,
            checked_in: row.checked_in,
            created: row.created,
            modified: row.modified
          })
        });

        $scope.appointmentsNeverUsedExport = appointmentsNeverUsedExports;
        $rootScope.busy = false;
      })
      .catch(function(reason) {
        $rootScope.busy = false;
        notificationService.setTimeOutNotification(reason);
      });

  })
;
