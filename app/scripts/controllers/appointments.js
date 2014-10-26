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
      .state('newAppointment', {
        parent: 'root.index',
        url: '/new-appointments',
        templateUrl: 'views/appointments/form.html',
        controller: 'NewAppointmentCtrl'
      })
  })
  .controller('AppointmentCtrl', function ($scope) {})
  .controller('NewAppointmentCtrl', function($scope) {
    $scope.entrance = [
      {
        id: 1,
        entrance_name: 'Gate 1'
      },
      {
        id: 2,
        entrance_name: 'Gate 2'
      },
      {
        id: 3,
        entrance_name: 'Gate 3'
      },
      {
        id: 4,
        entrance_name: 'Gate 4'
      }
    ];

    $scope.hosts = [
      {
        id: 1,
        user: {
          id: 1,
          name: 'John Doe'
        }
      },
      {
        id: 2,
        user: {
          id: 2,
          name: 'Jane Doe'
        }
      },
      {
        id: 3,
        user: {
          id: 3,
          name: 'John Smith'
        }
      }
    ];

    $scope.vistors = [
      {
        id: 1,
        name: 'John Doe'
      },
      {
        id: 2,
        name: 'Jane Doe'
      },
      {
        id: 3,
        name: 'John Smith'
      }
    ]
  });