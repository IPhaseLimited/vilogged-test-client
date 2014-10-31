'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.appointmentService
 * @description
 * # appointmentService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('appointmentService', function appointmentService($q, storageService, utility, db) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.APPOINTMENTS;

    function getAllAppointments() {
      return storageService.all(DB_NAME);
    }

    function getAppointmentsByUser(user) {
      var deferred = $q.defer();
      getAllAppointments(DB_NAME)
        .then(function(response){
          var filtered = response
            .filter(function(appointment) {
              return appointment.host.id === user.id;
            });

          deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    this.get = function(id) {
      return storageService.find(DB_NAME, id);
    };

    this.all = getAllAppointments;

    this.getAppointmentsByUser = getAppointmentsByUser;

    this.getUpcomingAppointments = function(user) {
      var deferred = $q.defer();
      getAppointmentsByUser(user)
        .then(function(response) {
          var filtered = response
            .filter(function(appointment) {
              return appointment.is_approved &&
              new Date(appointment.appointment_date).getTime() > new Date().getTime() &&
                !appointment.is_expired;
            });
        })
        .catch(function(reason) {
          deferred.resolve(reason);
        });

      return deferred.promise;
    };

    this.getAppointmentsAwaitingApproval = function(user) {
      var deferred = $q.defer();
      getAppointmentsByUser(user)
        .then(function(response) {
          var filtered = response
            .filter(function(appointment) {
              return !appointment.is_approved && !appointment.is_expired;
            });

          deferred.resolve(filtered);
        }).
        catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }
  });
