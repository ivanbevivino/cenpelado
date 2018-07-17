'use strict';

angular.module('cloudpoxee.controllers').controller('SnapshotsCtrl',
  function($log, $scope, $rootScope, $filter, growl, snapshots, SnapshotOptions, TagHandler) {

  $log.debug('CloudPoxee snapshots controller...');
  $scope.snapshots = snapshots;

  // -- Snapshot actions
  SnapshotOptions.setOptions($scope, 'options', 'snapshots');

  TagHandler.initialize($scope, $rootScope);
  TagHandler.configureType('sp', 'snapshots');
});
