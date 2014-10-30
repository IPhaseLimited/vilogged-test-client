'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.vehicleType
 * @description
 * # vehicleType
 * Value in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .constant('vehicleTypeConstant', [
    {
      "vehicle_type": "Car"
    },
    {
      "vehicle_type": "Bus"
    },
    {
      "vehicle_type": "Motor Cycle"
    },
    {
      "vehicle_type": "Tri-Cycle"
    }
  ]);
