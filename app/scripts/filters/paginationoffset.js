'use strict';

/**
 * @ngdoc filter
 * @name viLoggedClientApp.filter:paginationOffset
 * @function
 * @description
 * # paginationOffset
 * Filter in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .filter('paginationOffset', function ($filter) {
    return function (input, currentPage, itemsPerPage) {
      if (angular.isArray(input) && angular.isNumber(currentPage) && angular.isNumber(itemsPerPage)) {
        var startIndex = (currentPage - 1) * itemsPerPage;
        console.log(startIndex);
        if (input.length < startIndex) {
          return [];
        } else {
          return $filter('limitTo')(input.slice(startIndex), itemsPerPage);
        }
      } else {
        return input;
      }
    };
  });
