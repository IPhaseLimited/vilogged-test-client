'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.notificationService
 * @description
 * # notificationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('notificationService', function notificationService($modal, $http, $q, config) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function sendMessage(http, objectParams, apiUrl) {
      var deferred = $q.defer();

      http.post(apiUrl, objectParams)
        .then(function(response) {
          deferred.resolve(response);
        })
        .catch(function(reason) {
          console.log(reason);
        });

      return deferred.promise;
    }

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

    this.message = {};

    this.message.sendSms = function(smsParams, smsApi) {
      var message = {};
      if (!angular.isDefined(smsApi)) {
        smsApi = config.api.smsApi;
      }

      if (!angular.isDefined(smsParams)) {
        smsParams = {};
      }

      //sendMessage($http, smsParams, smsApi)
      //  .then(function(response) {
      //    message = response;
      //  })
      //  .catch(function(reason) {
      //    message = return reason;
      //  });

      return message;
    };

    this.message.sendEmail = function(emailParams, sendApi) {
      var message = {};

      if (!angular.isDefined(emailApi)) {
        emailApi = '';
      }

      if (!angular.isDefined(emailParams)) {
        emailParams = {};
      }

      //sendMessage($http, smsParams, smsApi)
      //  .then(function(response) {
      //    message = response;
      //  })
      //  .catch(function(reason) {
      //    message = return reason;
      //  });

      return message;
    };
  });
