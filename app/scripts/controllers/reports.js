'use strict';

/**
 * @ngdoc function
 * @name viLoggedClientApp.controller:ReportsCtrl
 * @description
 * # ReportsCtrl
 * Controller of the viLoggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('reports', {
        parent: 'root.index',
        url: '/reports',
        data: {
          label: 'Reports',
          allowedRoles: []
        },
        templateUrl: 'views/reports/index.html',
        controller: 'ReportsCtrl',
        ncyBreadcrumb: {
          label: 'Reports'
        }
      });
  })
  .controller('ReportsCtrl', function($scope, appointmentService, visitorService, utility, $rootScope) {
    $rootScope.busy = true;
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;

    var appointments = appointmentService.all();

    appointments
      .then(function(response) {
        $scope.currentAppointments = response
          .filter(function(appointment) {
            var startTime = utility.getTimeStamp(appointment.appointment_date, appointment.start_time);
            var endTime = utility.getTimeStamp(appointment.appointment_date, appointment.end_time);
            var date = new Date().getTime();
            return appointment.is_approved && ( date >= startTime || date <= endTime) && appointment.checked_in && !appointment.checked_out;
          });
        $scope.totalItems = response.length;
        $scope.numPages = Math.ceil($scope.totalItems/$scope.itemsPerPage);
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointmentService.getAppointmentsByDay()
      .then(function(response) {
        $scope.appointmentForToday = response;
        $scope.numberOfAppointmentsForToday = response.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointmentService.getAppointmentsByMonth()
      .then(function(response) {
        $scope.appointmentForThisMonth = response;
        $scope.numberOfAppointmentsForThisMonth = response.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointmentService.getAppointmentsByWeek()
      .then(function(response) {
        $scope.appointmentForThisWeek = response;
        $scope.numberOfAppointmentsForThisWeek = response.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    visitorService.getVisitorsGroupedByCompany()
      .then(function(response) {
        $scope.visitorsGroupedByCompany = response;
        $rootScope.busy = false;
      })
      .catch(function(reason) {
        console.log(reason);
        $rootScope.busy = false;
      })
  });
