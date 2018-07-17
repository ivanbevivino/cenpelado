'use strict';

angular.module('cloudpoxee').factory('LoadingHttpInterceptor', function($log, $q, $timeout, Utilities) {
  var numLoadings = 0;

  return {
    request: function(httpConfig) {
      if (httpConfig.url.lastIndexOf(cpconfig.API_URL, 0) === 0 && httpConfig.url.indexOf('automatic') < 0) {
        numLoadings++;
        Utilities.loading(true);
      }
      return httpConfig;
    },
    response: function(response) {
      if (response.config.url.lastIndexOf(cpconfig.API_URL, 0) === 0 && response.config.url.indexOf('automatic') < 0) {
        numLoadings--;
        if (numLoadings === 0) {
          $timeout(function() {
            Utilities.loading(false);
          }, 250);
        }
      }
      return response;
    },
    responseError: function (response) {
      if (response.config.url.lastIndexOf(cpconfig.API_URL, 0) === 0 && response.config.url.indexOf('automatic') < 0) {
        numLoadings--;
        if (numLoadings === 0) {
          $timeout(function() {
            Utilities.loading(false);
          }, 250);
        }
      }
      return $q.reject(response);
    }
  };
}).config(function($httpProvider) {
  $httpProvider.interceptors.push('LoadingHttpInterceptor');
});
