'use strict';

angular.module('db.names', [])

  .constant('db', {
    APPOINTMENTS: 'appointments',
    COMPANY_DEPARTMENTS: 'company_departments',
    ENTRANCE: 'company_entrance',
    RESTRICTED_ITEMS: 'resisted_items',
    VEHICLE: 'vehicle',
    VISITORS: 'visitors',
    VISITORS_LOCATION: 'visitors_location'
  });
