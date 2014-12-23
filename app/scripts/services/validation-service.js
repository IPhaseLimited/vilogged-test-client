'use strict';

/**
 * @ngdoc service
 * @name viLoggedClientApp.validationService
 * @description
 * # validationService
 * Service in the viLoggedClientApp.
 */
angular.module('viLoggedClientApp')
  .service('validationService', function validationService() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var emailPattern = /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
    var usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

    var BASIC = function() {
      return {
        required: true,
        pattern: '',
        checkLength: false,
        minLength: 0,
        maxLength: 0,
        unique: false,
        dbName: '',
        type: 'basic'
      };
    };

    var INT = function(){
      return {
        required: false,
          pattern: '/^[0-9]/',
        checkLength: false,
        minLength: 0,
        maxLength: 0,
        unique: false,
        dbName: '',
        type: 'int'
      };
    };

    var EMAIL = function() {
      return {
        required: false,
          pattern: emailPattern,
        checkLength: false,
        unique: false,
        dbName: '',
        fieldName: '',
        dataList: [],
        type: 'email'
      };
    };

    var USERNAME = function() {
      return {
        required: false,
        pattern: usernamePattern,
        checkLength: true,
        minLength: 3,
        maxLength: 20,
        unique: false,
        dbName: '',
        fieldName: '',
        dataList: [],
        type: 'username'
      };
    };

    function validateRequired(fieldData, _params) {
      var params = angular.isDefined(_params) && angular.isObject(_params) ? _params :BASIC();
      return (fieldData === '' || fieldData === undefined) && params.required ? ['This field is required'] : [];
    }

    function validateStringLength(fieldData, _params) {
      var params = angular.isDefined(_params) && angular.isObject(_params) ? _params : BASIC();
      var messages = [];
      if (params.checkLength && params.minLength > fieldData.length) {
        messages.push('character length is less than ' + params.minLength);
      }

      if (params.checkLength && params.maxLength !== 0 && fieldData.length > params.maxLength) {
        messages.push('you have exceeded the maximum characters allowed (' + params.maxLength + ')');
      }
      return messages;
    }

    function validateInt(fieldData, _params) {
      var params = angular.isDefined(_params) && angular.isObject(_params) ? _params : BASIC();
      var messages = [];
      if (params.pattern !== '' && params.pattern.test(fieldData)) {
        messages.push('Only integers are allowed.');
      }
      return messages;
    }

    function validateEmail(fieldData, _params) {
      var params = angular.isDefined(_params) && angular.isObject(_params) ? _params : EMAIL();
      var messages = [];
      if (fieldData !== '' && fieldData !== undefined && params.pattern.test(fieldData)) {
        messages.push('invalid email provided');
      }
      if (params.unique && params.dbName !== '' && fieldData !== undefined && params.fieldName !== '' && params.dataList.length > 0) {
        var filteredData = params.dataList
          .filter(function(dbData) {
            return angular.isDefined(dbData[params.fieldName]) && dbData[params.fieldName] === fieldData;
          });
        if (filteredData.length > 0) {
          messages.push('Email provided already exist');
        }
      }
      return messages;
    }

    function validateUsername(fieldData, _params) {
      var params = angular.isDefined(_params) && angular.isObject(_params) ? _params : USERNAME();
      var messages = [];
      if (fieldData !== '' && fieldData !== undefined && params.pattern.test(fieldData)) {
        messages.push('invalid email provided');
      }
      if (params.unique && params.dbName !== '' && fieldData !== undefined && params.fieldName !== '' && params.dataList.length > 0) {
        var filteredData = params.dataList
          .filter(function(dbData) {
            return angular.isDefined(dbData[params.fieldName]) && dbData[params.fieldName] === fieldData;
          });
        if (filteredData.length > 0) {
          messages.push('Username provided already exist');
        }
      }
      return messages;
    }

    function validateFields(params, formModelObject) {
      var errors = {};
      if (angular.isObject(params) && (Object.keys(params)).length > 0) {
        (Object.keys(params)).forEach(function(key) {
          var messages = [];
          var fieldData = formModelObject[key];
          var required = validateRequired(fieldData, params[key]);
          var lengthValidation = angular.isDefined(fieldData) ? validateStringLength(fieldData, params[key]) : [];
          var emailValidation = params[key].type === 'email' && angular.isDefined(fieldData) ? validateEmail(fieldData, params[key]) : [];
          var usernameValidation = params[key].type === 'username' && angular.isDefined(fieldData) ? validateUsername(fieldData, params[key]) : [];
          var intValidation = params[key].type === 'int' && angular.isDefined(fieldData) ? validateInt(fieldData, params[key]) : [];
          var updatedMessages = messages.concat(required, lengthValidation, emailValidation, usernameValidation, intValidation);

          if (updatedMessages.length > 0) {
            errors[key] = updatedMessages;
          }
        });
      }
      return errors;
    }

    this.BASIC = BASIC;
    this.EMAIL = EMAIL;
    this.USERNAME = USERNAME;
    this.INT = INT;
    this.validateFields = validateFields
  });
