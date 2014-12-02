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
  .controller('UserProfileCtrl', function($scope, $interval, $filter, userService, appointmentService, utility,
                                           notificationService, $rootScope, alertService) {
    var appointments = appointmentService.getNestedAppointmentsByUser($rootScope.user);
    $rootScope.busy = true;

    appointmentService.defaultEntrance()
      .then(function(response) {
        $scope.defaultEntrance = response;
      })
      .catch(function(reason) {
        notificationService.setTimeOutNotification(reason);
      });

    appointments
      .then(function(response) {
        $scope.numberOfAppointments = response.length;
        $rootScope.busy = false;
      })
      .catch(function(reason) {
        $rootScope.busy = false;
      });

    appointments
      .then(function(response) {
        $scope.upcomingAppointments = response.filter(function(appointment) {
          return appointment.is_approved &&
            (new Date(appointment.appointment_date).getTime() > new Date().getTime() || !appointment.is_expired);
        });
        $scope.upcomingAppointmentCount = $scope.upcomingAppointments.length;
      })
      .catch(function(reason) {

      });

    appointments
      .then(function(response) {
        $scope.appointmentsAwaitingApproval = response
          .filter(function(appointment) {
            return !appointment.is_approved && (!appointment.is_expired ||
              utility.getTimeStamp(appointment.appointment_date) > new Date().getTime());
          });
        $scope.appointmentsAwaitingApprovalCount = $scope.appointmentsAwaitingApproval.length;
      })
      .catch(function(reason) {

      });

    $scope.toggleAppointmentApproval = function(appointment_id, index) {
      var dialogParams = {
        modalHeader: 'Appointment Approval'
      };

      dialogParams.modalBodyText = 'Are you sure you want to approve this appointment?';

      function removeApprovedAppointment(index, appointment) {
        $scope.appointmentsAwaitingApproval.splice(index, 1);
        var upcomingAppointmentLastIndex = $scope.upcomingAppointments.length - 1;
        $scope.upcomingAppointments.splice(upcomingAppointmentLastIndex, 0, appointment);
        $filter('limitTo')($scope.appointmentsAwaitingApproval, 5);
        $filter('limitTo')($scope.upcomingAppointments, 5);
      }

      $rootScope.busy = true;
      notificationService.modal.confirm(dialogParams)
        .then(function() {
          appointmentService.get(appointment_id)
            .then(function(response){
              $rootScope.busy = false;
              response.is_approved = true;
              if (!response.entrance) {
                response.entrance_id = $scope.defaultEntrance;
              }
              appointmentService.save(response)
                .then(function(){
                  var message = 'The selected appointment has been approved.';
                  alertService.success(message);

                  $rootScope.busy = false;
                  if (!$scope.upcomingAppointments) $scope.upcomingAppointments = [];
                  removeApprovedAppointment(index, response);
                })
                .catch(function(reason){
                  $rootScope.busy = false;

                });
            })
            .catch(function(reason){
              $rootScope.busy = false;

            });
        });
    };
  })
  .controller('UsersCtrl', function($scope, $filter, userService, notificationService, alertService, $rootScope) {
    var rows = [];
    var exports = [];

    $scope.search = {};

    $scope.csvHeader = [
      'User\'s Name',
      'Username',
      'Role',
      'Department',
      'Office Phone'
    ];

    function getUsers() {
      $rootScope.busy = true;
      userService.usersNested()
        .then(function(response) {
          rows = response;
          updateTableData();
          $rootScope.busy = false;
        })
        .catch(function(reason) {
          notificationService.setTimeOutNotification(reason);
          $rootScope.busy = false;
        });
    }

    getUsers();
    $scope.$watch('search', function () {
      updateTableData();
    }, true);

    $scope.orderByColumn = {
      created: {
        reverse: true
      }

    };

    $scope.sort = function(column) {
      if ($scope.orderByColumn[column]) {
        $scope.orderByColumn[column].reverse = !$scope.orderByColumn[column].reverse;
      } else {
        $scope.orderByColumn = {};
        $scope.orderByColumn[column]= {reverse: true};
      }
      $scope.users = $filter('orderBy')($scope.users, column, $scope.orderByColumn[column].reverse);
    };

    function updateTableData() {
      $scope.users = rows.filter(function (row) {
        var date = moment(row.created);
        var include = true;

        if (include && $scope.search.name) {
          include = row.first_name.toLowerCase().indexOf($scope.search.name.toLowerCase()) > -1 ||
          row.last_name.toLowerCase().indexOf($scope.search.name.toLowerCase()) > -1;
        }

        if (include && $scope.search.username) {
          include = row.username.toLowerCase().indexOf($scope.search.username.toLowerCase()) > -1;
        }

        if (include && $scope.search.role) {
          if ($scope.search.role === 'superadmin') include = row.is_active && row.is_staff && row.is_superadmin;
          if ($scope.search.role === 'admin') include = row.is_active && row.is_staff && !row.is_superadmin;
          if ($scope.search.role === 'staff') include = row.is_active && !row.is_staff && !row.is_superadmin;
          if ($scope.search.role === 'not active') include = !row.is_active;
        }

        if (include && $scope.search.department) {
          include = row.user_profile.department.department_name.toLowerCase().indexOf($scope.search.department.toLowerCase()) > -1;
        }

        if (include && $scope.search.phone) {
          include = row.user_profile.phone.indexOf($scope.search.phone) > -1;
        }

        return include;
      });

      $scope.users.forEach(function (row) {
        exports.push({
          name: row.first_name + ' ' + row.last_name,
          username: row.username,
          role: row.role,
          department: row.user_profile.department.department_name,
          phone: row.phone
        });
      });
      $scope.export = exports;
    }

    $scope.toggleActive = function(id) {
      userService.toggleUserActivationStatus(id)
        .then(function(response) {
          getUsers();
        });
    };

    //TODO:: flash message
    $scope.deleteAccount = function(id) {
      $rootScope.busy = true;
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
              alertService.messageToTop.success('Account deleted successfully.');
              getUsers();
              $rootScope.busy = false;
            })
            .catch(function(reason) {
              notificationService.setTimeOutNotification(reason);
              $rootScope.busy = false;
            });
        });
    }
  })
  .controller('UserFormCtrl', function($scope, $state, $stateParams, $window, userService, companyDepartmentsService, growl,
                                       $rootScope, $cookieStore, notificationService, alertService) {

    $rootScope.busy = true;
    $scope.userLoaded = false;
    $scope.departmentLoaded = false;
    $scope.userProfile = {};
    $scope.userProfile.user_profile = {};
    $scope.activateCamera = false;

    if ($stateParams.user_id) {
      userService.get($stateParams.user_id)
        .then(function(response) {
          $scope.userProfile = response;
          $scope.userLoaded = true;
          if ($scope.departmentLoaded) {
            $rootScope.busy = false;
          }
        })
        .catch(function(reason) {
          $scope.userLoaded = true;
          if ($scope.departmentLoaded) {
            $rootScope.busy = false;
          }
          notificationService.setTimeOutNotification(reason);
        })
    } else {
      $scope.userLoaded = true;
    }

    companyDepartmentsService.all()
      .then(function(response) {
        $scope.departments = response;
        $scope.departmentLoaded = true;
        if ($scope.userLoaded) {
          $rootScope.busy = false;
        }
      })
      .catch(function(reason) {
        notificationService.setTimeOutNotification(reason);
        $scope.departmentLoaded = true;
        if ($scope.departmentLoaded) {
          $rootScope.busy = false;
        }
      });

    $scope.setFiles = function (element, field) {
      $scope.$apply(function () {

        var fileToUpload = element.files[0];
        if (fileToUpload.type.match('image*')) {
          var reader = new $window.FileReader();
          reader.onload = function (theFile) {
            $scope.userProfile.user_profile[field] = theFile.target.result;
          };
          reader.readAsDataURL(fileToUpload);
        }

      });
    };

    $scope.createUserAccount = function() {
      $rootScope.busy = true;
      if ($scope.userProfile.user_profile !== undefined || $scope.userProfile.user_profile === null) {
        $scope.userProfile.user_profile.home_phone = $scope.userProfile.user_profile.home_phone || null;
        $scope.userProfile.user_profile.work_phone = $scope.userProfile.user_profile.work_phone || null;
      }



      if (toString.call($scope.userProfile.user_profile.department) === '[object String]') {
        //$scope.user.user_profile.department = JSON.parse($scope.user.user_profile.department);
      }
      userService.save($scope.userProfile)
        .then(function() {
          var message = 'User account was successfully saved.';
          growl.addSuccessMessage(message);
          if ($scope.userProfile.id === $scope.user.id) {
            userService.currentUser()
              .then(function(user) {
                $rootScope.user = user;
                $cookieStore.put('current-user', user);
              })
              .catch(function(reason) {
                $rootScope.busy = false;
                notificationService.setTimeOutNotification(reason);
                $rootScope.user.is_superuser ? $state.go("users") : $state.go("profile");
              });
          }

          $rootScope.busy = false;
          $rootScope.user.is_superuser ? $state.go("users") : $state.go("profile");
        })
        .catch(function(reason) {
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }
  })
  .controller('ChangePasswordCtrl', function($scope, $state, $stateParams, userService, alertService, $rootScope) {

    $rootScope.busy = false;
    $scope.userPassword = {};

    $scope.changeAccountPassword = function() {
      $rootScope.busy = true;
      userService.updatePassword($scope.userPassword)
        .then(function(response) {
          alertService.messageToTop.success('Password changed successfully.');
          $rootScope.busy = false;
          $state.go("home");
        })
        .catch(function(reason) {
          notificationService.setTimeOutNotification(reason);
          $rootScope.busy = false;
        })
    }
  });
