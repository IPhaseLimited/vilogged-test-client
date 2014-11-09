'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.utility
 * @description
 * # utility
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('utility', function utility() {
    // AngularJS will instantiate a singleton by calling "new" on this function

    /**
     *
     * @param {object} array
     * @param {string} id will be the object key
     * @returns {{}}
     */
    this.castArrayToObject = function (array, id) {
      id = angular.isUndefined(id) ? 'uuid' : id;
      var newObject = {};
      if (Object.prototype.toString.call(array) === '[object Array]') {
        for (var i = 0; i < array.length; i++) {
          newObject[array[i][id]] = array[i];
        }
      }
      return newObject;
    };

    /**
     * This function scrolls to top of the page where it is called,
     *
     * #see 'top' is the id of a href element defined in views/index/index.html
     */
    this.scrollToTop = function () {
      $location.hash('top');
      $anchorScroll();
    };

    var isDateObject = function (date) {
      return Object.prototype.toString.call(date) === '[object Date]';
    };

    var removeObjFromCollection = function (obj, collection, key) {
      collection = collection.filter(function (item) {
        if (typeof item[key] === 'undefined' || typeof obj[key] === 'undefined') {
          throw 'both objects compared must have the property(key).';
        }
        return item[key] !== obj[key];
      });
      return collection;
    };

    this.addObjectToCollection = function (obj, collections, key) {
      var _obj = JSON.parse(obj);
      if (_obj.deSelected === undefined) {
        collections.push(_obj);
        return collections;
      }
      return removeObjFromCollection(_obj, collections, key);
    };

    this.spaceOutUpperCaseWords = function (upperCaseWord) {
      return upperCaseWord.split(/(?=[A-Z])/).join(' ');
    };

    this.copy = function (src, des) {
      if (typeof src !== 'undefined') {
        //src obj already exists, update des obj.
        for (var key in src) {
          des[key] = src[key];
        }
      }
      return des;
    };

    this.ellipsize = function (string, length) {
      if (length < 1) {
        return '';
      }
      if (string && string.length > length) {
        string = string.substr(0, length - 1) + '…';
      }
      return string;
    };

    /**
     * Does the object contain the given key(s)?
     *
     * The same as {@link http://underscorejs.org/#has}, but supports nested keys.
     *
     * @param {object} obj an object
     * @param {string} path a key (or keys) in the object, e.g. 'a.b.c'
     * @return {boolean} true if obj contains path(s), otherwise false
     */
    this.has = function (obj, path) {
      if (!(obj && path)) {
        return false;
      }

      path = path.split('.').reverse();
      for (var i = path.length - 1; i >= 0; i--) {
        if (!Object.prototype.hasOwnProperty.call(obj, path[i])) {
          return false;
        }
        obj = obj[path[i]];
      }
      return true;
    };

    /**
     * This accepts an object, iterates over the objects keys and push the value into an array.
     * @param obj
     * @returns {Array}
     */
    this.convertObjectToArray = function (obj) {
      var list = [];
      for (var key in obj) {
        var data = obj[key];
        list.push(data);
      }
      return list;
    };

    this.getStringUuid = function (uuidObj) {
      var uuidString = uuidObj;
      if (typeof uuidObj === 'string') {
        uuidString = uuidObj;
      } else if (Object.prototype.toString.call(uuidObj) === '[object Object]') {
        uuidString = uuidObj.uuid;
      }
      return uuidString;

    };

    this.values = function(obj) {
      var values = [];
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          values.push(obj[key]);
        }
      }
      return values;
    };

    this.uuidGenerator = function() {
      var now = Date.now();
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // jshint bitwise: false
        var r = (now + Math.random() * 16) % 16 | 0;
        now = Math.floor(now / 16);
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });
    };

    this.pluck = function(arr, key) {
      return arr.map(function(e) {
        return e[key];
      });
    };

    this.getDateTime = function() {
      return new Date().toJSON();
    };

    this.generateRandomInteger = function() {
      return Date.now();
    }

    this.toTitleCase = function (str) {
      return (str||"").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

  });
