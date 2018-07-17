'use strict';

// --------------------------------------------------------------------------
// Dropdown data service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('VolumeOptions', function($log, $rootScope, $translate, $filter, $q, $modal, growl, CloudAPI, SchedulingService) {
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

  var amazonEventCleanup = null;
  var slEventCleanup = null;
  return {
    setAmazonOptions: function(scope, path, itemsPath) {
      var that = this;
      scope[path] = [
        {
          text: $translate.instant('SNAPSHOT'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (volumes.length > 0) {
              var requests = [];

              for (var i = 0; i < volumes.length; i++) {
                requests.push(CloudAPI.takeSnapshot(volumes[i].id));
              }

              if (requests.length > 0) {
                $q.all(requests).then(function() {
                  growl.success('SNAPSHOTS_TAKEN');
                }, function() {
                  growl.error('SNAPSHOTS_FAILED');
                });
              }
            } else {
              growl.warning('VOLUME_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('RESIZE'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (volumes.length === 0) {
              growl.warning('VOLUME_SELECTION');
            } else if (volumes.length > 1) {
              growl.warning('VOLUME_SINGLE_SELECTION');
            } else {
              var modal;
              var innerScope = scope.$new();
              innerScope.volume = volumes[0];
              innerScope.newSize = volumes[0].size;
              innerScope.modifyVolumes = function (newSize) {
                $log.debug(newSize);
                var requests = [];
                for (var i = 0; i < volumes.length; i++) {
                  var volume = volumes[i];
                  requests.push(CloudAPI.modifyVolumeSize(volume.id, newSize));
                }

                if (requests.length > 0) {
                  $q.all(requests).then(function () {
                    growl.success('VOLUMES_MODIFIED');
                    modal.hide();
                  }, function() {
                    growl.success('VOLUMES_MODIFIED_FAILED');
                  });
                }
              };

              modal = $modal({
                scope: innerScope,
                templateUrl: 'views/templates/volume-modify-size-modal.html'
              });
            }
          }
        },
        {
          'divider': true
        },
        {
          text: $translate.instant('SCHEDULE'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            var selection = [];
            if (volumes.length > 0) {
              angular.forEach(volumes, function (item) {
                selection.push({ id: item.id, label: (item.tags.Name || $translate.instant('UNNAMED')) + '  (' + item.externalId + ')' });
              });
            }
            SchedulingService.openWidget('VOLUMES', selection, true);
          }
        },
        {
          text: $translate.instant('INCREMENTAL_RESIZE_SCHEDULE'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            var selection = [];
            if (volumes.length > 0) {
              angular.forEach(volumes, function (item) {
                selection.push({ id: item.id, label: (item.tags.Name || $translate.instant('UNNAMED')) + '  (' + item.externalId + ')' });
              });
            }
            SchedulingService.openWidget('VOLUMES_RESIZE', selection, true);
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
                    requests.push(CloudAPI.addVolumeGroup(items[i], groupName));
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
                    requests.push(CloudAPI.removeVolumeGroup(items[i], groupName));
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

      if (amazonEventCleanup !== null) {
        amazonEventCleanup();
      }
      amazonEventCleanup = $rootScope.$on('$translateChangeSuccess', function() {
        that.setAmazonOptions(scope, path, itemsPath);
      });
    },
    setSoftLayerOptions: function(scope, path, itemsPath, callback) {
      var that = this;
      scope[path] = [
        {
          text: $translate.instant('ACTIVATE_BACKUPS'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (volumes.length > 0) {
              // Verify they are all of the correct type
              var correctTypes = true;
              angular.forEach(volumes, function(volume) {
                if (volume.volumeType !== 'SOFTLAYER_NETWORK_STORAGE_ISCSI_ENDURANCE') {
                  correctTypes = false;
                }
              });

              if (correctTypes) {
                var innerScope = scope.$new();
                innerScope.type = 'WEEKLY';
                innerScope.retentionCount = 3;
                innerScope.dow = 1;
                innerScope.hour = 12;
                innerScope.minute = 0;

                innerScope.hours = [];
                for (var i = 0; i < 24; i++) {
                  innerScope.hours.push(i);
                }

                innerScope.minutes = [];
                for (var j = 0; j < 60; j++) {
                  innerScope.minutes.push(j);
                }

                innerScope.createSchedule = function(type, retentionCount, dow, hour, minute) {
                  $log.debug('Creating/Overriding schedule for SoftLayer', type, retentionCount, dow, hour, minute);
                  var requests = [];

                  angular.forEach(volumes, function(volume) {
                    if (type === 'WEEKLY') {
                      requests.push(CloudAPI.enableWeeklySnapshots(volume.id, retentionCount, dow, hour, minute));
                    } else if (type === 'DAILY') {
                      requests.push(CloudAPI.enableDailySnapshots(volume.id, retentionCount, hour, minute));
                    } else if (type === 'HOURLY') {
                      requests.push(CloudAPI.enableHourlySnapshots(volume.id, retentionCount, minute));
                    }
                  });

                  if (requests.length > 0) {
                    $q.all(requests).then(function() {
                      growl.success('SNAPSHOTS_SCHEDULED');
                      callback();
                      modal.hide();
                    });
                  }
                };

                var modal = $modal({
                  scope: innerScope,
                  template: 'views/templates/SOFTLAYER/activate-snapshots-modal.html'
                });
              } else {
                growl.warning('SNAPSHOTS_SL_TYPES_NOT_SUPPORTED');
              }

            } else {
              growl.warning('VOLUME_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('DEACTIVATE_HOURLY_BACKUPS'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (volumes.length > 0) {
              // Verify they are all of the correct type
              var correctTypes = true;
              angular.forEach(volumes, function(volume) {
                if (volume.volumeType !== 'SOFTLAYER_NETWORK_STORAGE_ISCSI_ENDURANCE') {
                  correctTypes = false;
                }
              });

              if (correctTypes) {
                var requests = [];

                angular.forEach(volumes, function(volume) {
                  requests.push(CloudAPI.disableHourlySnapshots(volume.id));
                });

                if (requests.length > 0) {
                  $q.all(requests).then(function() {
                    growl.success('SNAPSHOTS_DISABLED');
                    callback();
                  }, function(err) {
                    $log.debug(err);
                  });
                }
              }
            } else {
              growl.warning('VOLUME_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('DEACTIVATE_DAILY_BACKUPS'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (volumes.length > 0) {
              // Verify they are all of the correct type
              var correctTypes = true;
              angular.forEach(volumes, function(volume) {
                if (volume.volumeType !== 'SOFTLAYER_NETWORK_STORAGE_ISCSI_ENDURANCE') {
                  correctTypes = false;
                }
              });

              if (correctTypes) {
                var requests = [];

                angular.forEach(volumes, function(volume) {
                  requests.push(CloudAPI.disableDailySnapshots(volume.id));
                });

                if (requests.length > 0) {
                  $q.all(requests).then(function() {
                    growl.success('SNAPSHOTS_DISABLED');
                    callback();
                  }, function(err) {
                    $log.debug(err);
                  });
                }
              }
            } else {
              growl.warning('VOLUME_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('DEACTIVATE_WEEKLY_BACKUPS'),
          click: function() {
            var volumes = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (volumes.length > 0) {
              // Verify they are all of the correct type
              var correctTypes = true;
              angular.forEach(volumes, function(volume) {
                if (volume.volumeType !== 'SOFTLAYER_NETWORK_STORAGE_ISCSI_ENDURANCE') {
                  correctTypes = false;
                }
              });

              if (correctTypes) {
                var requests = [];

                angular.forEach(volumes, function(volume) {
                  requests.push(CloudAPI.disableWeeklySnapshots(volume.id));
                });

                if (requests.length > 0) {
                  $q.all(requests).then(function() {
                    growl.success('SNAPSHOTS_DISABLED');
                    callback();
                  }, function(err) {
                    $log.debug(err);
                  });
                }
              }
            } else {
              growl.warning('VOLUME_SELECTION');
            }
          }
        }
      ];

      if (slEventCleanup !== null) {
        slEventCleanup();
      }
      slEventCleanup = $rootScope.$on('$translateChangeSuccess', function() {
        that.setSoftLayerOptions(scope, path, itemsPath, callback);
      });
    }
  };
});
