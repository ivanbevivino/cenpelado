'use strict';

angular.module('cloudpoxee.controllers').controller('AccessCtrl', function($log, $scope, $state, AuthService, CloudAPI, USER_ROLES, growl, RedirectAPI) {
  $log.debug('CloudPoxee access controller...');

  // --------------------------------------------------------------------------
  // Handles login flow
  // --------------------------------------------------------------------------
  $scope.credentials = {
    email: '',
    password: '',
    authCode: ''
  };

  $scope.login = function(credentials) {
    AuthService.login(credentials).then(function(data) {
      // There is some cases were login fails with no error, so we need to handle this case
      if (angular.isUndefined(data) || data == null ) {
        $log.debug('User credentials validation failed...');
        $scope.hasError = true;
        growl.error('Unknown error/Server down');
      } else if (data.error) {
        $log.debug('Login invalid...');
        $scope.hasError = true;
        $scope.credentials.password = '';
        $scope.credentials.authCode = '';

        growl.error(data.error);
      } else if(data==""){
        $scope.hasError = true;
        $scope.credentials.password = '';
        $scope.credentials.authCode = '';

        growl.error('User credentials validation failed...');
      } else{
        $log.debug('Login successful...', data);

        if ($.inArray(USER_ROLES.CH_USER_ADMIN, data.user.roles) >= 0) {
          CloudAPI.getCredentials().then(function(response) {
            if (response.data.length === 0) {
              $state.go('app.welcome');
            } else {
              RedirectAPI.homeRedirect();
            }
          });
        } else {
          RedirectAPI.homeRedirect();
        }
      }
    });
  };

});
