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
    var appointments = [];

    $scope.inProgress = [];
    $scope.appointmentsAwaitingApproval = [];
    $scope.appointmentsNotCheckedIn= [];
    $scope.expiredAppointments= [];
    $scope.appointmentsNeverUsed= [];
    $scope.search = {
      inProgress: {},
      awaitingApproval: {},
      notCheckedIn: {},
      expired: {},
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

    function exportData(row) {
      return {
        visitor_name: row.visitor_id.first_name + ' ' + row.visitor_id.last_name,
        host_name: row.host_id.first_name + ' ' + row.host_id.last_name,
        appointment_date: row.appointment_date,
        start_time: row.start_time,
        end_time: row.end_time,
        checked_in: row.checked_in,
        created: row.created,
        modified: row.modified
      };
    }

    function getInProgress() {
      var appointmentsInProgressExports = [];
      $scope.inProgress = appointments.filter (function (row) {

        var include = true;
        var startTime = utility.getTimeStamp(row.appointment_date, row.visit_start_time);
        var endTime = utility.getTimeStamp(row.appointment_date, row.visit_end_time);
        var date = new Date().getTime();
        include = include && row.is_approved && ( date >= startTime || date <= endTime) && row.checked_in && !row.checked_out;

        if (include && $scope.search.inProgress.from) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') >= $filter('date')($scope.search.inProgress.from, 'yyyy-MM-dd');
        }

        if (include && $scope.search.inProgress.to) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') <= $filter('date')($scope.search.inProgress.to, 'yyyy-MM-dd');
        }

        return include;
      });

      $scope.inProgress.forEach(function (row) {
        appointmentsInProgressExports.push(exportData(row));
      });

      $scope.appointmentsInProgressExport = appointmentsInProgressExports;
    }

    function getAwaitingApproval() {
      var awaitingApprovalExports = [];
      $scope.awaitingApproval = appointments.filter (function (row) {

        var include = true;

        include = include && row.is_approved === null && (new Date(row.appointment_date).getTime() >= new Date().getTime());

        if (include && $scope.search.awaitingApproval.from) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') >= $filter('date')($scope.search.awaitingApproval.from, 'yyyy-MM-dd');
        }

        if (include && $scope.search.awaitingApproval.to) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') <= $filter('date')($scope.search.awaitingApproval.to, 'yyyy-MM-dd');
        }

        return include;
      });

      $scope.awaitingApproval.forEach(function (row) {
        awaitingApprovalExports.push(exportData(row));
      });

      $scope.awaitingApprovalExport = awaitingApprovalExports;
    }

    function getExpiredAppointments() {
      var expiredExports = [];
      $scope.expiredAppointments = appointments.filter (function (row) {

        var include = true;

        include = include && utility.getTimeStamp(row.appointment_date) < new Date().getTime()
        || row.checked_out !== null;

        if (include && $scope.search.expired.from) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') >= $filter('date')($scope.search.expired.from, 'yyyy-MM-dd');
        }

        if (include && $scope.search.expired.to) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') <= $filter('date')($scope.search.expired.to, 'yyyy-MM-dd');
        }

        return include;
      });

      $scope.expiredAppointments.forEach(function (row) {
        expiredExports.push(exportData(row));
      });

      $scope.expiredAppointmentsExport = expiredExports;
    }

    function getNeverUsed() {
      var neverUsedExports = [];
      $scope.neverUsed = appointments.filter (function (row) {

        var include = true;

        include = include && row.is_approved && row.checked_in === null &&
        (utility.getTimeStamp(row.appointment_date) < new Date().getTime());

        if (include && $scope.search.neverUsed.from) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') >= $filter('date')($scope.search.neverUsed.from, 'yyyy-MM-dd');
        }

        if (include && $scope.search.neverUsed.to) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') <= $filter('date')($scope.search.neverUsed.to, 'yyyy-MM-dd');
        }

        return include;
      });

      $scope.neverUsed.forEach(function (row) {
        neverUsedExports.push(exportData(row));
      });

      $scope.appointmentsNeverUsedExport = neverUsedExports;
    }

    function getNotCheckedIn() {
      var notCheckedIn = [];
      $scope.notCheckedIn = appointments.filter (function (row) {

        var include = true;

        include = include && row.is_approved === 1 && row.checked_in === null;

        if (include && $scope.search.notCheckedIn.from) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') >= $filter('date')($scope.search.notCheckedIn.from, 'yyyy-MM-dd');
        }

        if (include && $scope.search.notCheckedIn.to) {
          include = include && $filter('date')(row.appointment_date, 'yyyy-MM-dd') <= $filter('date')($scope.search.notCheckedIn.to, 'yyyy-MM-dd');
        }

        return include;
      });

      $scope.notCheckedIn.forEach(function (row) {
        notCheckedIn.push(exportData(row));
      });

      $scope.appointmentsNotCheckedInExport = notCheckedIn;
    }

    $scope.getInProgress = getInProgress;
    $scope.getAwaitingApproval = getAwaitingApproval;
    $scope.getExpiredAppointments = getExpiredAppointments;
    $scope.getNeverUsed = getNeverUsed;
    $scope.getNotCheckedIn = getNotCheckedIn;

    $scope.dateRange = {
      awaitingApproval: {
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
      },
      notCheckedIn: {
        from: dateFormat(),
        to: dateFormat()
      }
    };



    $rootScope.busy = true;
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
        getAwaitingApproval();
        getExpiredAppointments();
        getNeverUsed();
        getNotCheckedIn();

        $rootScope.busy = false;
      })
      .catch(function(reason) {
        $rootScope.busy = false;
        notificationService.setTimeOutNotification(reason);
      });

    $scope.$watch('search', function () {
      getInProgress();
      getAwaitingApproval();
      getExpiredAppointments();
      getNeverUsed();
      getNotCheckedIn();
    }, true);

  })
;
