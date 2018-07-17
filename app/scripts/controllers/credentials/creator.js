'use strict';

angular.module('cloudpoxee.controllers').controller('CredentialsCreatorCtrl', function($log, $scope, $state, $stateParams, growl, CloudAPI, cloudpoxeeServerCredentials) {

  $log.debug('CloudPoxee Credentials Creator controller...');

  $scope.credential = {
    id: new Date().getUTCMilliseconds(),
    accountName: null,
    credentialType: null,
    identifier: null,
    accountType: null,
    isGovCloud: false,
    externalId: cloudpoxeeServerCredentials.externalId,
    accountReach: 'REGULAR'
  };

  $scope.cloudpoxeeServerCredentials = cloudpoxeeServerCredentials;

  $scope.toggleGovCloud = function() {
    $scope.credential.isGovCloud = !$scope.credential.isGovCloud;
  };

  $scope.saveCredential = function (credentialType) {
    if ($scope.credential.identifier === null) {
      $scope.credential.identifier = $scope.cloudpoxeeServerCredentials.externalId;
    }
    var df;
    switch (credentialType) {
        case 'AMAZON_TYPE':
            df = CloudAPI.addAmazonAccount($scope.credential);
            break;
        case 'SOFTLAYER_TYPE':
            df = CloudAPI.addSoftLayerAccount($scope.credential);
            break;
        case 'AMAZON_ROLE_TYPE':
            df = CloudAPI.addAmazonRoleAccount($scope.credential);
            break;
    };
    df.then(function () {
      growl.success('CREDENTIAL_SAVED');
      $state.go('app.credentials');
    }, function () {
      growl.error('CREDENTIAL_SAVE_ERROR');
    });
  };
});
