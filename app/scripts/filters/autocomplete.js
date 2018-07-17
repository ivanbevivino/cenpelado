'use strict';

angular.module('cloudpoxee.filters').filter('autocomplete', function () {
  return function (possibleTags, query) {
    var response = [];
      var searchText = query.toLowerCase();
      angular.forEach(possibleTags, function (tag) {
        if (tag.label.toLowerCase().indexOf(searchText) >= 0) {
          response.push(tag);
        }
      });
      return response;
  };
});
