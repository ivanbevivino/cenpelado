'use strict';

// --------------------------------------------------------------------------
// Dropdown data service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('SnapshotOptions', function($log, $rootScope, $translate, $filter, $q, $modal, growl, CloudAPI) {
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
    setOptions: function(scope, path, itemsPath) {
      var that = this;
      scope[path] = [
        {
          text: $translate.instant('REGION_COPY'),
          click: function() {
            var amazonSnapshots = $filter('filter')(getModel(scope, itemsPath), { active: true, provider: 'AMAZON' });
            var softlayerSnapshots = $filter('filter')(getModel(scope, itemsPath), { active: true, provider: 'SOFTLAYER' });
            if (softlayerSnapshots.length > 0) {
              growl.warning('SNAPSHOTS_AMAZON_ONLY');
            } else if (amazonSnapshots.length > 0) {
              var modal;
              var innerScope = scope.$new();
              innerScope.snapshots = amazonSnapshots;
              innerScope.destination = 'us-west-1';
              innerScope.execute = function (destination) {
                $log.debug(destination);
                var requests = [];
                for (var i = 0; i < amazonSnapshots.length; i++) {
                  var snapshot = amazonSnapshots[i];
                  requests.push(CloudAPI.copySnapshotTo(snapshot.id, destination));
                }

                if (requests.length > 0) {
                  $q.all(requests).then(function () {
                    growl.success('SNAPSHOTS_COPIED');
                    modal.hide();
                  }, function() {
                    growl.success('SNAPSHOTS_COPIED_FAILED');
                  });
                }
              };

              modal = $modal({
                scope: innerScope,
                template: 'views/templates/snapshot-copy-modal.html'
              });
            } else {
              growl.warning('SNAPSHOTS_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('DELETE'),
          click: function() {
            var snapshots = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (snapshots.length > 0) {
              var requests = [];
              var slCount = 0;

              for (var i = 0; i < snapshots.length; i++) {
                var snapshot = snapshots[i];
                if (snapshot.provider === 'SOFTLAYER') {
                  slCount++;
                } else {
                  requests.push(CloudAPI.deleteSnapshot(snapshot.id));
                }
              }

              if (requests.length > 0) {
                $q.all(requests).then(function() {
                  growl.success('SNAPSHOTS_DELETE_DONE');

                  CloudAPI.getSnapshots().then(function(snapshots) {
                    scope.snapshots = snapshots;
                  });
                }, function() {
                  growl.error('SNAPSHOTS_DELETE_FAILED');
                });
              }

              if (slCount > 0) {
                growl.warning('SNAPSHOTS_DELETE_SL');
              }
            } else {
              growl.warning('SNAPSHOTS_SELECTION');
            }
          }
        },
        {
          'divider': true
        },
        {
          text: $translate.instant('ADD_GROUP'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var innerScope = scope.$new();

              innerScope.addGroup = function(groupName) {
                if (!_.isEmpty(groupName)) {
                  var requests = [];
                  for (var i = 0; i < items.length; i++) {
                    requests.push(CloudAPI.addSnapshotGroup(items[i], groupName));
                  }
                  $q.all(requests).then(function() {
                    growl.success('GROUP_UPDATED');
                    if (modal) {
                      modal.hide();
                    }
                  }, function() {
                    growl.error('GROUP_UPDATE_ERROR');
                  });
                }
              };

              var modal = $modal({
                scope: innerScope,
                template: 'views/templates/group-add-modal.html'
              });
            }
          }
        },
        {
          text: $translate.instant('REMOVE_GROUP'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var innerScope = scope.$new();

              innerScope.removeGroup = function(groupName) {
                if (!_.isEmpty(groupName)) {
                  var requests = [];
                  for (var i = 0; i < items.length; i++) {
                    requests.push(CloudAPI.removeSnapshotGroup(items[i], groupName));
                  }
                  $q.all(requests).then(function() {
                    growl.success('GROUP_UPDATED');
                    if (modal) {
                      modal.hide();
                    }
                  }, function() {
                    growl.error('GROUP_UPDATE_ERROR');
                  });
                }
              };

              var modal = $modal({
                scope: innerScope,
                template: 'views/templates/group-remove-modal.html'
              });
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
