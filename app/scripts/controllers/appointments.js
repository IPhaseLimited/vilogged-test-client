'use strict';

//TODO:: Work on model validations

angular.module('viLoggedClientApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('appointments', {
        parent: 'root.index',
        url: '/appointments',
        templateUrl: 'views/appointments/index.html',
        controller: 'AppointmentCtrl',
        data: {
          requiredPermission: 'is_active',
          label: 'Appointments'
        },
        ncyBreadcrumb: {
          label: 'Appointments'
        }
      })
      .state('show-appointment', {
        parent: 'root.index',
        url: '/appointments/:appointment_id',
        templateUrl: 'views/appointments/detail.html',
        controller: 'AppointmentDetailCtrl',
        data: {
          label: 'Appointment Detail'
        },
        ncyBreadcrumb: {
          label: 'Appointment Detail',
          parent: 'appointments'
        }
      })
      .state('create-appointment-visitor', {
        parent: 'root.index',
        url: '/appointments/add/:visitor_id',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          label: 'Create Appointment'
        },
        ncyBreadcrumb: {
          label: 'Create Appointment',
          parent: 'appointments'
        }
      })
      .state('create-appointment-host', {
        parent: 'root.index',
        url: '/appointments/add/:host_id',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          requiredPermission: 'is_active',
          label: 'Create Appointment'
        },
        ncyBreadcrumb: {
          label: 'Create Appointment',
          parent: 'appointments'
        }
      })
      .state('create-appointment', {
        parent: 'root.index',
        url: '/appointments/add/',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Create Appointment'
        },
        ncyBreadcrumb: {
          label: 'Create Appointment',
          parent: 'appointments'
        }
      })
      .state('edit-appointment', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/edit/',
        templateUrl: 'views/appointments/form.html',
        controller: 'AppointmentFormCtrl',
        data: {
          requiredPermission: 'is_active',
          label: 'Edit Appointment'
        },
        ncyBreadcrumb: {
          label: 'Edit Appointment',
          parent: 'appointments'
        }
      })
      .state('visitor-check-in', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/check-in',
        templateUrl: 'views/appointments/check-in.html',
        controller: 'CheckInCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Check Visitor In'
        },
        ncyBreadcrumb: {
          label: 'Check Visitor In',
          parent: 'appointments'
        }
      })
      .state('print-visitor-label', {
        url: '/appointments/:appointment_id/print-pass',
        templateUrl: 'views/appointments/visitor-pass.html',
        controller: 'VisitorPassCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Print Visitor Tag'
        },
        ncyBreadcrumb: {
          label: 'Print Visitor Tag',
          parent: 'appointments'
        }
      })
      .state('visitor-check-out', {
        parent: 'root.index',
        url: '/appointments/:appointment_id/check-out',
        templateUrl: 'views/appointments/check-out.html',
        controller: 'CheckOutCtrl',
        data: {
          requiredPermission: 'is_staff',
          label: 'Check Visitor Out'
        },
        ncyBreadcrumb: {
          label: 'Check Visitor Out',
          parent: 'appointments'
        }
      })
  })
  .controller('AppointmentCtrl', function($scope, appointmentService, utility) {
    $scope.busy = true;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 10;

    $scope.isAppointmentUpcoming = function(appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() < appointmentTimeStamp;
    };

    $scope.isAppointmentExpired = function(appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() > appointmentTimeStamp;
    };

    appointmentService.all()
      .then(function(response) {
        $scope.appointments = response;
        $scope.totalItems = $scope.appointments.length;
        $scope.numPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
        $scope.busy = false
      })
      .catch(function(reason) {
        console.log(reason);
        $scope.busy = false
      });
  })
  .controller('AppointmentDetailCtrl', function($scope, $state, $stateParams, appointmentService, utility, $modal, growl,
                                                 notificationService) {
    $scope.busy = true;
    appointmentService.getNested($stateParams.appointment_id)
      .then(function(response) {
        $scope.appointment = response;
        console.log($scope.appointment)
        $scope.busy = false;
      })
      .catch(function(reason) {
        $scope.busy = false;
        console.log(reason);
      });

    $scope.printLabel = function() {
      $scope.busy = true;
      $modal.open({
        templateUrl: 'views/appointments/partials/visitor-pass-template.html',
        controller: function($scope, $modalInstance, appointmentService) {
          $scope.$modalInstance = $modalInstance;
          appointmentService.getNested($stateParams.appointment_id)
            .then(function(response) {
              $scope.appointment = response;
              $scope.busy = false;
            })
            .catch(function(reason) {
              $scope.busy = false;
              console.log(reason);
            });
        }
      });
    };


    $scope.toggleAppointmentApproval = function(approvalStatus) {
      var dialogParams = {
        modalHeader: 'Appointment Approval'
      };

      dialogParams.modalBodyText = approvalStatus ? 'Are you sure you want to approve this appointment?' :
        'Are you sure you want to disapprove this appointment?';

      $scope.busy = true;
      notificationService.modal.confirm(dialogParams)
        .then(function() {
          appointmentService.get($stateParams.appointment_id)
            .then(function(response) {
              response.is_approved = approvalStatus;
              response.entrance_id = 'd970f3aa81d4432b8c3ae33ca8e7cd9a';
              appointmentService.save(response)
                .then(function() {
                  approvalStatus ? growl.addSuccessMessage('The selected appointment has been approved.') :
                    growl.addErrorMessage('The selected appointment has been rejected.');
                  $scope.busy = false;
                  $state.go('appointments');
                })
                .catch(function(reason) {
                  $scope.busy = false;
                  console.log(reason);
                });
            })
            .catch(function(reason) {
              $scope.busy = false;
              console.log(reason);
            });
        });
    };

    $scope.isAppointmentUpcoming = function(appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() < appointmentTimeStamp;
    };

    $scope.isAppointmentExpired = function(appointmentDate) {
      var appointmentTimeStamp = utility.getTimeStamp(appointmentDate);
      return new Date().getTime() > appointmentTimeStamp;
    };
  })
  .controller('AppointmentFormCtrl', function($scope, $stateParams, $state, $timeout, $filter, visitorService, growl,
                                               userService, appointmentService, utility, validationService) {
    $scope.busy = false;
    $scope.appointment = {};
    $scope.visit_start_time = new Date();
    $scope.visit_end_time = new Date();
    $scope.host = {};
    $scope.visitor = {};
    $scope.customErrors = {};

    $scope.clearError = function(key) {
      delete $scope.customErrors[key];
    };

    $scope.appointmentDate = {
      opened: false,
      open: function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.opened = true
      }
    };

    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.getHost = function(hostPhone) {
      $scope.busy = true;
      if (!hostPhone) {
        $scope.busy = false;
        return;
      }
      userService.getUserByPhone(hostPhone)
        .then(function(response) {
          $scope.busy = false;
          $scope.host.selected = response[0];
          console.log(response[0]);
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        });
    };

    $scope.hostLookUp = {
      refreshHostsList: function(phone) {
        $scope.busy = true;
        if (!phone) {
          $scope.busy = false;
          return;
        }
        userService.getUserByPhone(phone)
          .then(function(response) {
            $scope.busy = false;
            $scope.hosts = response;
          })
          .catch(function(reason) {
            $scope.busy = false;
            console.log(reason);
          });
      },
      listHosts: function() {
        $scope.busy = true;
        userService.all()
          .then(function(response) {
            $scope.busy = false;
            $scope.hosts = response;
          })
          .catch(function(reason) {
            $scope.busy = false;
            console.log(reason);
          })
      }
    };

    $scope.visitorLookUp = {
      refreshVisitorsList: function(visitorPhone) {
        $scope.busy = true;
        visitorService.findByPhone(visitorPhone)
          .then(function(response) {
            $scope.busy = false;
            $scope.visitors = response;
          })
          .catch(function(reason) {
            $scope.busy = false;
            console.log(reason);
          })
      },
      listVisitors: function() {
        $scope.busy = true;
        visitorService.all()
          .then(function(response) {
            $scope.busy = false;
            $scope.visitors = response;
          })
          .catch(function(reason) {
            $scope.busy = false;
            console.log(reason);
          })
      }
    };

    if (angular.isDefined($scope.user)) {
      if (!$scope.user.is_staff && $scope.user.is_active) $scope.host = $scope.user;

      if ($scope.user.is_staff) $scope.hostLookUp.listHosts();

      if ($scope.user.is_active) $scope.visitorLookUp.listVisitors();
    }

    if ($stateParams.visitor_id) {
      $scope.busy = true;
      visitorService.get($stateParams.visitor_id)
        .then(function(response) {
          $scope.busy = false;
          $scope.visitor.selected = response;
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        })
    }

    if ($stateParams.host_id) {
      $scope.busy = true;
      userService.get($stateParams.host_id)
        .then(function(response) {
          $scope.busy = false;
          $scope.host.selected = response;
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        })
    }

    $scope.createAppointment = function() {
      $scope.busy = true;
      $scope.appointment.label_code = utility.generateRandomInteger();
      $scope.appointment.appointment_date = $filter('date')($scope.appointment.appointment_date, 'yyyy-MM-dd');
      $scope.appointment.is_expired = false;
      $scope.appointment.checked_in = null;
      $scope.appointment.checked_out = null;

      appointmentService.findByField('visitor_id', $scope.visitor.selected.uuid)
        .then(function(response){
          var existingAppointment = response.filter(function(appointment) {
            return appointment.host_id === $scope.appointment.host.selected.id  && !appointment.checked_out
              && (!appointment.is_expired || utility.getTimeStamp(appointment) < new Date().getTime());
          });


          if (existingAppointment.length) {
            growl.addErrorMessage('An appointment with this host can\'t be created.');
            if (!$scope.user.is_active) {
              $scope.busy = false;
              $state.go('show-visitor', {visitor_id: $scope.visitor.selected.uuid});
            } else {
              $scope.busy = false;
              $state.go('appointments');
            }
          }
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        });

      $scope.appointment.visit_start_time = $filter('date')($scope.visit_start_time, 'hh:mm a');
      $scope.appointment.visit_end_time = $filter('date')($scope.visit_end_time, 'hh:mm a');

      $scope.appointment.host_id = angular.isDefined($scope.host.selected) ? $scope.host.selected.id : undefined;
      $scope.appointment.visitor_id = angular.isDefined($scope.visitor.selected) ? $scope.visitor.selected.uuid : undefined;

      var validationParams = {
        appointment_date: validationService.BASIC,
        visit_start_time: validationService.BASIC,
        visit_end_time: validationService.BASIC,
        purpose: validationService.BASIC,
        host_id: validationService.BASIC,
        visitor_id: validationService.BASIC
      };

      $scope.validationErrors = validationService.validateFields(validationParams, $scope.appointment);
      if (!Object.keys($scope.validationErrors).length) {
        $scope.appointment.entrance_id = 'd970f3aa81d4432b8c3ae33ca8e7cd9a';
        $scope.busy = true;
        $scope.appointment.entrance_id = 'd970f3aa81d4432b8c3ae33ca8e7cd9a';
        appointmentService.save($scope.appointment)
          .then(function(response) {
            $scope.busy = false;
            growl.addSuccessMessage( 'Appointment was successfully created' );
            $scope.user.is_active ? $state.go('appointments') : $state.go('visitors', {visitor_id: $stateParams.visitor_id});
          })
          .catch(function(reason) {
            $scope.busy = false;
            if (angular.isObject(reason)) {
              Object.keys(reason).forEach(function(key) {
                $scope.validationErrors[key] = reason[key];
              });
            }
            console.log(reason);
          });
      }
    };
  })
  .controller('CheckInCtrl', function($scope, $state, $stateParams, $q, visitorService, appointmentService, entranceService,
                                       vehicleTypeConstant, notificationService, utility, restrictedItemsService,
                                       vehicleService, growl) {
    $scope.appointment = {};
    $scope.restricted_items = [{
      item_code: '',
      item_name: '',
      item_type: ''
    }];
    $scope.default = {};
    $scope.vehicle = {};
    $scope.vehicleTypes = vehicleTypeConstant;
    $scope.restrictedItemsErrors = {};

    $scope.busy = true;
    entranceService.all()
      .then(function(response) {
        $scope.busy = false;
        $scope.entrances = response;
      })
      .catch(function(reason) {
        $scope.busy = false;
        console.log(reason);
      });

    $scope.busy = true;
    appointmentService.get($stateParams.appointment_id)
      .then(function(response) {
        $scope.busy = false;
        $scope.appointment = response;
        if (angular.isUndefined($scope.restricted_items)) {
          $scope.restricted_items = [{
            item_code: '',
            item_name: '',
            item_type: ''
          }];
        }
      })
      .catch(function(reason) {
        $scope.busy = false;
        console.log(reason);
      });

    $scope.busy = true;
    appointmentService.getNested($stateParams.appointment_id)
      .then(function(response) {
        $scope.busy = false;
        $scope.appointmentView = response;
        if (angular.isUndefined($scope.restricted_items)) {
          $scope.restricted_items = [{
            item_code: '',
            item_name: '',
            item_type: ''
          }];
        }
      })
      .catch(function(reason) {
        $scope.busy = false;
        console.log(reason);
      });

    $scope.checkItemScope = function() {
      if ($scope.item === false) {
        $scope.restricted_items = [];
      }
    };

    function validateItems() {
      var errors = {};
      $scope.restricted_items.forEach(function(item, index) {

        Object.keys(item).forEach(function(key) {
          if (!item[key]) {
            errors[index + key] = 'Please enter item value to continue';
          }
        });
      });

      $scope.restrictedItemsErrors = errors;
      return Object.keys(errors).length === 0;
    }

    $scope.addItem = function() {
      if (!angular.isDefined($scope.item)) {
        $scope.item = true;
        return;
      }

      if ($scope.item === false) {
        $scope.item = true;
      }
      if (validateItems()) {
        $scope.restricted_items.push({
          item_code: '',
          item_name: '',
          item_type: ''
        });
      }

    };

    $scope.removeItem = function(index) {
      $scope.restricted_items.splice(index, 1);

      if ($scope.restricted_items.length === 0) {
        $scope.item = false;
      }
    };

    function itemNotEmpty(item) {
      var empty = [];
      Object.keys(item).forEach(function(key) {
        if (angular.isUndefined(item[key]) || item[key] === '') {
          empty.push(item);
        }
      });
      return empty.length === 0;
    }

    $scope.checkVisitorIn = function() {

      $scope.appointment.checked_in = utility.getISODateTime();
      $scope.appointment.label_code = utility.generateRandomInteger();

      var restricted = [];
      $scope.restricted_items.forEach(function(item) {
        if (itemNotEmpty(item)) {
          item.appointment_id = $scope.appointment.uuid;
          restricted.push(restrictedItemsService.save(item));
        }
      });

      $scope.vehicle.appointment_id = $scope.appointment.uuid;
      var promises = [
        appointmentService.save($scope.appointment),
        vehicleService.save($scope.vehicle),
        restricted
      ];

      if ($scope.withVehicle) {
        promises.push(vehicleService.save($scope.vehicle));
      }

      if (restricted.length) {
        promises.push(restricted);
      }

      $scope.busy = true;
      $q.all(promises)
        .then(function() {
          $scope.busy = false;
          growl.addSuccessMessage('User checked in successfully.');
          $state.go('appointments');
        })
        .catch(function(reason) {
          $scope.busy = false;
          console.log(reason);
        });
    }
  })
  .controller('CheckOutCtrl', function ($scope, $state, $stateParams, appointmentService, utility, notificationService, growl) {
    $scope.busy = true;
    appointmentService.get($stateParams.appointment_id)
      .then(function (response) {
        $scope.appointment = response;
        checkOut(response);
      })
      .catch(function (reason) {
        console.log(reason);
        $scope.busy = false;
      });

    function checkOut(response) {
      response.checked_out = utility.getISODateTime();
      appointmentService.save(response)
        .then(function (response) {
          growl.addSuccessMessage('Visitor checked out successfully.');
          $state.go('appointments');
          $scope.busy = false;
        })
        .catch(function(reason) {
          console.log(reason);
          $scope.busy = false;
        });
    }
  })
  .controller('VisitorPassCtrl', function($scope, $state, $stateParams, appointmentService) {
    $scope.appointment = {};
    console.log($stateParams.appointment_id);

    $scope.busy = true;
    appointmentService.getNested($stateParams.appointment_id)
      .then(function(response) {
        $scope.busy = false;
        $scope.appointment = response;
      })
      .catch(function(reason) {
        $scope.busy = false;
        console.log(reason);
      })
  });
