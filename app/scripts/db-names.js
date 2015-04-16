'use strict';

angular.module('db.names', [])

  .constant('db', {
    APPOINTMENTS: 'appointment',
    COMPANY_DEPARTMENTS: 'company_department',
    ENTRANCE: 'company_entrance',
    RESTRICTED_ITEMS: 'restricted_item',
    VEHICLE: 'vehicle',
    VISITORS: 'visitor',
    VISITORS_LOCATION: 'visitors_location',
    Visitor_Group: 'visitors_group'
  });
