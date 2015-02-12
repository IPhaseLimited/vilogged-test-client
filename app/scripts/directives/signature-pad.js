'use strict';

/**
 * @ngdoc directive
 * @name viLoggedClientApp.directive:signaturePad
 * @description
 * # signaturePad
 */
angular.module('viLoggedClientApp')
  .directive('jSignature', ['$timeout', '$rootScope',
    function ($timeout, $rootScope) {
      return {
        restrict: 'EA',
        scope: {
          model: '=jSignature',
          penColor: '@',
          lineColor: '@',
          readonly: '=',
          lock: '='
        },
        link: function (scope, element, attrs, controller) {
          var undoButton = function () {
            var undoButtonStyle = 'position:absolute;display:none;margin:0 !important;top:auto';
            var $undoButton = $('<button type="button" class="btn btn-xs btn-default" style="' + undoButtonStyle +
            '">Undo Last Stroke</button>').appendTo(this.$controlbarLower);
            var buttonWidth = $undoButton.width();
            $undoButton.css('left', Math.round(( this.canvas.width - buttonWidth ) / 2));
            return $undoButton;
          };

//          element.on('click', function (event) {
//            var canvas = element.find('canvas')[0];
//            canvas.requestPointerLock = canvas.requestPointerLock ||
//            canvas.mozRequestPointerLock ||
//            canvas.webkitRequestPointerLock;
//
//            event.target.setCapture();
//          });

          // Create Settings Object
          var settings = {
            UndoButton: undoButton
          };
          if (scope.lineColor) {
            settings['decor-color'] = scope.lineColor;
          }
          if(scope.penColor) {
            settings.color = scope.penColor;
          }

          settings.width = 700;
          settings.height = 200;

          // Build jSignature Element
          element.jSignature(settings);

          // Watch Model
          scope.$watch('model', function(newValue, oldValue) {
            if (typeof newValue !== 'undefined') {
              var value = newValue.split(',');
              if (value[1] && value[1].length > 0) {
                try {
                  element.jSignature("setData", "data:" + newValue);
                } catch (e) {
                  console.log('Nim: jSignature - Bad format while trying to setData', e);
                }
              } else {
                element.jSignature('reset');
              }
            }
          });

          // Watch readOnly
          scope.$watch('readonly', function (newValue, oldValue) {
            if(newValue === true) {
              element.jSignature('disable');
              // Hide undo button
              element.find('button').css({'display': 'none'});
            } else {
              element.jSignature('enable');
              if (scope.model) {
                var currentModel = scope.model.split(',');
                // Show undo button only if there are actions to undo?
                if (currentModel[1] && currentModel[1].length > 0) {
                  element.find('button').css({'display': 'block'});
                }
              }
            }
          });


          // Bind to jSignature Event
          element.bind('change', function(e){
            // $timeout, 100, true because event happens outside angular's digest cycle
            // and change is called on setData
            $timeout(function () {
              // getData returns an array of [mimetype, string of jSignature's custom Base30-compressed format]
              var dataPair = element.jSignature("getData","base30");
              scope.model = dataPair.join(",");
            }, 100, true);
          });
        }
      };
    }
  ]);
