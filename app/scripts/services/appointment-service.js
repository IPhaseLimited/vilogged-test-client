'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.appointmentService
 * @description
 * # appointmentService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('appointmentService', function appointmentService($q, db, $http, storageService, utility, syncService,
                                                             entranceService, config, $filter) {

    // AngularJS will instantiate a singleton by calling "new" on this function
    var DB_NAME = db.APPOINTMENTS, _this = this;
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';

    _this.APPOINTMENT_APPROVAL_EMAIL_TEMPLATE = 'Hello &&first_name&& &&last_name&&,\n\nYour appointment with &&host_first_name&& &&host_last_name&& has been approved.'
      + '\n\nYour appointment is scheduled for\n\nDate:&&date&& \nExpected Check in Time: &&start_time&&' +
      '\n\nNigerian Communication Commission';

    _this.APPOINTMENT_APPROVAL_SMS_TEMPLATE = 'Hello &&first_name&& &&last_name&&, your appointment with &&host_first_name&& &&host_last_name&& has been approved.'
      + ' Your appointment is scheduled for Date:&&date&& Expected Check in Time: &&end_time&&';

    _this.APPOINTMENT_CREATED_EMAIL_TEMPLATE = 'Hello &&first_name&& &&last_name&&,\n\nYou have an appointment awaiting your approval\n\n'+
      'Nigerian Communication Commission';

    _this.APPOINTMENT_CREATED_SMS_TEMPLATE = 'Hello &&first_name&& &&last_name&&, you have an appointment awaiting your approval';

    _this.all = function(options) {
      return storageService.all(DB_NAME, options);
    };

    _this.get = function(id, options) {
      return storageService.find(DB_NAME, id, options);
    };

    _this.getByUser = function(user) {
      var deferred = $q.defer();
      if (user) {
        storageService.all(DB_NAME, {host_id: user._id})
          .then(function(response) {
            deferred.resolve(response);
          })
          .catch(function(reason) {
            deferred.reject(reason);
          });
      }

      return deferred.promise;
    };

    _this.getByVisitor = function(visitor) {
      var deferred = $q.defer();
      storageService.all(DB_NAME)
        .then(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    _this.save = function(object) {
      return storageService.save(DB_NAME, object);
    };

    _this.getUserUpcomingAppointments = function(user) {
      var deferred = $q.defer();
      _this.getByUser(user)
        .then(function(response) {
          var filtered = utility.filter(response, function (row) { return row.is_approved && new Date(row.appointment_date).getTime() > new Date().getTime() && !row.expired;});
          deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.resolve(reason);
        });

      return deferred.promise;
    };

    _this.appointmentsAwaitingApprovalFilter = function(response) {
      return utility.filter(response, function(row) {return !row.is_approved && !row.expired && new Date(row.appointment_date).getTime() > new Date().getTime();});
    };

    _this.getUserAppointmentsAwaitingApproval = function(user) {
      var deferred = $q.defer();
      _this.getByUser(user)
        .then(function(response) {
          var filtered = _this.appointmentsAwaitingApprovalFilter(response);
          deferred.resolve(filtered);
        }).
        catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    _this.getVisitorUpcomingAppointments = function (visitor_id) {
      var deferred = $q.defer();

      storageService.all(DB_NAME, {visitor_id: visitor_id})
        .then(function(response) {
          var filtered = utility.filter(response, function(row) {return row.is_approved && new Date(row.appointment_date).getTime() > new Date().getTime() && !row.expired;});
          deferred.resolve(filtered)
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });


      return deferred.promise;
    };

    _this.appointmentsByDay = function(date) {
      var deferred = $q.defer();
      var searchTimeStamp = angular.isDefined(date) ? utility.getTimeStamp(date) : utility.getTimeStamp(moment().format('l'));
      _this.all()
        .then(function(response) {
          var appointments = utility.filter(response, function(row) {return utility.getTimeStamp(row.appointment_date) === searchTimeStamp;});
          deferred.resolve(appointments);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    _this.appointmentsByPeriod = function(date, period) {
      var deferred = $q.defer();
      date = angular.isDefined(date) ? date : moment().format('l');
      //TODO:: look for a better way to set moment date;
      moment()._d = date;
      var weekStartedOn = utility.getTimeStamp(moment().startOf(period));
      var weekEndedOn = utility.getTimeStamp(moment().endOf(period));
      _this.all()
        .then(function(response) {
          var appointments = utility.filter(response, function(row) {
            var appointmentTimeStamp = utility.getTimeStamp(row.appointment_date);
            return appointmentTimeStamp >= weekStartedOn || appointmentTimeStamp <= weekEndedOn;
          });

          deferred.resolve(appointments);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    _this.appointmentByWeek = function(date) {
      return _this.appointmentsByPeriod(date, 'week');
    };

    _this.appointmentByMonth = function(date) {
      return _this.appointmentsByPeriod(date, 'month');
    };

    _this.defaultEntrance = function() {
      var deferred = $q.defer();
      entranceService.all()
        .then(function(response) {
          if (response.length) {
            deferred.resolve(response[0].uuid);
          } else {
            entranceService.save({name: 'Main Gate'})
              .then(function(response) {
                deferred.resolve(response.uuid);
              })
              .catch(function(reason) {
                deferred.reject(reason);
              });
          }

        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    /*
     * Finds an existing but unexpired appointment with a host.
     * cancel save if one is found
     * */
    _this.findExistingAppointment = function(visitorId, hostId) {
      var deferred = $q.defer();
      storageService.all(DB_NAME, {visitor_id: visitorId, host_id: hostId, is_expired: false})
        .then(function(response){
          var existingAppointment = utility.filter(response, function(row) {return row.checked_out && (utility.getTimeStamp(row.appointment_date) < new Date().getTime());});
          existingAppointment.length ? deferred.reject('Selected visitor has pending appointment with selected host, ' +
          'kindly conclude pending appointment first') :
            deferred.resolve('');
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
    };

    _this.hasPendingAppointment = function(appointmentObject) {
      var deferred = $q.defer();
      var params = {
        visitor_id: appointmentObject.visitor_id,
        host_id: appointmentObject.host_id,
        is_expired: false
      };

      storageService.all(DB_NAME, params)
        .then(function(response) {
          if (response.length) {
            var pendingAppointments = utility.filter(response, function(appointment){
              var date = new Date();
              var end =  (appointment.appointment_date + ' '+ $filter('date')(appointment.visit_end_time, 'HH:mm:ss')).split(/[\s|:|-]/);
              var todayTimeStamp = new Date(date.getYear(),date.getMonth(), date.getDate()).getTime();
              var appointmentEndTime = (new Date(end[0], end[1]-1, end[2], end[3], end[4], end[5]).toJSON()).replace(/[-|:]/g, '').split('.')[0]+'Z';
              var appointmentEndTimeStamp = new Date(appointmentEndTime).getTime();
              return appointmentEndTimeStamp > todayTimeStamp;
            });

            if (pendingAppointments.length) {
              deferred.resolve(true);
            } else {
              deferred.resolve(false);
            }
          } else {
            deferred.resolve(false);
          }
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    };

    _this.remove = function(appointmentId) {
      return storageService.removeRecord(DB_NAME, appointmentId);
    };

    function outLookCalenderTemplate() {

      return 'BEGIN:VCALENDAR\n' +
      'VERSION:2.0\n'+
      'PRODID:-//vilogged.com v1.0//EN\n'+
      'BEGIN:VEVENT\n'+
      'DTSTAMP:&&startDate&&\n'+ //20140510T093846Z
      'ORGANIZER;CN=&&visitorsName&&:MAILTO:&&visitorsMail&&\n'+
      'STATUS:CONFIRMED\n'+
      'DTSTART:&&startDate&&\n'+//20140510T093846Z
      'DTEND:&&endDate&&\n'+ //20140511T093846Z
      'SUMMARY:&&appointSummary&&\n'+
      'DESCRIPTION:&&appointmentDesc&&\n'+
      'X-ALT-DESC;FMTTYPE=text/html:&&appointmentDesc&&\n'+
      'LOCATION:&&location&&\n'+
      'END:VEVENT\n'+
      'END:VCALENDAR';
    }

    _this.getOutlookCalender = function(appointment) {

      var start = (appointment.appointment_date + ' '+ $filter('date')(appointment.visit_start_time, 'HH:mm:ss')).split(/[\s|:|-]/);
      var end =  (appointment.appointment_date + ' '+ $filter('date')(appointment.visit_end_time, 'HH:mm:ss')).split(/[\s|:|-]/);

      var startTime = (new Date(start[0], start[1]-1, start[2], start[3], start[4], start[5]).toJSON()).replace(/[-|:]/g, '').split('.')[0]+'Z';
      var endTime = (new Date(end[0], end[1]-1, end[2], end[3], end[4], end[5]).toJSON()).replace(/[-|:]/g, '').split('.')[0]+'Z';

      var params = {
        startDate: startTime,
        endDate: endTime,
        visitorsName: appointment.visitor_id.first_name,
        visitorsMail: appointment.visitor_id.visitors_email,
        appointSummary: '',
        appointmentDesc: '',
        location: 'NCC Nigeria'
      };

      return utility.compileTemplate(params, outLookCalenderTemplate());
    };

    _this.isAppointmentUpcoming = function(appointmentDate, visitStartTime) {
      var start = (appointmentDate + ' '+ $filter('date')(visitStartTime, 'HH:mm:ss')).split(/[\s|:|-]/);
      var startTime = new Date(start[0], start[1]-1, start[2], start[3], start[4], start[5]);
      return new Date().getTime() <= startTime.getTime();
    };

    _this.isAppointmentExpired = function(appointmentDate, visitEndTime) {
      var end =  (appointmentDate + ' '+ $filter('date')(visitEndTime, 'HH:mm:ss')).split(/[\s|:|-]/);
      var endTime = new Date(end[0], end[1]-1, end[2], end[3], end[4], end[5]);
      return new Date().getTime() >= endTime.getTime();
    };

    this.getUpdates = syncService.getUpdates;

  });
