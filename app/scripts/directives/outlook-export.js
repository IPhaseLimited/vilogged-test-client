'use strict';

/**
 * @ngdoc directive
 * @name viLoggedClientApp.directive:outlookExport
 * @description
 * # outlookExport
 */
(function(window, document) {
  angular.module('viLoggedClientApp')
    .directive('outlookExport', function ($document, $timeout, $filter) {
      return {

        restrict: 'AC',
        scope: {
          data: '&outlookData',
          icsData: '=outlookData',
          ngClick: '&'
        },
        link: function postLink(scope, element, attrs) {
          function doClick() {
            if (window.navigator.msSaveOrOpenBlob) {
              var blob = new Blob([scope.icsData], {
                type: "text/calender;charset=utf-8;"
              });
              navigator.msSaveBlob(blob, 'appointment.ics');
            } else {

              var downloadLink = angular.element('<a></a>');
              downloadLink.attr('href', 'data:text/calender;charset=utf-8,'+encodeURIComponent(scope.icsData));
              downloadLink.attr('download', 'cal-'+$filter('date')(new Date(), 'yyyy-MM-dd-HH-mm-ss')+'.ics');

              $document.find('body').append(downloadLink);
              $timeout(function () {
                downloadLink[0].click();
                downloadLink.remove();
              }, null);
            }

          }

          element.bind('click', function (e) {
            doClick();
            scope.$apply();
          });
        }
      };
    });
}) (window, document);
