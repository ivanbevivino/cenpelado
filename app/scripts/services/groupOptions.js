'use strict';

// --------------------------------------------------------------------------
// Dropdown data service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('GroupOptions', function($log, $rootScope, $translate, $filter, $q, $modal, $state, growl, CloudAPI, SchedulingService) {
  var getModel = function(scope, path) {
    var segs = path.split('.');
    var root = scope;

    while (segs.length > 0) {
      var pathStep = segs.shift();
      if (typeof root[pathStep] === 'undefined') {
        root[pathStep] = segs.length === 0 ? [ '' ] : {};
      }
      root = root[pathStep];
    }

    return root;
  };

  var eventCleanup = null;
  return {
    setOptions: function(scope, path, itemsPath, callback) {
      var that = this;
      scope[path] = [
        {
          text: $translate.instant('START'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var requests = [];
              for (var i = 0; i < items.length; i++) {
                requests.push(CloudAPI.startGroup(items[i].name));
              }

              growl.success('GROUPS_STARTED');
              $q.all(requests).then(function() {
              }, function() {
                growl.error('GROUPS_STARTED_FAILED');
              });
            } else {
              growl.warning('GROUPS_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('STOP'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var requests = [];
              for (var i = 0; i < items.length; i++) {
                requests.push(CloudAPI.stopGroup(items[i].name));
              }
              growl.success('GROUPS_STOPPED');
              $q.all(requests).then(function() {
              }, function() {
                growl.error('GROUPS_STOPPED_FAILED');
              });
            } else {
              growl.warning('GROUPS_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('RESTART'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var requests = [];
              for (var i = 0; i < items.length; i++) {
                requests.push(CloudAPI.rebootGroup(items[i].name));
              }

              growl.success('GROUPS_RESTART');
              $q.all(requests).then(function() {
              }, function() {
                growl.error('GROUPS_RESTART_FAILED');
              });
            } else {
              growl.warning('GROUPS_SELECTION');
            }
          }
        },
        {
          divider: true
        },
        {
          text: $translate.instant('SCHEDULE'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            var selection = [];
            if (items.length > 0) {
              angular.forEach(items, function (item) {
                selection.push({ id: item.name, label: item.name });
              });
            }
            SchedulingService.openWidget('GROUPS', selection, true);
          }
        },
        {
          divider: true
        },
        {
          text: $translate.instant('CONFIGURE'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length === 1) {
              $state.go('app.groupConfig', {
                name: items[0].name
              });
            } else {
              growl.warning('GROUPS_SINGLE_SELECTION');
            }
          }
        },
        {
          divider: true
        },
        {
          text: $translate.instant('DELETE'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var requests = [];
              angular.forEach(items, function(group) {
                requests.push(CloudAPI.deleteGroup(group.name));
              });
              $q.all(requests).then(function() {
                callback();
              }, function() {
                growl.error('GROUPS_DELETED_FAILED');
              });
            } else {
              growl.warning('GROUPS_SELECTION');
            }
          }
        }
      ];

      if (eventCleanup !== null) {
        eventCleanup();
      }
      eventCleanup = $rootScope.$on('$translateChangeSuccess', function() {
        that.setOptions(scope, path, itemsPath);
      });
    }
  };
});
