'use strict';

angular.module('cloudpoxee.controllers').controller('ChangePasswordCtrl', function($log, $scope, $state, $stateParams, CloudAPI) {
  $log.debug('CloudPoxee forgot password controller...');

  // --------------------------------------------------------------------------
  // Handles login flow
  // --------------------------------------------------------------------------
  $scope.changePasswordRequestBean = {
    password: '',
    passwordConfirm: '',
    token: $stateParams.token
  };

  $scope.changePassword = function(email, changePasswordRequestBean) {
    $log.debug('Requesting to change password for', email, changePasswordRequestBean);

    CloudAPI.changePassword(email, changePasswordRequestBean).then(function() {
      $state.go('passwordChanged');
  	}, function() {
  		$log.debug('Changing password failed...');
      $scope.hasError = true;
      $scope.changePasswordRequestBean.password = '';
      $scope.changePasswordRequestBean.passwordConfirm = '';
  	});
  };

});
