'use strict';

angular.module('cloudpoxee.controllers').controller('GroupConfigCtrl',
  function($log, $scope, $state, $stateParams, $filter, growl, group, groupConfiguration, Session, CloudAPI) {

  $log.debug('CloudPoxee group config controller...', group, groupConfiguration);

  Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };

  /* Wizard navigation */

  $scope.step = 0;

  $scope.goBack = function() {
    $scope.step--;
  };

  $scope.cancel = function() {
    $state.go('app.groups');
  };

  /* STEP 1 */
  $scope.processStep1 = function() {
    var configuredCorrectly = true;
    var nonOrdered = true;
    angular.forEach($scope.configuration.instanceGroups, function(group) {
      if (group.servers.length === 0) {
        configuredCorrectly = false;
      }
      if (group.orderStart !== 0) {
        nonOrdered = false;
      }
    });

    if (configuredCorrectly) {
      if (nonOrdered) {
        angular.forEach($scope.configuration.instanceGroups, function(group, index) {
          group.orderStart = index;
        });
      }

      $scope.step = 1;
    } else {
      growl.error('GROUP_CONFIG_SERVER_CONFIGURED_WARNING');
    }
  };

  $scope.createGroup = function() {
    var length = $scope.configuration.instanceGroups.length;
    $scope.configuration.instanceGroups.push({
      name: 'Group ' + (length + 1),
      servers: [],
      orderStart: 0,
      orderStop: 0,
      delayAfterInstanceStartMillis: 10000,
      delayAfterGroupStartMillis: 60000,
      delayAfterInstanceStopMillis: 10000,
      delayAfterGroupStopMillis: 60000
    });
  };

  $scope.deleteGroup = function(index) {
    var group = $scope.configuration.instanceGroups.splice(index, 1)[0];
    for (var i = 0; i < group.servers.length; i++) {
      $scope.servers.push(group.servers[i]);
    }
  };

  /* STEP 2 */
  $scope.processStep2 = function() {
    $scope.step = 2;
  };

  /* STEP 2 & 3 */
  $scope.up = function(path, index) {
    var orderedGroups = $filter('orderBy')($scope.configuration.instanceGroups, path);
    orderedGroups.move(index, index-1);
    angular.forEach(orderedGroups, function(group, index) {
      group[path] = index;
    });
  };

  $scope.down = function(path, index) {
    var orderedGroups = $filter('orderBy')($scope.configuration.instanceGroups, path);
    orderedGroups.move(index, index+1);
    angular.forEach(orderedGroups, function(group, index) {
      group[path] = index;
    });
  };

  /* STEP 3 */

  $scope.save = function() {
    var configuration = angular.copy($scope.configuration, {});
    angular.forEach(configuration.instanceGroups, function(group) {
      var instanceIds = [];
      angular.forEach(group.servers, function(server) {
        instanceIds.push(server.id);
      });
      group.instanceIds = instanceIds;
      delete group.servers;
    });

    $log.debug('Saving group configuration...', configuration);
    CloudAPI.saveGroupConfiguration(configuration).then(function() {
      growl.success('GROUP_CONFIGURATION_SAVED');
      $state.go('app.groups');
    }, function() {
      growl.error('GROUP_CONFIGURATION_FAILED');
    });
  };

  /* INITIALIZE */
  if (groupConfiguration === null) {
    $scope.configuration = {
      id: (groupConfiguration !== null) ? groupConfiguration.id : null,
      customerId: Session.user.customer.id,
      groupName: $stateParams.name,
      instanceGroups: (groupConfiguration !== null) ? groupConfiguration.instanceGroups : []
    };
    $scope.createGroup();
    $scope.servers = group.instances;
  } else {
    $scope.configuration = {
      id: groupConfiguration.id,
      customerId: Session.user.customer.id,
      groupName: $stateParams.name,
      instanceGroups: groupConfiguration.instanceGroups
    };

    var i = group.instances.length;
    while (i--) {
      var instance = group.instances[i];
      $log.debug(groupConfiguration.instanceGroups);
      angular.forEach(groupConfiguration.instanceGroups, function(instanceGroup) {
        angular.forEach(instanceGroup.servers, function(server) {
          if (server.id === instance.id) {
            group.instances.splice(i, 1);
          }
        });
      });
    }
    $scope.servers = group.instances;
  }

  $scope.$on('group-configuration:tabChange', function() {
    $scope.step = 0;
  });
});
