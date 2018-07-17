'use strict';

angular.module('cloudpoxee.controllers').controller('GroupDetailsCtrl',
  function($log, $scope, $rootScope, $interval, $state, group, ServerOptions, LoadBalancerOptions, SnapshotOptions, VolumeOptions, CloudAPI, TagHandler) {

  $log.debug('CloudPoxee group details controller...', group);
  $scope.tab = 'servers';
  $scope.group = group;

  // -- Refresh groups
  function markCheckedItems(itemList, updatedItemList) {
    angular.forEach(itemList, function(item) {
      if (item.active) {
        angular.forEach(updatedItemList, function(updatedItem) {
          if (item.id === updatedItem.id) {
            updatedItem.active = true;
          }
        });
      }
    });
  }

  function reloadTagManagement () {
    TagHandler.configureType('sv', 'group.instances');
    TagHandler.configureType('lb', 'group.loadBalancers');
    TagHandler.configureType('va', 'group.amazonVolumes');
    TagHandler.configureType('vs', 'group.slVolumes');
    TagHandler.configureType('sp', 'group.snapshots');
  }

  function refreshGroup() {
    CloudAPI.getGroup($scope.group.name, true).then(function(group) {
      markCheckedItems($scope.group.instances, group.instances);
      markCheckedItems($scope.group.loadBalancers, group.loadBalancers);
      markCheckedItems($scope.group.volumes, group.volumes);
      markCheckedItems($scope.group.snapshots, group.snapshots);
      $scope.group = group;
      reloadTagManagement();
    }, function() {
      $state.go('app.groups');
    });
  }

  // -- Tag management

  TagHandler.initialize($scope, $rootScope);
  reloadTagManagement();

  // Tab settings
  $scope.activateTab = function(tabName) {
    $scope.tab = tabName;
  };

  // -- Server actions
  ServerOptions.setOptions(
    $scope,
    'serverOptions',
    'group.instances',
    function() {
      $interval.cancel(refreshTimer);
    },
    function() {
      refreshTimer = $interval(function() {
        $log.debug('Refreshing group...');
        refreshGroup();
      }, 10000);
      refreshGroup();
    }
  );

  $scope.viewServer = function ($event, server) {
    ServerOptions.viewServerDetails($scope, $event, server);
  };

  // -- Dropdown actions

  LoadBalancerOptions.setOptions($scope, 'loadBalancerOptions', 'group.loadBalancers', refreshGroup);
  SnapshotOptions.setOptions($scope, 'snapshotOptions', 'group.snapshots');
  VolumeOptions.setAmazonOptions($scope, 'amazonVolumeOptions', 'group.amazonVolumes');
  VolumeOptions.setSoftLayerOptions($scope, 'slVolumeOptions', 'group.slVolumes', refreshGroup);

  // -- Auto refresh

  var refreshTimer = $interval(function () {
    $log.debug('Refreshing group...');
    refreshGroup();
  }, 10000);

  // -- Listeners

  $scope.$on('cloud:preloaded', function () {
    refreshGroup();
  });

  $scope.$on('$destroy', function () {
    $interval.cancel(refreshTimer);
  });

});
