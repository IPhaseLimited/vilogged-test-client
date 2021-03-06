'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.authorizationService
 * @description
 * # authorizationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('authorizationService', function authorizationService($q, $rootScope, userService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var currentUser = userService.user, _this = this;

    _this.authorize = function(requiredPermission) {
      if(currentUser) return currentUser[requiredPermission];
    };

    _this.canPerformAdminActions = function() {
      return currentUser.is_superuser;
    };

    _this.canEditAppointment = function(appointment) {
      return parseInt(appointment.host_id._id) === parseInt(currentUser._id) || currentUser.is_superuser;
    };

    this.canViewAppointment = function(appointment) {
      return !currentUser.is_superuser || !currentUser.is_staff || parseInt(appointment.host_id._id) === parseInt(currentUser._id);
    };

    this.canCreateAppointment = function(visitor) {
      return !visitor.group.black_listed;
    };

    this.canEditProfile = function(user) {
      return user._id === currentUser._id || currentUser.is_superuser;
    };

    this.canCheckInOrCheckOutVisitor = function() {
      return currentUser.is_staff || currentUser.is_superuser;
    };

    this.allowedPages = {
      staff: [
        'profile',
        'editUser',
        'change-password',
        'visitors',
        'create-visitor-profile',
        'edit-visitor-profile',
        'show-visitor',
        'home',
        'visitor-check-in',
        'visitor-check-out',
        'create-appointment',
        'create-appointment-visitor',
        'appointments',
        'show-appointment',
        'edit-appointment',
        'logout',
        'login'
      ],
      visitors: [
        'show-visitor',
        'create-appointment-visitor',
        'logout',
        'login'
      ],
      users: [
        'profile',
        'appointments',
        'create-appointment-host',
        'create-appointment-visitor',
        'create-appointment',
        'show-appointment',
        'edit-appointment',
        'logout',
        'login',
        'create-visitor-profile',
        'edit-visitor-profile',
        'show-visitor',
        'visitors'
      ]
    };

  });
