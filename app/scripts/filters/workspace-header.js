'use strict';

angular.module('cloudpoxee.filters').filter('workspaceHeader', function($filter) {
  return function (value, field, fieldType) {
    if (value) {
      if (field in value) {
        if ('percent' === fieldType) {
          return $filter('number')(value[field], 0) + '%';
        } else if ('time' === fieldType) {
          return $filter('number')(value[field], 1) + 's';
        } else if ('text' === fieldType) {
          return value[field];
        }
      }
    }
    return '-';
  };
});
