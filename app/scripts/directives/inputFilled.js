'use strict';

angular.module('cloudpoxee.directives').directive('inputFilled', function ($log) {
  return {
    restrict: 'A',
    scope: {
      inputFilled: '='
    },
    link: function (scope, element) {
      var parent = element;
      var input = element.children().first();
      $log.debug(element, input, input.val().length);

      scope.$watch('inputFilled', function () {
        if (scope.inputFilled && scope.inputFilled.toString().length > 0) {
          parent.addClass('input--filled');
        } else {
          parent.removeClass('input--filled');
        }
      });
    }
  };
});
