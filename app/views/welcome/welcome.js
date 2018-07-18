'use strict';

angular.module('cloudpoxee.controllers').controller('WelcomeCtrl',
  function($log, $scope, $rootScope, $q, $state, $timeout, $modal, growl, Introduction, CloudAPI) {
  $log.debug('CloudPoxee welcome controller...');

  $scope.hideNextTime = false;
  $scope.model = {
    amazon: {
      id: null,
      accessKey: '',
      secretKey: ''
    },
    softlayer: {
      id: null,
      username: '',
      apiKey: ''
    }
  };

  $scope.configureClouds = function() {
    var amazon = $scope.model.amazon;
    var softlayer = $scope.model.softlayer;
    if (((_.isEmpty(amazon.accessKey) && !_.isEmpty(amazon.secretKey)) ||
        (!_.isEmpty(amazon.accessKey) && _.isEmpty(amazon.secretKey))) ||
        ((_.isEmpty(softlayer.username) && !_.isEmpty(softlayer.apiKey)) ||
        (!_.isEmpty(softlayer.username) && _.isEmpty(softlayer.apiKey)))) {
      growl.error('NEW_CLIENT_STEP_2_VALIDATION');
    } else {
      var clientConfig = [];
      $rootScope.$broadcast('loadingBlock', true);

      if (amazon.id !== null && _.isEmpty(amazon.accessKey) && _.isEmpty(amazon.secretKey)) {
        clientConfig.push(CloudAPI.deleteAmazonAccount(amazon.id));
      } else if (amazon.id !== null) {
        clientConfig.push(CloudAPI.updateAmazonAccount({
          id: amazon.id,
          accountName: 'Amazon account',
          accessKey: amazon.accessKey,
          secretKey: amazon.secretKey
        }));
      } else if (!_.isEmpty(amazon.accessKey) && !_.isEmpty(amazon.secretKey)) {
        clientConfig.push(CloudAPI.addAmazonAccount({
          accountName: 'Amazon account',
          accessKey: amazon.accessKey,
          secretKey: amazon.secretKey
        }).success(function(data) {
          amazon.id = data.id;
        }));
      }

      if (softlayer.id !== null && _.isEmpty(softlayer.username) && _.isEmpty(softlayer.apiKey)) {
        clientConfig.push(CloudAPI.deleteSoftLayerAccount(softlayer.id));
      } else if (softlayer.id !== null) {
        clientConfig.push(CloudAPI.updateSoftLayerAccount({
          id: softlayer.id,
          accountName: 'Soft Layer account',
          username: softlayer.username,
          apiKey: softlayer.apiKey
        }));
      } else if (!_.isEmpty(softlayer.username) && !_.isEmpty(softlayer.apiKey)) {
        clientConfig.push(CloudAPI.addSoftLayerAccount({
          accountName: 'Soft Layer account',
          username: softlayer.username,
          apiKey: softlayer.apiKey
        }).success(function(data) {
          softlayer.id = data.id;
        }));
      }

      if (clientConfig.length > 0) {
        $q.all(clientConfig).then(function(response) {
          if (response.length > 0) {
            CloudAPI.preloadClouds().success(function() {
              $timeout(function() {
                $state.go('app.dashboard');
              });
              $rootScope.$broadcast('loadingBlock', false);
            }).error(function() {
              growl.warning('NEW_CLIENT_STEP_3_CLOUD_SYNC_ERROR');
              $rootScope.$broadcast('loadingBlock', false);
            });
          }
        }, function() {
          $rootScope.$broadcast('loadingBlock', false);
          growl.error('NEW_CLIENT_STEP_2_ERROR');
        });
      } else {
        $rootScope.$broadcast('loadingBlock', false);
      }
    }
  };

  $scope.continueWelcome = function(showTutorial) {
    if ($scope.hideNextTime) {
      $log.debug('Disable welcome screen...');
    }
    Introduction.setShowTutorial(showTutorial);
    $state.go('app.dashboard');
  };

  $scope.showAmazonPolicy = function() {
    $modal({
      template: 'views/templates/AMAZON/policy-modal.html'
    });
    return false;
  };
});
