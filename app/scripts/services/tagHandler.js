'use strict';

// --------------------------------------------------------------------------
// Tag Handler service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('TagHandler', function($log, $filter, growl, TagService, PermissionService) {
  var scope = null;
  var rootScope = null;

  function prepareTags (element) {
    var tags = [];
    angular.forEach(element.tags, function (value, key) {
      tags.push({
        key: key,
        value: value
      });
    });
    return tags;
  }

  function preparePermissions (element) {
    var permissions = [];
    angular.forEach(element.permissions, function (value, key) {
      var data = value.split(':');
      permissions.push({
        key: data[0],
        value: data[1],
        serverValue: value,
        serverId: key
      });
    });
    return permissions;
  }

  function findByString (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
  }

  return {
    initialize: function ($scope, $rootScope) {
      scope = $scope;
      rootScope = $rootScope;

      // General Tab methods
      scope.toggleAll = this.toggleAll;
      scope.toggleOne = this.toggleOne;
      scope.openTab = this.openTab;
      // TAG methods
      scope.removeTag = this.removeTag;
      scope.addTag = this.addTag;
      scope.cancelTag = this.cancelTag;
      scope.checkTagKey = this.checkTagKey;
      scope.saveTag = this.saveTag;
      // Permissions methods
      scope.removePermission = this.removePermission;
      scope.addPermission = this.addPermission;
      scope.cancelPermission = this.cancelPermission;
      scope.checkPermissionKey = this.checkPermissionKey;
      scope.savePermission = this.savePermission;
    },
    configureType: function (type, itemsPath) {
      if (!scope[type]) {
        scope[type] = {
          tab: 3,
          items: findByString(scope, itemsPath),
          tags: null,
          permissions: null,
          allActive: false
        };
      } else {
        scope[type].items = findByString(scope, itemsPath);
      }
    },
    toggleAll: function (type) {
      $log.debug(scope[type].items, scope[type].allActive);
      angular.forEach(scope[type].items, function (row) {
        if (row.managed) {
          row.active = (scope[type].allActive) ? false : true;
        }
      });
      scope[type].allActive = !scope[type].allActive;
      this.openTab(type, 1);
    },
    toggleOne: function (type, item) {
      if (item.managed) {
        scope[type].allActive = false;
        item.active = !item.active;
      }
      this.openTab(type, 1);
    },
    openTab: function (type, index) {
      $log.debug(scope[type].items);
      var items = $filter('filter')(scope[type].items, { active: true });
      if (items.length === 1) {
        angular.extend(scope[type], {
          item: items[0],
          tags: prepareTags(items[0]),
          permissions: preparePermissions(items[0]),
          tab: index,
          addButtonDisabled: false
        });
      } else if (items.length === 0) {
        angular.extend(scope[type], { item: null, tags: null, tab: 3 });
      } else if (items.length > 1) {
        angular.extend(scope[type], { item: null, tags: null, tab: 0 });
      }
    },
    removeTag: function (type, objectType, tag) {
      rootScope.$broadcast('loading', true);
      delete scope[type].item.tags[tag.key];

      TagService['delete' + objectType + 'Tag'](scope[type].item.id, tag.key).then(function () {
        growl.success('Tag "' + tag.key + '" removed successfully.');
      }, function () {
        growl.error('Tag "' + tag.key + '" could not be removed.');
      }).finally(function () {
        rootScope.$broadcast('loading', false);
        scope[type].tags = prepareTags(scope[type].item);
      });
    },
    addTag: function (type) {
      scope[type].inserted = {
        key: '',
        value: ''
      };
      scope[type].tags.push(scope[type].inserted);
    },
    cancelTag: function (type) {
      scope[type].tags = prepareTags(scope[type].item);
    },
    checkTagKey: function (type, objectType, newVal, oldVal) {
      if (newVal === '') {
        scope.removeTag({ key: oldVal });
        return false;
      } else if (newVal.length > 25) {
        growl.error('Invalid tag name.');
        return '';
      } else if (newVal !== oldVal) {
        var found = false;
        angular.forEach(scope[type].tags, function (tag) {
          if (tag.key === newVal) {
            found = true;
          }
        });
        if (found) {
          growl.error('Duplicate tag name.');
          return '';
        } else if (oldVal.length > 0) {
          TagService['delete' + objectType + 'Tag'](scope[type].item.id, oldVal);
        }
      }
      return true;
    },
    saveTag: function (type, objectType, tag) {
      rootScope.$broadcast('loading', true);
      TagService['save' + objectType + 'Tag'](scope[type].item.id, tag.key, tag.value).then(function () {
        growl.success('Tag added successfully.');
      }).finally(function () {
        rootScope.$broadcast('loading', false);
      });
    },
    removePermission: function (type, objectType, permission) {
      rootScope.$broadcast('loading', true);
      delete scope[type].item.permissions[permission.serverId];

      PermissionService['remove' + objectType + 'Permission'](scope[type].item, permission.serverValue).then(function () {
        growl.success('Permission "' + permission.key + '" removed successfully.');
      }, function () {
        growl.error('Permission "' + permission.key + '" could not be removed.');
      }).finally(function () {
        rootScope.$broadcast('loading', false);
        scope[type].permissions = preparePermissions(scope[type].item);
      });
    },
    addPermission: function (type) {
      scope[type].addButtonDisabled = true;
      scope[type].inserted = {
        key: '',
        value: ''
      };
      scope[type].permissions.push(scope[type].inserted);
    },
    cancelPermission: function (type) {
      scope[type].permissions = preparePermissions(scope[type].item);
      scope[type].addButtonDisabled = false;
    },
    checkPermissionKey: function (type, objectType, newVal, oldVal) {
      if (newVal === '') {
        scope.removePermission({ key: oldVal });
        return false;
      } else if (newVal.length > 50) {
        growl.error('Invalid permission name.');
        return '';
      } else if (newVal !== oldVal) {
        var found = false;
        angular.forEach(scope[type].permissions, function (permission) {
          if (permission.key === newVal) {
            found = true;
          }
        });
        if (found) {
          growl.error('Duplicate permission name.');
          return '';
        } else if (oldVal.length > 0) {
          PermissionService['remove' + objectType + 'Permission'](scope[type].item, oldVal);
        }
      }
      return true;
    },
    savePermission: function (type, objectType, permission) {
      rootScope.$broadcast('loading', true);
      PermissionService['add' + objectType + 'Permission'](scope[type].item, permission.key + ':' + permission.value).then(function () {
        growl.success('PERMISSION_SUCCESS');
      }, function() {
        growl.error('PERMISSION_ERROR');
      }).finally(function () {
        rootScope.$broadcast('loading', false);
        scope[type].addButtonDisabled = false;
      });
    }
  };
});
