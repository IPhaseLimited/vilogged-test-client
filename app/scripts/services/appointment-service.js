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
        .then(function (response) {
          var filtered = response
            .filter(function (appointment) {
              return appointment.host.id === user.id;
            });

          deferred.resolve(filtered);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function save(object) {
      return storageService.save(DB_NAME, object);
    }

    function getUserUpcomingAppointments(user) {
      var deferred = $q.defer();
      getAppointmentsByUser(user)
        .then(function (response) {
          var filtered = response
            .filter(function (appointment) {
              return appointment.is_approved &&
                new Date(appointment.appointment_date).getTime() > new Date().getTime() && !appointment.is_expired;
            });
        })
        .catch(function (reason) {
          deferred.resolve(reason);
        });

      return deferred.promise;
    }

    function get(id) {
      return storageService.find(DB_NAME, id);
    }

    function getAppointmentsAwaitingApproval(user) {
      var deferred = $q.defer();
      getAppointmentsByUser(user)
        .then(function (response) {
          var filtered = response
            .filter(function (appointment) {
              return !appointment.is_approved && !appointment.is_expired;
            });

          deferred.resolve(filtered);
        }).
        catch(function (reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getAppointmentsByVisitor(visitor_id) {
      var deferred = $q.defer();
      getAllAppointments(DB_NAME)
        .then(function (response) {
          var filtered = response
            .filter(function (appointment) {
              return appointment.visitor.id === visitor_id;
            });

          deferred.resolve(filtered);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getVisitorUpcomingAppointments(visitor_id) {
      var deferred = $q.defer();
      getAppointmentsByUser(visitor_id)
        .then(function (response) {
          var filtered = response
            .filter(function (appointment) {
              return appointment.is_approved &&
                new Date(appointment.appointment_date).getTime() > new Date().getTime() && !appointment.is_expired;
            });
        })
        .catch(function (reason) {
          deferred.resolve(reason);
        });

      return deferred.promise;
    }

    this.get = get;
    this.all = getAllAppointments;
    this.getAppointmentsByUser = getAppointmentsByUser;
    this.save = save;
    this.getUserUpcomingAppointments = getUserUpcomingAppointments;
    this.getAppointmentsAwaitingApproval = getAppointmentsAwaitingApproval;
    this.getVisitorUpcomingAppointments = getVisitorUpcomingAppointments;
    this.getAppointmentsByVisitor = getAppointmentsByVisitor;
  });
