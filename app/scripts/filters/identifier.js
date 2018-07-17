'use strict';

angular.module('cloudpoxee.filters').filter('identifier', function () {
  return function (item) {
    if (item !== null) {
      switch (item.type) {
        case 'START_INSTANCE':
        case 'STOP_INSTANCE':
        case 'REBOOT_INSTANCE':
        case 'TAKE_SNAPSHOT_INSTANCE':
        case 'DELETE_SNAPSHOT_INSTANCE':
        case 'ASSIGN_EIP_INSTANCE':
          item.genName = item.instanceName;
          return item.instanceName;
        case 'START_GROUP':
        case 'STOP_GROUP':
        case 'REBOOT_GROUP':
        case 'TAKE_SNAPSHOT_GROUP':
        case 'DELETE_SNAPSHOT_GROUP':
          item.genName = item.groupName;
          return item.genName;
        case 'TAKE_SNAPSHOT':
        case 'DELETE_SNAPSHOT':
          item.genName = item.volume.tags.Name || item.volume.externalId;
          return item.genName;
        case 'INVOKE_LAMBDA':
          item.genName = item.name;
          return item.genName;
        case 'SEND_COMMAND':
          item.genName = item.name;
          return item.genName;
        case 'INSTANCE_REMINDER':
          return item.name;
        case 'MODIFY_VOLUME_SIZE':
          item.genName = item.name || item.externalId;
          return item.genName;
      }
    }
    return 'Unknown';
  };
});
