'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.userService
 * @description
 * # userService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('userService', function userService($q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.getAllUsers = function () {
      var deferred = $q.defer();

      var users = [
        {
          "id": 1,
          "username": "sam1",
          "email": "sam@ekonzult.com1",
          "first_name": "Samson1",
          "last_name": "Quaye1",
          "is_staff": true,
          "is_active": true,
          "is_superuser": false,
          "user_profile": {
            "user_id": 1,
            "phone": "080678765989871",
            "home_phone": "",
            "work_phone": "",
            "department": null,
            "id": 1
          }
        },
        {
          "id": 2,
          "username": "sam2",
          "email": "sam@ekonzult.com2",
          "first_name": "Samson2",
          "last_name": "Quaye2",
          "is_staff": true,
          "is_active": true,
          "is_superuser": false,
          "user_profile": {
            "user_id": 2,
            "phone": "080678765989872",
            "home_phone": "",
            "work_phone": "",
            "department": null,
            "id": 2
          }
        },
        {
          "id": 3,
          "username": "sam3",
          "email": "sam@ekonzult.com3",
          "first_name": "Samson3",
          "last_name": "Quaye3",
          "is_staff": true,
          "is_active": true,
          "is_superuser": false,
          "user_profile": {
            "user_id": 3,
            "phone": "080678765989873",
            "home_phone": "",
            "work_phone": "",
            "department": null,
            "id": 3
          }
        },
        {
          "id": 4,
          "username": "sam4",
          "email": "sam@ekonzult.com4",
          "first_name": "Samson4",
          "last_name": "Quaye4",
          "is_staff": true,
          "is_active": true,
          "is_superuser": false,
          "user_profile": {
            "user_id": 4,
            "phone": "080678765989874",
            "home_phone": "",
            "work_phone": "",
            "department": null,
            "id": 4
          }
        }
      ];

      deferred.resolve(users);
      return deferred.promise;
    }
  });
