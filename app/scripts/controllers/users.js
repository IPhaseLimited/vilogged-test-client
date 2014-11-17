'use strict';

/**
 * @ngdoc function
 * @name viloggedClientApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the viloggedClientApp
 */
angular.module('viLoggedClientApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profile', {
        parent: 'root.index',
        url: '/profile',
        templateUrl: 'views/user/user-profile.html',
        controller: 'UserProfileCtrl',
        data: {
          label: 'User Profile',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'User Profile'
        }
      })
  })
  .config(function ($stateProvider) {
    $stateProvider
      .state('users', {
        parent: 'root.index',
        url: '/users',
        templateUrl: 'views/user/index.html',
        controller: 'UsersCtrl',
        data: {
          label: 'Users',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'Users'
        }
      })
  })
  .config(function ($stateProvider) {
    $stateProvider
      .state('createUser', {
        parent: 'root.index',
        url: '/user/add',
        templateUrl: 'views/user/widget-form.html',
        controller: 'UserFormCtrl',
        data: {
          label: 'Create User Account',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'Create User Account'
        }
      })
  })
  .config(function ($stateProvider) {
    $stateProvider
      .state('editUser', {
        parent: 'root.index',
        url: '/user/:user_id/edit',
        templateUrl: 'views/user/widget-form.html',
        controller: 'UserFormCtrl',
        data: {
          label: 'Edit User\'s Account',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'Edit User\'s Account'
        }
      })
  })
  .config(function ($stateProvider) {
    $stateProvider
      .state('change-password', {
        parent: 'root.index',
        url: '/users/change-password',
        templateUrl: 'views/user/user-change-password.html',
        controller: 'ChangePasswordCtrl',
        data: {
          label: 'Change Password',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'Change Password'
        }
      })
  })
  .controller('UserProfileCtrl', function ($scope, $interval, userService, appointmentService) {
    $scope.currentUser = userService.user;
    appointmentService.getAppointmentsByUser($scope.currentUser)
      .then(function (response) {
        $scope.numberOfAppointments = response.length;
      })
      .catch(function (reason) {
        console.log(reason);
      });

    appointmentService.getUpcomingAppointments($scope.currentUser)
      .then(function (response) {
        $scope.upcomingAppointments = response;
        $scope.upcomingAppointmentCount = response.length;
        console.log($scope.upcomingAppointmentCount)
      })
      .catch(function (reason) {
        console.log(reason);
      });

    appointmentService.getAppointmentsAwaitingApproval($scope.currentUser)
      .then(function (response) {
        $scope.appointmentsAwaitingApproval = response;
        $scope.appointmentsAwaitingApprovalCount = response.length;
      })
      .catch(function (reason) {
        console.log(reason);
      });
  })
  .controller('UsersCtrl', function ($scope, userService, notificationService) {
    function getUsers() {
      userService.usersNested()
        .then(function (response) {
          $scope.users = response;
        })
        .catch(function (reason) {

        });
    }

    getUsers();

    $scope.toggleActive = function (id) {
      userService.toggleUserActivationStatus(id)
        .then(function (response) {
          getUsers();
        });
    };

    //TODO:: flash message
    $scope.deleteAccount = function (id) {
      if (userService.user.id === id) {
        return;
      }
      var dialogParams = {
        modalHeader: 'Delete User?',
        modalBodyText: 'are you sure you want to delete the following?'
      };

      notificationService.modal.confirm(dialogParams)
        .then(function() {
          userService.remove(id)
            .then(function (response) {
              getUsers();
            })
            .catch(function (reason) {
              console.log(reason);
            });
        });
    }
  })
  .controller('UserFormCtrl', function ($scope, $state, $stateParams, userService, companyDepartmentsService, flash) {
    $scope.currentUser = userService.user;
    $scope.user = {};
    $scope.user.user_profile = {};

    if ($stateParams.user_id) {
      userService.get($stateParams.user_id)
        .then(function (response) {
          //console.log(response);
          $scope.user = response;
        })
        .catch(function (reason) {
        })
    }

    companyDepartmentsService.all()
      .then(function (response) {
        $scope.departments = response;
      })
      .catch(function (reason) {
        console.log(reason);
      });

    if (!$scope.currentUser.is_superuser) {
      $state.go("home");
    }

    $scope.createUserAccount = function () {
      if ($scope.user.user_profile !== undefined || $scope.user.user_profile === null) {
        $scope.user.user_profile.home_phone = $scope.user.user_profile.home_phone || null;
        $scope.user.user_profile.work_phone = $scope.user.user_profile.work_phone || null;
      }

      if (toString.call($scope.user.user_profile.department) === '[object String]') {
        //$scope.user.user_profile.department = JSON.parse($scope.user.user_profile.department);
      }
      userService.save($scope.user)
        .then(function () {
          !$stateParams.user_id
            ? flash.success = 'User account was successfully created.'
            : flash.success = 'User account was successfully updated.';
          $state.go("users");
        })
        .catch(function (reason) {
          console.log(reason);
        });
    }
  })
  .controller('ChangePasswordCtrl', function ($scope, $state, $stateParams, userService) {
    $scope.userPassword = {};

    //todo:: flash message
    $scope.changeAccountPassword = function () {
      userService.updatePassword($scope.userPassword)
        .then(function (response) {
          $state.go("home");
        })
        .catch(function (reason) {
        })
    }
  });
