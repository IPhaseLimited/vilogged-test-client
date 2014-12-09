'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.notificationService
 * @description
 * # notificationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('notificationService', function notificationService($modal, $http, $q, growl, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var BACKEND = config.api.backend.split(':');
    var PORT = BACKEND.pop();
    var BASE_URL = BACKEND.join('');


    function sendMessage(objectParams, apiUrl) {
      var deferred = $q.defer();

      $http.post(apiUrl, objectParams)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    }

    this.setTimeOutNotification = function(reason) {

      if (reason === 'timeout' || reason === null) {
        growl.addErrorMessage('it looks like your network is experiencing some problem');
      } else if (Object.prototype.toString.call(reason) === '[object Object]' && parseInt(reason.status) === 0) {
        growl.addErrorMessage('it looks like your network is experiencing some problem');
      } else {

      }
      return reason;
    };

    this.modal = {};
    this.modal.confirm = function(paramObject) {
      var modalInstance = $modal.open({
        templateUrl: 'views/partials/confirm-dialog.html',
        controller: function($scope, $modalInstance){
          paramObject = angular.isDefined(paramObject) ? paramObject : {};
          if((Object.keys(paramObject)).length){
            $scope.modalHeader = angular.isDefined(paramObject.modalHeader) ? paramObject.modalHeader : 'Notification!';
            $scope.modalBodyText = angular.isDefined(paramObject.modalBodyText) ? paramObject.modalBodyText : '';
            $scope.modalBodyList = angular.isDefined(paramObject.modalBodyList) ? paramObject.modalBodyList : [];
          }
          $scope.closeDialog = $modalInstance.dismiss;
          $scope.confirm = $modalInstance.close;
        }
      });

      return modalInstance.result;
    };

    this.send = {
      sms: function(smsParams) {
        sendMessage(smsParams, BASE_URL+':8088/api/send-sms')
          .then(function(response) {
            var message = response;
          })
          .catch(function(reason) {

          });
      },
      email: function(emailParams) {
        sendMessage(emailParams, BASE_URL+':8088/api/send-mail')
          .then(function(response) {
            var message = response;
          })
          .catch(function(reason) {

          });
      }
    };

  });
