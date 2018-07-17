'use strict';

angular.module('cloudpoxee.controllers').controller('CredentialsCtrl',
function($log, $aside, $rootScope, $scope, $timeout, $interval, $state, $filter, $q, CloudAPI, credentials, growl, CredentialsOptions) {

  var aside = null;

  var scope = null;

  var prepareCredentials = function(credentials) {
    angular.forEach(credentials, function (credential) {
      if (credential.provider === 'AMAZON') {
        if (angular.isDefined(credential.accessKey) && angular.isDefined(credential.secretKey)) {
          credential.type = 'AMAZON_TYPE';
          credential.identifier = credential.accessKey;
        } else {
          credential.type = 'AMAZON_ROLE_TYPE';
          credential.identifier = credential.roleArn;
        }
      } else {
        credential.type = 'SOFTLAYER_TYPE';
        credential.identifier = credential.username;
      }
    });
    return credentials;
  };

  $log.debug('CloudPoxee credentials controller...', credentials);

  $scope.credentials = prepareCredentials(credentials.data);

  var mapAccountTypeToEditView = function(accountType) {
      switch (accountType) {
          case 'AMAZON_TYPE':
            return 'ACCESS_KEY_VIEW';
          case 'SOFTLAYER_TYPE':
            return 'SOFTLAYER_VIEW';
          case 'AMAZON_ROLE_TYPE':
            return 'IAM_VIEW';
      }
  };

  var executing = false;

  $scope.toggleGovCloud = function() {
    scope.credential.isGovCloud = !scope.credential.isGovCloud;
  };

  $scope.editCredential = function($event, credential) {
    $log.debug('Edit credential information for', credential.name);
    if (executing) return;
    executing = true;
    $event.stopPropagation();
    $timeout(function() {
        $log.debug('Open Credentials Aside Widget');
        scope = $scope;
        // Clone credential values to new variable so that header/background doesn't re-render on every update of the original values
        scope.credential = angular.copy(credential);
        scope.view = mapAccountTypeToEditView(credential.type);
        aside = $aside({
          scope: scope,
          container: 'body',
          placement: 'right',
          templateUrl: 'views/credentials/edit-credential-base-aside.html',
          backdrop: 'static'
        });
        executing = false;
    });
  };

  $scope.saveEdit = function() {
      var df;
      switch (scope.credential.type) {
          case 'AMAZON_TYPE':
              df = CloudAPI.updateAmazonAccount(scope.credential);
              break;
          case 'SOFTLAYER_TYPE':
              df = CloudAPI.updateSoftLayerAccount(scope.credential);
              break;
          case 'AMAZON_ROLE_TYPE':
              df = CloudAPI.updateAmazonRoleAccount(scope.credential);
              break;
      };
      df.then(function () {
          growl.success('CREDENTIAL_SAVED');
          refreshCredentials();
          aside.hide();
      }, function () {
          growl.error('CREDENTIAL_SAVE_ERROR');
      });
  };

  $scope.deleteCredentials = function() {
    var selectedCredentials = $filter('filter')($scope.credentials, { active: true });
    if (selectedCredentials.length > 0) {
      var requests = [];
      for (var i = 0; i < selectedCredentials.length; i++) {
          switch (selectedCredentials[i].type) {
              case 'AMAZON_TYPE':
                requests.push(CloudAPI.deleteAmazonAccount(selectedCredentials[i].id));
                break;
              case 'SOFTLAYER_TYPE':
                requests.push(CloudAPI.deleteSoftLayerAccount(selectedCredentials[i].id));
                break;
              case 'AMAZON_ROLE_TYPE':
                requests.push(CloudAPI.deleteAmazonRoleAccount(selectedCredentials[i].id));
                break;
          };
      }
      $q.all(requests).then(function() {
        growl.success('CREDENTIALS_REMOVED');
        refreshCredentials();
      });
    } else {
      growl.warning('CREDENTIALS_SELECTION');
    }
  };

  $scope.toggleAll = function () {
    angular.forEach($scope.credentials, function (row) {
      row.active = ($scope.allActive) ? false : true;
    });
    $scope.allActive = !$scope.allActive;
  };

  $scope.toggleOne = function (row) {
    $scope.allActive = false;
    row.active = !row.active;
  };

  // -- Refresh credentials

  function refreshCredentials() {
    CloudAPI.getCredentials().then(function(credentials) {
      angular.forEach($scope.credentials, function(credential) {
        if (credential.active) {
          angular.forEach(credentials.data, function(updatedEnvironment) {
            if (updatedEnvironment.name === credential.name) {
              updatedEnvironment.active = true;
            }
          });
        }
      });
      $scope.credentials = prepareCredentials(credentials.data);
    });
  }

  // -- New Credential Dropdown options

  CredentialsOptions.setOptions($scope, 'ddOptions', 'credentials', refreshCredentials);

});
