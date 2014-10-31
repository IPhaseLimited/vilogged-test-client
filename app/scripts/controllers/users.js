'use strict';

/**
 * @ngdoc function
 * @name viloggedClientApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the viloggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('profile', {
        parent: 'root.index',
        url: '/profile',
        templateUrl: 'views/user/user-profile.html',
        controller: 'userProfileCtrl'
      })
  })
  .controller('userProfileCtrl', function($scope, $interval, userService, appointmentService) {
    $scope.currentUser = userService.user;

    appointmentService.getAppointmentsByUser($scope.currentUser)
      .then(function(response) {
        $scope.numberOfAppointments = response.length;
      })
      .catch(function (reason) {
        console.log(reason);
      });

    appointmentService.getUpcomingAppointments($scope.currentUser)
      .then(function(response) {
        $scope.upcomingAppointments = response;
        $scope.upcomingAppointmentCount = response.length;
        console.log($scope.upcomingAppointmentCount)
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointmentService.getAppointmentsAwaitingApproval($scope.currentUser)
      .then(function(response) {
        $scope.appointmentsAwaitingApproval = response;
        $scope.appointmentsAwaitingApprovalCount = response.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });
  })
  .controller('UsersCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });