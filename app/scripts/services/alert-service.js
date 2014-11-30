'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.alertService
 * @description
 * # alertService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('alertService', function alertService(utility, growl) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function error(message) {
      growl.addErrorMessage(message);
    }

    function success(message) {
      growl.addSuccessMessage(message);
    }

    function info(message) {
      growl.addInfoMessage(message);
    }

    function warning(message) {
      growl.addWarnMessage(message);
    }

    this.messageToTop = {
      error: function(message) {
        utility.scrollToTop();
        growl.addErrorMessage(message);
      },
      success: function(message) {
        utility.scrollToTop();
        growl.addSuccessMessage(message);
      },
      warning: function(message) {
        utility.scrollToTop();
        growl.addErrorMessage(message);
      },
      info: function(message) {
        utility.scrollToTop();
        growl.addErrorMessage(message);
      }
    };

    this.error = error;
    this.success = success;
    this.warning = warning;
    this.info = info;


  });
