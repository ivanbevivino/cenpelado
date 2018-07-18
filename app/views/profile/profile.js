'use strict';

angular.module('cloudpoxee.controllers').controller('ProfileCtrl', function($log, $rootScope, $scope, $timeout, growl, Utilities, CloudAPI, Session) {
  $log.debug('CloudPoxee profile controller...');
  $scope.updatedUser = angular.copy(Session.user);

  $scope.updateUser = function() {
    if (_.isEmpty($scope.updatedUser.name) || _.isEmpty($scope.updatedUser.lastName) || _.isEmpty($scope.updatedUser.email)) {
      growl.error('VERIFY_REQUIRED_FIELDS');
    } else if (!Utilities.validateEmail($scope.updatedUser.email) ||
      (!_.isEmpty($scope.updatedUser.secondaryEmail) && !Utilities.validateEmail($scope.updatedUser.secondaryEmail))) {
      growl.error('VERIFY_REQUIRED_FIELDS');
    } else {
      CloudAPI.updateUser({
        id: $scope.updatedUser.id,
        name: $scope.updatedUser.name,
        lastName: $scope.updatedUser.lastName,
        email: $scope.updatedUser.email,
        emailSecondary: $scope.updatedUser.emailSecondary
      }).then(function() {
        growl.success('USER_UPDATE_SUCCESS');
        $rootScope.$broadcast('user:changed', angular.copy($scope.updatedUser));
      }, function() {
        growl.error('USER_UPDATE_ERROR');
      });
    }
  };

  $scope.resetPassword = function() {
    CloudAPI.resetPassword(Session.user.email).success(function() {
      growl.success('RESET_PASSWORD_SUCCESS');
    });
  };
});
