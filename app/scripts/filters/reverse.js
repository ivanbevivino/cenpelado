'use strict';

angular.module('cloudpoxee.filters').filter('reverse', function () {
  return function (item) {
    if (item !== null) {
      var message = 'A <strong>' + item.action.toLowerCase() + '</strong> is about to occur on <strong>' +
        item.instanceName + '</strong>.';
      return message;
    }
  };
});
