'use strict';

angular.module('cloudpoxee.filters').filter('taskInfo', function($translate) {
  return function (item) {
    if (item !== null) {
      var label;
      switch (item.type) {
        case 'DELETE_SNAPSHOT':
        case 'DELETE_SNAPSHOT_INSTANCE':
        case 'DELETE_SNAPSHOT_GROUP':
          label = '<span class="highlight" translate>' + $translate.instant('MAX_AGE') + '</span> ';
          if (item.maxAge === 28) {
            return label + $translate.instant('4_WEEKS');
          } else if (item.maxAge === 7) {
            return label + $translate.instant('1_WEEK');
          } else if (item.maxAge === 1) {
            return label + $translate.instant('1_DAY');
          } else {
            return label + $translate.instant(item.maxAge + '_DAYS');
          }
        break;
        case 'TAKE_SNAPSHOT':
        case 'TAKE_SNAPSHOT_INSTANCE':
        case 'TAKE_SNAPSHOT_GROUP':
          if (item.destinationRegionName && item.destinationRegionName !== '') {
            label = '<span class="highlight">' + $translate.instant('COPY_DESTINATION') + '</span> ';
            return label + item.destinationRegionName;
          }
        break;
        case 'ASSIGN_EIP_INSTANCE':
          label = '<span class="highlight">IP</span> ';
          return label + item.publicIp;
        case 'INSTANCE_REMINDER':
          return '<div><span class="highlight">' + $translate.instant('STATUS') + '</span> <span>' + $translate.instant(item.instanceStatus) + '</span></div>' +
            '<div><span class="highlight">' + $translate.instant('ACTION') + '</span> <span>' + $translate.instant(item.actionType) + '</span></div>';
        case 'MODIFY_VOLUME_SIZE':
          return '<div><span class="highlight">' + $translate.instant('INCREMENT') + '</span> <span>' + item.sizeIncrement + 'GB</span></div>';
      }
    }
    return '-';
  };
});
