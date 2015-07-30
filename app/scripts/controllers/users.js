'use strict';

angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('users', {
        parent: 'root.index',
        url: '/users',
        templateUrl: 'views/user/index.html',
        controller: 'UsersCtrl',
        controllerAs: 'UsersCtrl',
        resolve: angular.extend(resolveToState(), {
          allUsers: function(userService, alertService, $rootScope) {
            $rootScope.busy = true;
            return userService.all()
              .catch(function(reason) {
               alertService.error('users list not loading');
                console.log(reason);
              });
          }
        }),
        data: {
          label: 'Users',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'Users'
        }
      })
      .state('user-form', {
        parent: 'root.index',
        url: '/user-form?_id&index&returnUrl',
        templateUrl: 'views/user/form.html',
        controller: 'UserFormCtrl',
        controllerAs: 'UserFormCtrl',
        resolve: angular.extend(resolveToState(), {
          user: function(userService, alertService, $rootScope, $stateParams) {
            $rootScope.busy = true;
            return userService.get($stateParams._id)
              .catch(function(reason) {
                $rootScope.busy = false;
                alertService.error('users list not loading');
                console.log(reason);
              });
          },
          departments: function(departmentService) {
            return departmentService.all();
          }
        }),
        data: {
          label: 'User Profile',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          parent: 'users',
          label: 'User Profile'
        }
      })
      .state('profile', {
        parent: 'root.index',
        url: '/profile',
        templateUrl: 'views/user/user-profile.html',
        controller: 'UserProfileCtrl',
        resolve: {
          userAppointments: function(appointmentService, notificationService, $rootScope, userService) {
            var user = userService.user;
            return appointmentService.getByUser(user)
              .then(function(response) {
                var $scope = {};
                $scope.upcomingAppointments = [];
                $scope.appointmentsAwaitingApproval = [];
                $scope.numberOfAppointments = response.length;

                $rootScope.busy = false;
                var length = response.length;
                for (var i = 0; i < length; i++) {
                  var row = response[i];
                  if (row.is_approved && (new Date(row.appointment_date).getTime() > new Date().getTime())) {
                    $scope.upcomingAppointments.push(row);
                  }
                  if (!row.is_approved && (utility.getTimeStamp(row.appointment_date) > new Date().getTime())) {
                    $scope.appointmentsAwaitingApproval.push(row);
                  }
                }

                $scope.upcomingAppointmentCount = $scope.upcomingAppointments.length;
                $scope.appointmentsAwaitingApprovalCount = $scope.appointmentsAwaitingApproval.length;
                return $scope;
              })
              .catch(function(reason) {
                $rootScope.busy = false;
                notificationService.setTimeOutNotification(reason);
              });
          }
        },
        data: {
          label: 'User Profile',
          requiredPermission: 'is_superuser'
        },
        ncyBreadcrumb: {
          label: 'User Profile'
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
  .controller('UsersCtrl', function(
    userService,
    allUsers,
    $rootScope,
    $scope,
    $filter
  ) {
    $rootScope.busy = false;
    $scope.$watch('search', function () {
      updateTableData();
    }, true);
    var vm = this, rows = [];
    $scope.search = {};

    vm.pagination = {
      currentPage: 1,
      maxSize: 5,
      itemsPerPage: 10
    };

    vm.csvHeader = [
      'User\'s Name',
      'Username',
      'Role',
      'Department',
      'Office Phone'
    ];

    vm.orderByColumn = {
      created: {
        reverse: true
      }
    };

    vm.sort = function(column) {
      if (vm.orderByColumn[column]) {
        vm.orderByColumn[column].reverse = !vm.orderByColumn[column].reverse;
      } else {
        vm.orderByColumn = {};
        vm.orderByColumn[column]= {reverse: true};
      }
      vm.all = $filter('orderBy')(vm.all, column, vm.orderByColumn[column].reverse);
    };
    vm.all = rows = allUsers;
    vm.pagination.totalItems = rows.length;
    vm.pagination.numPages = Math.ceil(vm.pagination.totalItems / vm.pagination.itemsPerPage);
    updateTableData();


    function updateTableData() {
      var exports = [];
      var filtered = [];
      (function () {
        var length = rows.length;
        for (var i = 0; i < length; i++ ) {
          var row = rows[i];
          var date = moment(row.created);
          var include = true;

          if (include && $scope.search.name) {
            var RName = row.first_name.toLowerCase() + ' ' + row.last_name.toLowerCase();
            var LName = row.last_name.toLowerCase() + ' ' + row.first_name.toLowerCase();
            include =
              row.first_name.toLowerCase().indexOf($scope.search.name.toLowerCase()) > -1 ||
              row.last_name.toLowerCase().indexOf($scope.search.name.toLowerCase()) > -1 ||
              RName.indexOf($scope.search.name.toLowerCase()) > -1 ||
              LName.indexOf($scope.search.name.toLowerCase()) > -1;
          }

          if (include && $scope.search.username) {
            include = row.username.toLowerCase().indexOf($scope.search.username.toLowerCase()) > -1;
          }

          if (include && $scope.search.role) {
            if ($scope.search.role === 'is_superuser') include = row.is_active && row.is_staff && row.is_superuser;
            if ($scope.search.role === 'is_staff') include = row.is_active && row.is_staff && !row.is_superuser;
            if ($scope.search.role === 'is_active') include = row.is_active && !row.is_staff && !row.is_superuser;
            if ($scope.search.role === 'not_active') include = !row.is_active;
          }

          if (include && $scope.search.department) {
            include = row.department.toLowerCase().indexOf($scope.search.department.toLowerCase()) > -1;
            //include = row.user_profile.department.department.toLowerCase().indexOf($scope.search.department.toLowerCase()) > -1;
          }

          if (include && $scope.search.phone) {
            include = row.phone.indexOf($scope.search.phone) > -1;
          }
          if (include) {
            filtered.push(row);
            var department = angular.isDefined(row.department) && row.department !== null ? row.department : '';
            department = angular.isDefined(row.user_profile) && row.user_profile !== null? row.user_profile.department : department;
            var phone = angular.isDefined(row.user_profile) && row.user_profile !== null? row.user_profile.phone : '';
            exports.push({
              name: row.first_name + ' ' + row.last_name,
              username: row.username,
              role: row.role,
              department: department,
              phone: phone
            });
          }
        }
      })();
      vm.all = filtered;
      vm.pagination.totalItems = vm.all.length;
      vm.pagination.numPages = Math.ceil(vm.pagination.totalItems / vm.pagination.itemsPerPage);
      vm.export = exports;
    }

  })
  .controller('UserFormCtrl', function(
    userService,
    departmentService,
    notificationService,
    departments,
    user,
    $rootScope,
    $scope,
    $state,
    $window,
    alertService
  ) {
    var vm = this;
    $rootScope.busy = false;
    $scope.userLoaded = false;
    $scope.userProfile = user;
    $scope.activateCamera = false;
    $scope.departments = departments;

    $scope.setFiles = function (element, field) {
      $scope.$apply(function () {

        var fileToUpload = element.files[0];
        if (fileToUpload.type.match('image*')) {
          var reader = new $window.FileReader();
          reader.onload = function (theFile) {
            $scope.userProfile[field] = theFile.target.result;
          };
          reader.readAsDataURL(fileToUpload);
        }

      });
    };

    $scope.createUserAccount = function() {
      $rootScope.busy = true;

      userService.save($scope.userProfile)
        .then(function() {
          var message = 'User account was successfully saved.';
          alertService.success(message);
          if ($scope.userProfile._id === $scope.user._id) {
            $rootScope.user = $scope.userProfile;
            $cookies.putObject('current-user', $scope.userProfile);
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
  .controller('UserProfileCtrl', function(
    $scope,
    $interval,
    $filter,
    userService,
    appointmentService,
    utility,
    notificationService,
    $rootScope,
    userAppointments,
    alertService) {

    $scope.userAppointments = userAppointments;
    appointmentService.defaultEntrance()
      .then(function(response) {
        $scope.defaultEntrance = response;
      })
      .catch(function(reason) {
        notificationService.setTimeOutNotification(reason);
      });




    $scope.toggleAppointmentApproval = function(appointment_id, index) {
      var dialogParams = {
        modalHeader: 'Appointment Approval'
      };

      dialogParams.modalBodyText = 'Are you sure you want to approve this appointment?';

      function removeApprovedAppointment(index, appointment) {
        $scope.userAppointments.appointmentsAwaitingApproval.splice(index, 1);
        var upcomingAppointmentLastIndex = $scope.userAppointments.upcomingAppointments.length - 1;
        $scope.userAppointments.upcomingAppointments.splice(upcomingAppointmentLastIndex, 0, appointment);
        $filter('limitTo')($scope.userAppointments.appointmentsAwaitingApproval, 5);
        $filter('limitTo')($scope.userAppointments.upcomingAppointments, 5);
      }

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
                  if (!$scope.userAppointments.upcomingAppointments) $scope.userAppointments.upcomingAppointments = [];
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
  .controller('ChangePasswordCtrl', function(
    $scope,
    $state,
    $stateParams,
    userService,
    alertService,
    $rootScope,
    notificationService
  ) {

    $rootScope.busy = false;
    $scope.userPassword = {};

    $scope.changeAccountPassword = function() {
      $rootScope.busy = true;
      var user = userService.user;
      user.password = $scope.userPassword.new_password;
      userService.save(user)
        .then(function() {
          alertService.messageToTop.success('Password changed successfully.');
          $rootScope.busy = false;
          $state.go("home");
        })
        .catch(function(reason) {
          $rootScope.busy = false;
          notificationService.setTimeOutNotification(reason);
        });
    }
  });

var resolveToState = function() {
  return {

  };
};
