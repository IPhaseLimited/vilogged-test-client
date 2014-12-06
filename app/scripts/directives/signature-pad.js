'use strict';

/**
 * @ngdoc directive
 * @name viLoggedClientApp.directive:signaturePad
 * @description
 * # signaturePad
 */
angular.module('viLoggedClientApp')
  .directive('signaturePad', function () {
    return {
      template: '<div></div>',
      scope: {
        'signature': '=signature'
      },
      restrict: 'A',
      link: function (scope, element, attrs) {
        var signaturePad = new SignaturePad(element);
      }
    };
  });
