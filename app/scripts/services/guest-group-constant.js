'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.guestGroupConstant
 * @description
 * # guestGroupConstant
 * Constant in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .constant('guestGroupConstant', [
    {
      "group_type": "Banned"
    },
    {
      "group_type": "VIP"
    },
    {
      "group_type": "Normal"
    }
  ]);
