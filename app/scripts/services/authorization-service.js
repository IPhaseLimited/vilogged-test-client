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
    var currentUser = userService.user;

    function authorize(requiredPermission) {
      if(currentUser) return currentUser[requiredPermission];
    }

    function canPerformAdminActions() {
      return currentUser.is_superuser;
    }

    this.canEditAppointment = function(appointment) {
      return parseInt(appointment.host.id) === parseInt(currentUser.id) || currentUser.is_superuser;
    };

    this.canViewAppointment = function(appointment) {
      return !currentUser.is_superuser || !currentUser.is_staff || parseInt(appointment.host.id) === parseInt(currentUser.id);
    };

    this.canCreateAppointment = function(visitor) {
      return visitor.group_type !== 'Banned';
    };

    this.canEditProfile = function(userId) {
      return user.id === currentUser.id || currentUser.is_superuser;
    };

    this.canCheckInOrCheckOutVisitor = function() {
      return currentUser.is_staff || currentUser.is_superuser;
    };

    this.authorize = authorize;
    this.canModifyUser = canPerformAdminActions;
    this.canModifyDepartment = canPerformAdminActions;
    this.canModifyEntrance =  canPerformAdminActions;
  });
