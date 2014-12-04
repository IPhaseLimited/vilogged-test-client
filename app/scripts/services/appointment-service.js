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
    var DB_NAME = db.APPOINTMENTS;
    var BASE_URL = config.api.backend + config.api.backendCommon + '/';

    var APPOINTMENT_APPROVAL_EMAIL_TEMPLATE = 'Hello &&first_name&& &&last_name&&,\n\nYour appointment with &&host_first_name&& &&host_last_name&& has been approved.'
      + '\n\nYour appointment is scheduled for\n\nDate:&&date&& \nExpected Check in Time: &&start_time&&' +
      '\n\nNigerian Communication Commission';

    var APPOINTMENT_APPROVAL_SMS_TEMPLATE = 'Hello &&first_name&& &&last_name&&, your appointment with &&host_first_name&& &&host_last_name&& has been approved.'
      + ' Your appointment is scheduled for Date:&&date&& Expected Check in Time: &&end_time&&';

    var APPOINTMENT_CREATED_EMAIL_TEMPLATE = 'Hello &&first_name&& &&last_name&&,\n\nYou have an appointment awaiting your approval\n\n'+
      'Nigerian Communication Commission';

    var APPOINTMENT_CREATED_SMS_TEMPLATE = 'Hello &&first_name&& &&last_name&&, you have an appointment awaiting your approval';

    function getAllAppointments() {
      //return storageService.all(DB_NAME);

      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/nested/')
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function findByField(field, value) {
      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/?' + field + '=' + value)
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function findByFieldNested(field, value) {
      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/nested/?' + field + '=' + value)
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getNestedAppointmentsByUser(user) {
      var deferred = $q.defer();

      if (user !== undefined) {
        findByFieldNested('host_id__id', user.id)
          .then(function(response) {
            deferred.resolve(response);
          })
          .catch(function(reason) {
            deferred.reject(reason);
          });
      }

      return deferred.promise;
    }

    function getNestedAppointmentsByVisitor(visitor) {
      var deferred = $q.defer();

      findByFieldNested('visitor_id__uuid', visitor)
        .then(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getAppointmentsByUser(user) {
      var deferred = $q.defer();

      findByField('host_id', user.id)
        .then(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
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
        .then(function(response) {
          var filtered = response
            .filter(function(appointment) {
              return appointment.approved &&
                new Date(appointment.appointment_date).getTime() > new Date().getTime() && !appointment.expired;
            });
          deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.resolve(reason);
        });

      return deferred.promise;
    }

    function get(id) {
      return storageService.find(DB_NAME, id);
    }


    function getNested(id) {
      var deferred = $q.defer();

      $http.get(BASE_URL + DB_NAME + '/nested/' + id)
        .success(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function appointmentsAwaitingApprovalFilter(response) {
      return response
        .filter(function(appointment) {
          return !appointment.approved && !appointment.expired && utility.getTimeStamp(appointment.appointment_date) > new Date().getTime();
        });
    }

    function getUserAppointmentsAwaitingApproval(user) {
      var deferred = $q.defer();
      getAppointmentsByUser(user)
        .then(function(response) {
          var filtered = appointmentsAwaitingApprovalFilter(response);

          deferred.resolve(filtered);
        }).
        catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getAppointmentsByVisitor(visitor_id) {
      var deferred = $q.defer();
      getAllAppointments(DB_NAME)
        .then(function(response) {
          var filtered = response
            .filter(function(appointment) {
              return appointment.visitor_id.id === visitor_id;
            });

          deferred.resolve(filtered);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    function getVisitorUpcomingAppointments(visitor_id) {
      var deferred = $q.defer();

      findByField('visitor_id__uuid', visitor_id)
        .then(function(response) {
          var filtered = response
            .filter(function(appointment) {
              return appointment.approved &&
                new Date(appointment.appointment_date).getTime() > new Date().getTime() && !appointment.expired;
            });
          deferred.resolve(filtered)
        })
        .catch(function(reason) {
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
            .filter(function(appointment) {
              var appointmentTimeStamp = utility.getTimeStamp(appointment.appointment_date);
              return searchTimeStamp === appointmentTimeStamp;
            });
          deferred.resolve(appointments);
        })
        .catch(function(reason) {
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
        .then(function(response) {
          var appointments = response
            .filter(function(appointment) {
              var appointmentTimeStamp = utility.getTimeStamp(appointment.appointment_date);
              return appointmentTimeStamp >= weekStartedOn || appointmentTimeStamp <= weekEndedOn;
            });
          deferred.resolve(appointments);
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    function appointmentByWeek(date) {
      return appointmentsByPeriod(date, 'week');
    }

    function appointmentByMonth(date) {
      return appointmentsByPeriod(date, 'month');
    }

    function defaultEntrance() {
      var deferred = $q.defer();
      entranceService.all()
        .then(function(response) {
          if (response.length) {
            deferred.resolve(response[0].uuid);
          } else {
            entranceService.save({
              entrance_name: 'Main Gate'
            })
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
    }

    function findByMultipleFields(object){
      var deferred = $q.defer();
      var params = [];
      Object.keys(object).forEach(function(key) {
        params.push(key+'='+object[key]);
      });
      params = params.join('&');
      $http.get(BASE_URL+DB_NAME+'?'+params)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });
      return deferred.promise;
    }

    /*
     * Finds an existing but unexpired appointment with a host.
     * cancel save if one is found
     * */
    function findExistingAppointment (visitorId, hostId) {
      var deferred = $q.defer();
      appointmentService.findByField('visitor_id', visitorId)
        .then(function(response){
          var existingAppointment = response.filter(function(appointment) {
            if (visitorId === undefined) {
              return false;
            }
            return appointment.host_id === hostId && !appointment.checked_out
              && (!appointment.is_expired || utility.getTimeStamp(appointment) < new Date().getTime());
          });


          existingAppointment.length ? deferred.reject('Selected visitor has pending appointment with selected host, ' +
          'kindly conclude pending appointment first') :
            deferred.resolve('');
        })
        .catch(function(reason) {
          deferred.reject(reason);
        });
    }

    function hasPendingAppointment(appointmentObject) {
      var deferred = $q.defer();
      var params = {
        visitor_id: appointmentObject.visitor_id,
        host_id: appointmentObject.host_id,
        is_expired: false
      };
      findByMultipleFields(params)
        .then(function(response) {
          if (response.length) {
            var pendingAppointments = response.filter(function(appointment){
              var date = new Date();
              var todayTimeStamp = new Date(date.getYear(),date.getMonth(), date.getDate()).getTime();
              var appointmentEndTime = appointment.appointment_date+'T'+appointment.visit_end_time+'Z';
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
    }

    function remove(appointmentId) {
      return storageService.removeRecord(DB_NAME, appointmentId);
    }

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

    function getOutlookCalender(appointment) {

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
    }

    this.get = get;
    this.getNested = getNested;
    this.all = getAllAppointments;
    this.save = save;
    this.remove = remove;
    this.findByField = findByField;
    this.getUserUpcomingAppointments = getUserUpcomingAppointments;
    this.getAppointmentsByUser = getAppointmentsByUser;
    this.getNestedAppointmentsByUser = getNestedAppointmentsByUser;
    this.getUserAppointmentsAwaitingApproval = getUserAppointmentsAwaitingApproval;
    this.getVisitorUpcomingAppointments = getVisitorUpcomingAppointments;
    this.getAppointmentsByVisitor = getAppointmentsByVisitor;
    this.getNestedAppointmentsByVisitor = getNestedAppointmentsByVisitor;
    this.getAppointmentsByWeek = appointmentByWeek;
    this.getAppointmentsByMonth = appointmentByMonth;
    this.getAppointmentsByDay = appointmentsByDay;
    this.defaultEntrance = defaultEntrance;
    this.findExistingAppointment = findExistingAppointment;
    this.hasPendingAppointment = hasPendingAppointment;
    this.getOutlookCalender = getOutlookCalender;
    this.getUpdates = syncService.getUpdates;
    this.APPOINTMENT_APPROVAL_EMAIL_TEMPLATE = APPOINTMENT_APPROVAL_EMAIL_TEMPLATE;
    this.APPOINTMENT_APPROVAL_SMS_TEMPLATE = APPOINTMENT_APPROVAL_SMS_TEMPLATE;
    this.APPOINTMENT_CREATED_EMAIL_TEMPLATE = APPOINTMENT_CREATED_EMAIL_TEMPLATE;
    this.APPOINTMENT_CREATED_SMS_TEMPLATE = APPOINTMENT_CREATED_SMS_TEMPLATE;

  });
