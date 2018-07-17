 'use strict';

angular.module('cloudpoxee.controllers').controller('VolumesCtrl',
  function($log, $scope, $rootScope, $filter, volumes, VolumeOptions, CloudAPI, TagHandler) {

  $log.debug('CloudPoxee volumes controller...');
  $scope.volumesAmazon = $filter('filter')(volumes, { provider: 'AMAZON' });
  $scope.volumesSoftLayer = $filter('filter')(volumes, { provider: 'SOFTLAYER' });

  // -- Amazon & SoftLayer actions
  VolumeOptions.setAmazonOptions($scope, 'optionsAmazon', 'volumesAmazon');
  VolumeOptions.setSoftLayerOptions($scope, 'optionsSoftLayer', 'volumesSoftLayer', function() {
    CloudAPI.getVolumes().then(function(volumes) {
      $scope.volumesAmazon = $filter('filter')(volumes, { provider: 'AMAZON' });
      $scope.volumesSoftLayer = $filter('filter')(volumes, { provider: 'SOFTLAYER' });
    });
  });

  // -- Tag management
  TagHandler.initialize($scope, $rootScope);
  TagHandler.configureType('va', 'volumesAmazon');
  TagHandler.configureType('vs', 'volumesSoftLayer');

  // -- Tab Activation
  $scope.tab = 'amazon';
  $scope.activateTab = function(tabName) {
    $scope.tab = tabName;
  };

});
