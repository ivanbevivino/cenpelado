'use strict';

angular.module('cloudpoxee.controllers').controller('ForgotPasswordCtrl', function($log, $scope, $state, CloudAPI) {
  $log.debug('CloudPoxee forgot password controller...');

  // --------------------------------------------------------------------------
  // Handles login flow
  // --------------------------------------------------------------------------
  $scope.email ='';

  $scope.changePassword = function(email) {
  	$log.debug('Requesting to change password for', email);
  	CloudAPI.resetPassword(email).then(function() {
      $state.go('login');
  	}, function() {
  		$log.debug('Request password change failed...');
      $scope.hasError = true;
  	});
  };

});
