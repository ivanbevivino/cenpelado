'use strict';

angular.module('cloudpoxee.filters').filter('snapshotType', function() {
  return function(volume) {
    if (volume.provider === 'SOFTLAYER' &&
      (volume.volumeType === 'SOFTLAYER_NETWORK_STORAGE_ISCSI_ENDURANCE')) {

      var enabledTypes = [];
      if (volume.hourlySnapshot && volume.hourlySnapshot.enabled) {
        enabledTypes.push('Hourly');
      }

      if (volume.dailySnapshot && volume.dailySnapshot.enabled) {
        enabledTypes.push('Daily');
      }

      if (volume.weeklySnapshot && volume.weeklySnapshot.enabled) {
        enabledTypes.push('Weekly');
      }

      if (enabledTypes.length > 0) {
        return enabledTypes.join(', ');
      }
    }

    return 'Not available';
  };
});
