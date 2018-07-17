'use strict';

angular.module('cloudpoxee.controllers').controller('GroupsCtrl',
  function($log, $rootScope, $scope, $timeout, $interval, $state, CloudAPI, groups, GroupOptions) {
  $log.debug('CloudPoxee groups controller...', groups);
  $scope.groups = groups;

  $scope.showGroup = function($event, groupName) {
    $log.debug('Show group information for', groupName);
    $event.stopPropagation();
    $timeout(function() {
      $state.go('app.groupDetails', { name: groupName });
    });
  };

  $scope.toggleAll = function () {
    angular.forEach($scope.groups, function (row) {
      row.active = ($scope.allActive) ? false : true;
    });
    $scope.allActive = !$scope.allActive;
  };

  $scope.toggleOne = function (row) {
    $scope.allActive = false;
    row.active = !row.active;
  };

  // -- Refresh groups
  function refreshGroups() {
    CloudAPI.getGroups(true).then(function(data) {
      angular.forEach($scope.groups, function(group) {
        if (group.active) {
          angular.forEach(data, function(updatedGroups) {
            if (updatedGroups.name === group.name) {
              updatedGroups.active = true;
            }
          });
        }
      });
      $scope.groups = data;
    });
  }

  // -- Auto refresh

  var refreshTimer = $interval(function() {
    $log.debug('Updating groups...');
    refreshGroups();
  }, 10000);

  // -- Group Dropdown
  GroupOptions.setOptions($scope, 'options', 'groups', refreshGroups);
  // -- Listeners

  $scope.$on('$destroy', function() {
    $interval.cancel(refreshTimer);
  });
});
