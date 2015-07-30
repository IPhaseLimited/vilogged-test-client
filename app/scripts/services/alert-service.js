'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.alertService
 * @description
 * # alertService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('alertService', function alertService(utility, toastr) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function error(message) {
     toastr.error(message);
    }

    function success(message) {
      toastr.success(message);
    }

    function info(message) {
      toastr.info(message);
    }

    function warning(message) {
      toastr.warning(message);
    }

    this.messageToTop = {
      error: function(message) {
        utility.scrollToTop();
        toastr.error(message);
      },
      success: function(message) {
        utility.scrollToTop();
        toastr.success(message);
      },
      warning: function(message) {
        utility.scrollToTop();
        toastr.warning(message);
      },
      info: function(message) {
        utility.scrollToTop();
        toastr.info(message);
      }
    };

    this.error = error;
    this.success = success;
    this.warning = warning;
    this.info = info;


  });
