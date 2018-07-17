'use strict';

angular.module('cloudpoxee.controllers').controller('AccountCtrl', function($log, $scope, $timeout, $state, growl, Utilities, CloudAPI) {
  $log.debug('CloudPoxee account controller...');
  $scope.checked = false;
  $scope.createAccount = function(account) {
    if (_.isEmpty(account.customerName) || _.isEmpty(account.name) ||
      _.isEmpty(account.lastName) || _.isEmpty(account.email) || _.isEmpty(account.password)) {
      growl.error('ACCESS_DETAILS_ERROR');
    } else if (!Utilities.validateEmail(account.email)) {
      growl.error('ACCESS_EMAIL_ERROR');
    } else if (!$scope.checked) {
      $log.debug($scope.checked);
      growl.error('ACCESS_TERMS_ERROR');
    } else {
      $log.debug('Creating account...');
      CloudAPI.createUser(account).then(function() {
        $timeout(function() {
          $state.go('accountCreated');
        });
      }, function() {
        growl.error('ACCCESS_ACCOUNT_CREATE_ERROR');
      });
    }
  };

  $scope.toggleTerms = function() {
    $scope.checked = !$scope.checked;
  };

});
