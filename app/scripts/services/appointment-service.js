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
          deferred.resolve(filtered);
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
          deferred.resolve(filtered)
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function currentAppointments() {
      var deferred = $q.defer();
      getAllAppointments()
        .then(function (response) {
          var currentAppointments = response
            .filter(function (appointment) {
              var startTime = utility.getTimeStamp(appointment.appointment_date, appointment.start_time);
              var endTime = utility.getTimeStamp(appointment.appointment_date, appointment.end_time);
              var date = new Date().getTime();
              return appointment.is_approved && ( date >= startTime || date <= endTime) && appointment.check_in;
            });
          deferred.resolve(currentAppointments);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function appointmentsByDay(date) {
      var deferred = $q.defer();
      var searchTimeStamp = angular.isDefined(date) ? utility.getTimeStamp(date) : utility.getTimeStamp(moment().format('l'));
      getAllAppointments()
        .then(function(response) {
          var appointments = response
            .filter(function (appointment) {
              var appointmentTimeStamp = utility.getTimeStamp(appointment.appointment_date);
              return searchTimeStamp === appointmentTimeStamp;
            });
          deferred.resolve(appointments);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function appointmentsByPeriod(date, period) {
      var deferred = $q.defer();
      date = angular.isDefined(date) ? date : moment().format('l');
      //TODO:: look for a better way to set moment date;
      moment()._d = date;
      var weekStartedOn = utility.getTimeStamp(moment().startOf(period));
      var weekEndedOn = utility.getTimeStamp(moment().endOf(period));
      getAllAppointments()
        .then(function (response) {
          var appointments = response
            .filter(function(appointment) {
              var appointmentTimeStamp = utility.getTimeStamp(appointment.appointment_date);
              return appointmentTimeStamp >= weekStartedOn || appointmentTimeStamp <= weekEndedOn;
            });
          deferred.resolve(appointments);
        })
        .catch(function (reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function appointmentByWeek (date) {
      return appointmentsByPeriod(date, 'week');
    }

    function appointmentByMonth (date) {
      return appointmentsByPeriod(date, 'month');
    }

    this.get = get;
    this.all = getAllAppointments;
    this.save = save;
    this.getUserUpcomingAppointments = getUserUpcomingAppointments;
    this.getAppointmentsByUser = getAppointmentsByUser;
    this.getAppointmentsAwaitingApproval = getAppointmentsAwaitingApproval;
    this.getVisitorUpcomingAppointments = getVisitorUpcomingAppointments;
    this.getAppointmentsByVisitor = getAppointmentsByVisitor;
    this.getCurrentAppointments = currentAppointments;
    this.getAppointmentsByWeek = appointmentByWeek;
    this.getAppointmentsByMonth = appointmentByMonth;
    this.getAppointmentsByDay = appointmentsByDay;
  });
