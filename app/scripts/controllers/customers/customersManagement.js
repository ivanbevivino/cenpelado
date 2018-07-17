'use strict';

angular.module('cloudpoxee.controllers').controller('CustomersManagementCtrl',
  function($aside, $log, $scope, $rootScope, $filter, $state, $translate, $q, growl, customers, Session, CloudAPI) {

    $log.debug('CloudPoxee customers management controller...');

    $scope.customers = customers.data;


    $scope.sort = 'name';

    $scope.initialize = function(){
      CloudAPI.getCustomers().success(function(customers) {
        $scope.customers = customers;
      }).error(function() {
        growl.error('ERROR_REQUEST_CUSTOMERS'); //TODO translate
      });
    }

    $scope.sortTable = function(sortName, attribute) {
      if (attribute === $scope[sortName]) {
        $scope[sortName] = '-' + attribute;
      } else {
        $scope[sortName] = attribute;
      }
    };

    $scope.createClient = function() {
      $state.go('app.customers-add');
    };

    $scope.enableClient = function() {
      var customers = $filter('filter')($scope.customers, {
        active: true
      });
      if (customers.length > 0) {
        var requests = [];
        for (var i = 0; i < customers.length; i++) {
          requests.push(CloudAPI.enableCustomer(customers[i].id));
        }
        $q.all(requests).then(function() {
          growl.success('CLIENTS_ENABLED');
          CloudAPI.getCustomers().then(function(customers) {
            $scope.customers = customers.data;
          });
        }, function() {
          growl.error('CLIENTS_ENABLED_FAILED');
        });
      } else {
        growl.warning('CLIENT_SELECTION');
      }
    };

    $scope.disableClient = function() {
      var customers = $filter('filter')($scope.customers, {
        active: true
      });
      if (customers.length > 0) {
        var requests = [];
        var selectedDisabled = false;
        for (var i = 0; i < customers.length; i++) {
          if (Session.user.customer !== null && Session.user.customer.id === customers[i].id) {
            selectedDisabled = true;
          }
          requests.push(CloudAPI.disableCustomer(customers[i].id));
        }
        $q.all(requests).then(function() {
          growl.success('CLIENTS_DISABLED');
          if (!selectedDisabled) {
            CloudAPI.getCustomers().then(function(customers) {
              $scope.customers = customers.data;
            });
          } else {
            $rootScope.$broadcast('client:changed', null);
            $state.go('app.admin-dashboard');
          }
        }, function() {
          growl.error('CLIENTS_DISABLED_FAILED');
        });
      } else {
        growl.warning('CLIENT_SELECTION');
      }
    };

    function setDropdownOptions() {
      $scope.options = [{
          'text': $translate.instant('CREATE_CLIENT'),
          'click': 'createClient()'
        },
        {
          'text': $translate.instant('ENABLE_CLIENT'),
          'click': 'enableClient()'
        },
        {
          'text': $translate.instant('DISABLE_CLIENT'),
          'click': 'disableClient()'
        }
      ];
    }
    setDropdownOptions();
    $rootScope.$on('$translateChangeSuccess', setDropdownOptions);

    $scope.editCustomer = function() {

      var innerScope = $scope.$new();
      innerScope.customer = this.row;
      innerScope.aplications = ["CLOUDPOXEE", "SCHEDULER", "WORKSPACES", "CONNECT", "MEDIABOX"];
      // Selected APPLICATIONS
      innerScope.selection = this.row.apps;

      // Toggle selection for a given fruit by name
      innerScope.toggleSelection = function toggleSelection(aplication) {
        var idx = innerScope.selection.indexOf(aplication);

        // Is currently selected
        if (idx > -1) {
          innerScope.selection.splice(idx, 1);
        }

        // Is newly selected
        else {
          innerScope.selection.push(aplication);
        }
      };


      innerScope.execute = function() {

        innerScope.customer.apps = innerScope.selection;

        CloudAPI.updateCustomer(innerScope.customer).success(function(customer) {
          growl.success('NEW_CLIENT_STEP_1_UPDATE_SUCCESS');
          $scope.initialize();
          aside.hide();
        }).error(function() {
          growl.error('NEW_CLIENT_STEP_1_UPDATE_ERROR');
        });
      };

      var aside;
      aside = $aside({
        scope: innerScope,
        container: 'body',
        placement: 'right',
        template: 'views/customers/aside/customer.edit.html',
        backdrop: 'static'
      });
    }



  });
