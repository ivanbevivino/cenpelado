'use strict';

angular.module('cloudpoxee.controllers').controller('CustomersAddCtrl',
  function($log, $rootScope, $scope, $timeout, $modal, $translate, $q, $state, growl, AdminService, CloudAPI, Utilities) {
  $log.debug('CloudPoxee customers add controller...');

  // -- Wizard Model

  $scope.step = 0;
  $scope.model = {
    customer: {
      id: null,
      name: ''
    },
    customer: {
      id: null,
      name: '',
      apps : ['CLOUDPOXEE','SCHEDULER','WORKSPACES']
    },
    amazonAccount: {
      id: null,
      accessKey: '',
      secretKey: '',
      accountReach: 'REGULAR'
    },
    softlayerAccount: {
      id: null,
      username: '',
      apiKey: ''
    },
    user: {
      id: null,
      email: '',
      name: '',
      lastName: '',
      secondaryEmail: '',
      password: '',
      role: 'ROLE_CH_USER_ADMIN'
    },
    liquidware:{
      idaccount: null,
      internal: true,
      url: null,
      username: null,
      password: null
    }
  };

  $scope.aplications =   ["CLOUDPOXEE","SCHEDULER","WORKSPACES","CONNECT","MEDIABOX"];

  // Selected APPLICATIONS
  $scope.selection = [];

  // Toggle selection for a given fruit by name
  $scope.toggleSelection = function toggleSelection(aplication) {
    var idx = $scope.selection.indexOf(aplication);

    // Is currently selected
    if (idx > -1) {
      $scope.selection.splice(idx, 1);
    }

    // Is newly selected
    else {
      $scope.selection.push(aplication);
    }
  };


  // -- Validations and Flow

  $scope.goBack = function() {
    $scope.step--;
  };

  $scope.processStep1 = function() {
    var customer = $scope.model.customer;
    if (_.isEmpty(customer.name)) {
      growl.error('NEW_CLIENT_STEP_1_VALIDATION');
    } else {
      if (customer.id === null) { // Create new client

        if($scope.selection.length >0){
        customer.apps = $scope.selection;
        CloudAPI.createCustomer(customer).success(function(customer) {
          growl.success('NEW_CLIENT_STEP_1_CREATE_SUCCESS');
          $scope.model.customer = customer;
          $rootScope.$broadcast('client:changed', customer);
          $scope.step++;
        }).error(function() {
          growl.error('NEW_CLIENT_STEP_1_CREATE_ERROR');
        });

      } else{
          growl.error('NEW_CLIENT_STEP_1_CREATE_ERROR_APLICATIONS');
      }
      } else { // Update client
        CloudAPI.updateCustomer(customer).success(function(customer) {
          growl.success('NEW_CLIENT_STEP_1_UPDATE_SUCCESS');
          $scope.$emit('client:changed', customer);
          $scope.step++;
        }).error(function() {
          growl.error('NEW_CLIENT_STEP_1_UPDATE_ERROR');
        });
      }
    }
  };

  $scope.processStep2 = function() {
    var amazon = $scope.model.amazonAccount;
    var softlayer = $scope.model.softlayerAccount;
    if (((_.isEmpty(amazon.accessKey) && !_.isEmpty(amazon.secretKey)) ||
      (!_.isEmpty(amazon.accessKey) && _.isEmpty(amazon.secretKey))) ||
      ((_.isEmpty(softlayer.username) && !_.isEmpty(softlayer.apiKey)) ||
      (!_.isEmpty(softlayer.username) && _.isEmpty(softlayer.apiKey)))) {
      growl.error('NEW_CLIENT_STEP_2_VALIDATION');
    } else {
      var clientConfig = [];

      if($scope.selection.indexOf("WORKSPACES") > -1 && amazon.id !== null){
        model.liquidware.idaccount = amazon.id;
        CloudAPI.updateLiquidware(innerScope.liquidware).success(function() {
          growl.success('NEW_CLIENT_STEP_2_UPDATE_SUCCESS');
        }).error(function() {
          growl.error('NEW_CLIENT_STEP_2_UPDATE_ERROR');
        });
      }


      if (amazon.id !== null && _.isEmpty(amazon.accessKey) && _.isEmpty(amazon.secretKey)) {
        clientConfig.push(CloudAPI.deleteAmazonAccount(amazon.id));
      } else if (amazon.id !== null) {
        clientConfig.push(CloudAPI.updateAmazonAccount({
          id: amazon.id,
          accountName: 'Amazon account',
          accessKey: amazon.accessKey,
          secretKey: amazon.secretKey,
          accountReach: amazon.accountReach
          //TODO Eviar al back los datos de la cuenta de liquidware
        }));
      } else if (!_.isEmpty(amazon.accessKey) && !_.isEmpty(amazon.secretKey)) {
        clientConfig.push(CloudAPI.addAmazonAccount({
          accountName: 'Amazon account',
          accessKey: amazon.accessKey,
          secretKey: amazon.secretKey,
          accountReach: amazon.accountReach
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

      $q.all(clientConfig).then(function(response) {
        if (response.length > 0) {
          $log.debug('Cloud accounts updated succesfully', response);
          growl.success('NEW_CLIENT_STEP_2_SUCCESS');
        }
        $scope.step++;
      }, function(errorResponse) {
        $log.debug('Error creating client', errorResponse);
        if (errorResponse.status === 423) {
          growl.error('ERROR_CLOUD_ACCOUNT_EXISTS');
        } else {
          growl.error('NEW_CLIENT_STEP_2_ERROR');
        }
      });
    }
  };

  $scope.processStep3 = function() {
    CloudAPI.preloadClouds();
    var customer = $scope.model.customer;
    var user = $scope.model.user;
    if (_.isEmpty(user.name) || _.isEmpty(user.lastName) ||
      _.isEmpty(user.email) || _.isEmpty(user.password) ||
      _.isEmpty(user.role)) {
      growl.error('NEW_CLIENT_STEP_3_VALIDATION_1');
    } else if (!Utilities.validateEmail(user.email) || (!_.isEmpty(user.secondaryEmail) && !Utilities.validateEmail(user.secondaryEmail))) {
      growl.error('NEW_CLIENT_STEP_3_VALIDATION_2');
    } else {
      $log.debug('Creating user...');
      if (user.id === null) {
        CloudAPI.createUser({
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          password: user.password,
          passwordConfirm: user.password,
          roles: [ user.role ],
          customerId: customer.id
        }).success(function(userResponse) {
          user.id = userResponse.id;
          growl.success('NEW_CLIENT_STEP_3_SUCCESS');
          $state.go('app.customer-settings');
          /*$rootScope.$broadcast('loadingBlock', true);
            CloudAPI.preloadClouds().success(function() {
            $timeout(function() {
              $state.go('app.customer-settings');
            });
            $rootScope.$broadcast('loadingBlock', false);
          }).error(function() {
            growl.error('NEW_CLIENT_STEP_3_CLOUD_SYNC_ERROR');
            $rootScope.$broadcast('loadingBlock', false);
          });*/
        }).error(function() {
          growl.error('NEW_CLIENT_STEP_3_ERROR');
          $rootScope.$broadcast('loadingBlock', false);
        });
      } else {
        growl.success('NEW_CLIENT_STEP_3_SUCCESS');
        $state.go('app.customer-settings');
        /*$rootScope.$broadcast('loadingBlock', true);
        CloudAPI.preloadClouds().success(function() {
          $timeout(function() {
            $state.go('app.customer-settings');
          });
          $rootScope.$broadcast('loadingBlock', false);
        }).error(function() {
          growl.warning('NEW_CLIENT_STEP_3_CLOUD_SYNC_ERROR');
          $rootScope.$broadcast('loadingBlock', false);
        });*/
      }
    }
  };

  $scope.showAmazonPolicy = function() {
    $modal({
      template: 'views/templates/AMAZON/policy-modal.html'
    });
    return false;
  };
});
