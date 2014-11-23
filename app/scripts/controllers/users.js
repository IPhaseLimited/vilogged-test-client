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
        controller: 'UserProfileCtrl',
        data: {
          label: 'User Profile',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'User Profile'
        }
      })
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
          label: 'Create User Account',
          parent: 'users'
        }
      })
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
          label: 'Edit User\'s Account',
          parent: 'users'
        }
      })
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
          label: 'Change Password',
          parent: 'profile'
        }
      });
  })
  .controller('UserProfileCtrl', function($scope, $interval, userService, appointmentService, utility,
                                           notificationService) {
    var appointments = appointmentService.getNestedAppointmentsByUser($scope.user);

    appointments
      .then(function(response) {
        $scope.numberOfAppointments = response.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function(response) {
        $scope.upcomingAppointments = response.filter(function(appointment) {
          return appointment.is_approved &&
            new Date(appointment.appointment_date).getTime() > new Date().getTime() && !appointment.is_expired
              && appointment.is_approved !== true;
        });
        $scope.upcomingAppointmentCount = $scope.upcomingAppointments.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    appointments
      .then(function(response) {
        $scope.appointmentsAwaitingApproval = response
          .filter(function(appointment) {
            return !appointment.is_approved && !appointment.is_expired &&
              utility.getTimeStamp(appointment.appointment_date) > new Date().getTime()
              && appointment.is_approved === null;
          });
        $scope.appointmentsAwaitingApprovalCount = $scope.appointmentsAwaitingApproval.length;
      })
      .catch(function(reason) {
        console.log(reason);
      });

    $scope.toggleAppointmentApproval = function(appointment_id, approvalStatus) {
      var dialogParams = {
        modalHeader: 'Appointment Approval'
      };

      dialogParams.modalBodyText = approvalStatus ? 'Are you sure you want to approve this appointment?' :
        'Are you sure you want to disapprove this appointment?';

      $scope.busy = true;
      notificationService.modal.confirm(dialogParams)
        .then(function() {
          appointmentService.get(appointment_id)
            .then(function(response){
              response.is_approved = approvalStatus;
              appointmentService.save(response)
                .then(function(){
                  var message = approvalStatus ? 'The selected appointment has been approved.' : 'The selected appointment has been rejected.';
                  growl.addSuccessMessage(message);

                  $scope.busy = false;
                  if (!$scope.upcomingAppointments) $scope.upcomingAppointments = [];
                })
                .catch(function(reason){
                  $scope.busy = false;
                  console.log(reason);
                });
            })
            .catch(function(reason){
              $scope.busy = false;
              console.log(reason);
            });
        });
    };
  })
  .controller('UsersCtrl', function($scope, userService, notificationService, growl) {
    function getUsers() {
      userService.usersNested()
        .then(function(response) {
          $scope.users = response;
        })
        .catch(function(reason) {

        });
    }

    getUsers();

    $scope.toggleActive = function(id) {
      userService.toggleUserActivationStatus(id)
        .then(function(response) {
          getUsers();
        });
    };

    //TODO:: flash message
    $scope.deleteAccount = function(id) {
      $scope.busy = true;
      if (userService.user.id === id) {
        return;
      }
      var dialogParams = {
        modalHeader: 'Delete User?',
        modalBodyText: 'Are you sure you want to delete the following?'
      };

      notificationService.modal.confirm(dialogParams)
        .then(function() {
          userService.remove(id)
            .then(function(response) {
              growl.addSuccessMessage('Account deleted successfully.');
              getUsers();
              $scope.busy = false;
            })
            .catch(function(reason) {
              console.log(reason);
              $scope.busy = false;
            });
        });
    }
  })
  .controller('UserFormCtrl', function($scope, $state, $stateParams, userService, companyDepartmentsService, growl) {
    $scope.busy = true;
    $scope.userLoaded = false;
    $scope.departmentLoaded = false;
    $scope.user = userService.user;
    $scope.user = {};
    $scope.user.user_profile = {};

    if ($stateParams.user_id) {
      userService.get($stateParams.user_id)
        .then(function(response) {
          $scope.user = response;
          $scope.userLoaded = false;
          if ($scope.departmentLoaded) {
            $scope.busy = true;
          }
        })
        .catch(function(reason) {
          $scope.userLoaded = false;
          if ($scope.departmentLoaded) {
            $scope.busy = true;
          }
          console.log(reason);
        })
    }

    companyDepartmentsService.all()
      .then(function(response) {
        $scope.departments = response;
        $scope.departmentLoaded = false;
        if ($scope.userLoaded) {
          $scope.busy = true;
        }
      })
      .catch(function(reason) {
        console.log(reason);
        $scope.userLoaded = false;
        if ($scope.departmentLoaded) {
          $scope.busy = true;
        }
      });

    console.log($scope.user);
    //FIXME: please differentiate between the logged user and your user model
    if (!$scope.user.is_superuser) {
      //$state.go("home");
    }

    $scope.createUserAccount = function() {
      $scope.busy = true;
      if ($scope.user.user_profile !== undefined || $scope.user.user_profile === null) {
        $scope.user.user_profile.home_phone = $scope.user.user_profile.home_phone || null;
        $scope.user.user_profile.work_phone = $scope.user.user_profile.work_phone || null;
      }

      if (toString.call($scope.user.user_profile.department) === '[object String]') {
        //$scope.user.user_profile.department = JSON.parse($scope.user.user_profile.department);
      }
      userService.save($scope.user)
        .then(function() {
          var message = !$stateParams.user_id ? 'User account was successfully created.' : 'User account was successfully updated.';
          growl.addSuccessMessage(message);

          $scope.busy = false;
          $state.go("users");
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        });
    }
  })
  .controller('ChangePasswordCtrl', function($scope, $state, $stateParams, userService, growl) {
    $scope.busy = false;
    $scope.userPassword = {};

    $scope.changeAccountPassword = function() {
      $scope.busy = true;
      userService.updatePassword($scope.userPassword)
        .then(function(response) {
          grow.addSuccessMessage('Password changed successfully.');
          $scope.busy = false;
          $state.go("home");
        })
        .catch(function(reason) {
          $scope.busy = false;
        })
    }
  });
