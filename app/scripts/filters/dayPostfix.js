'use strict';

angular.module('cloudpoxee.filters').filter('dayPostfix', function($translate) {
  return function (n) {
        if ('es_ES' === $translate.use()) {
          return n;
        }
        var num = parseInt(n, 10);
        var response = num % 10;
        if (response === 1) {
            return num + 'st';
        } else if (response === 2) {
            return num + 'nd';
        } else {
            return num + 'th';
        }
    };
});
