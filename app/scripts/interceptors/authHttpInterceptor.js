'use strict';

angular.module('cloudpoxee').factory('AuthHttpInterceptor', function($log, $q, $timeout, $rootScope, Session, growl) {
  return {
    request: function(httpConfig) {
      if (Session.isAuthenticated() ) {
        httpConfig.headers['X-Auth-Sid'] = Session.sessionId;
        // X-Auth-SlnTkn TODO Allow remember me
      }
      return httpConfig;
    },
    response: function(response) {
      if (response.status !== 200) {
        return $q.reject(response);
      } else {
        return response;
      }
    },
    responseError: function(rejection) {
      switch(rejection.status) {
        case 401:
          $log.debug('Response error: Unauthorized. Redirect to login.');
          Session.destroy();
          $timeout(function() { $rootScope.$emit('logout'); });
          break;
        case 403:
          $log.debug('Response error: Forbidden.');
          growl.error('FORBIDDEN_REQUEST');
          break;
        case 0:
          // It is not really possible to get HTTP status codes with the JSONP
          if (rejection.config.method !== 'JSONP') {
            $log.debug('Response error: No connection! Internet is down. Is Cors enabled?');
            $timeout(function() { $rootScope.$emit('logout'); });
          }
          $log.debug('Response error: Request rejected. Status ' + rejection.status);
          break;
        default:
          $log.debug('Response error: Request rejected. Status ' + rejection.status);
      }
      return $q.reject(rejection);
    }
  };
}).config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthHttpInterceptor');
});
