'use strict';

angular.module('cloudpoxee.filters').filter('impending', function () {
  function readableTaskType (item) {
    switch (item.taskType) {
      case 'START_INSTANCE':
      case 'START_GROUP':
        return 'start';
      case 'STOP_INSTANCE':
      case 'STOP_GROUP':
        return 'stop';
      case 'REBOOT_INSTANCE':
      case 'REBOOT_GROUP':
        return 'reboot';
      case 'TAKE_SNAPSHOT':
      case 'TAKE_SNAPSHOT_GROUP':
      case 'TAKE_SNAPSHOT_INSTANCE':
      case 'TAKE_SNAPSHOT_SOFTLAYER':
        return 'take snapshot';
      case 'DELETE_SNAPSHOT':
      case 'DELETE_SNAPSHOT_GROUP':
      case 'DELETE_SNAPSHOT_INSTANCE':
        return 'delete snapshot';
      case 'INVOKE_LAMBDA':
        return 'invoke';
      case 'SEND_COMMAND':
        return 'send';
      case 'INSTANCE_REMINDER':
        return 'remind';
    }
  }
  return function (item) {
    if (item !== null) {
      var message = 'The system is about to <strong>' + readableTaskType(item) + '</strong> an ';
      if (item.cloudItemType !== null) {
        message += item.cloudItemType.toLowerCase() + ' identified by ' +  item.externalId + '.';
      } else if (item.groupName) {
        message += 'group named <strong>' + item.groupName + '</strong>.';
      } else {
        message += 'a system component.';
      }
      return message;
    }
  };
});
