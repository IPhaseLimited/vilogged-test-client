'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.notificationService
 * @description
 * # notificationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('notificationService', function notificationService($modal) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.modal = {};
    this.modal.confirm = function (paramObject) {
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
  });