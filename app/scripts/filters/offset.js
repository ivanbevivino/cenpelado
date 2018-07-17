'use strict';

angular.module('cloudpoxee.filters').filter('offset', function() {
  return function(input, start) {
    if (input) {
      start = parseInt(start, Math.min(input.length, 10));
      return input.slice(start);
    }
    return input;
  };
});
