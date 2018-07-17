'use strict';

// --------------------------------------------------------------------------
// Admin Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('CloudAPI', function($log, $http, $q, $filter, $translate, $location, Session) {
  return {
    getCustomers: function() {
      return $http.get(cpconfig.API_URL + '/customer/all');
    },
    getLiquidware: function() {
      return $http.get(cpconfig.API_URL + '/liquidware/'+Session.user.customer.id);
    },
    updateLiquidware: function(request) {
      return $http.post(cpconfig.API_URL + '/liquidware/'+Session.user.customer.id+'/update',request);
    },
    getCustomersData: function() {
      return $http.get(cpconfig.API_URL + '/customer/data/all?' + new Date().getTime());
    },
    getMainStats: function() {
      return $http.get(cpconfig.API_URL + '/stats/mainStats');
    },
    getServers: function(automatic) {
      var deferred = $q.defer();
      $log.debug('Retrieving servers from providers configured');
      var url = cpconfig.API_URL + '/cloud/instances/customer/' + Session.user.customer.id;
      if (automatic) {
        url += '?automatic';
      }
      $http.get(url).success(function(data) {
        $log.debug('Servers found:', data);
        angular.forEach(data, function(server) {
          if (server.name === null || server.name === '') {
            server.name = $translate.instant('UNNAMED');
          }
          server.started = new Date(server.started);
        });
        deferred.resolve(data);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getLoadBalancers: function(automatic) {
      var deferred = $q.defer();
      $log.debug('Retrieving load balancers from providers configured');
      var url = cpconfig.API_URL + '/cloud/load_balancers/customer/' + Session.user.customer.id;
      if (automatic) {
        url += '?automatic';
      }
      $http.get(url).success(function(loadBalancers) {
        $log.debug('Load balancers found', loadBalancers);
        deferred.resolve(loadBalancers);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getVolumes: function(automatic) {
      var deferred = $q.defer();
      $log.debug('Retrieving load balancers from providers configured');
      var url = cpconfig.API_URL + '/cloud/volumes/customer/' + Session.user.customer.id;
      if (automatic) {
        url += '?automatic';
      }

      this.getServers(automatic).then(function(servers) {
        $http.get(url).success(function(volumes) {
          $log.debug('Volumes found:', volumes);
          for (var i = 0; i < volumes.length; i++) {
            var volume = volumes[i];
            var linked = [];
            volume.name = volume.tags.Name || volume.externalId;
            for (var j = 0; j < volume.instanceIds.length; j++) {
              var server = $filter('filter')(servers, { externalId: volume.instanceIds[j] });
              if (server.length > 0) {
                linked.push(server[0].name);
              }
            }
            volume.instanceNames = linked.join(', ');
          }
          deferred.resolve(volumes);
        }).error(function() {
    Session.destroy();
          deferred.reject();
        });
      }, function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getSnapshots: function() {
      var deferred = $q.defer();
      $http.get(cpconfig.API_URL + '/cloud/snapshots/customer/' + Session.user.customer.id).success(function(snapshots) {
        $log.debug('Snapshots found:', snapshots);
        deferred.resolve(snapshots);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    takeSnapshot: function(volumeId) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId);
    },
    deleteSnapshot: function(snapshotId) {
      return $http['delete'](cpconfig.API_URL + '/cloud/snapshots/' + snapshotId);
    },
    getUsers: function() {
      $log.debug('Retrieving users for client', Session.user.customer.id);
      return $http.get(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/users');
    },
    getAdmins: function() {
      $log.debug('Retrieving admins');
      return $http.get(cpconfig.API_URL + '/system/admin');
    },
    getGroupNames: function() {
      var deferred = $q.defer();
      $http.get(cpconfig.API_URL + '/cloud/group/names/customer/' + Session.user.customer.id).success(function(names) {
        deferred.resolve(names);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getGroups: function(automatic) {
      var deferred = $q.defer();
      var url = cpconfig.API_URL + '/cloud/group/customer/' + Session.user.customer.id;
      if (automatic) {
        url += '?automatic';
      }
      $http.get(url).success(function(groups) {
        $log.debug('Groups found:', groups);
        angular.forEach(groups, function(group) {
          var running = true;
          group.componentsDown = 0;
          angular.forEach(group.instances, function(instance) {
            if (instance.status !== 'RUNNING') {
              running = false;
              group.componentsDown++;
            }

            if (instance.name === null || instance.name === '') {
              instance.name = $translate.instant('UNNAMED');
            }
          });
          if (running) {
            group.status = 'GROUP_RUNNING';
          } else {
            group.status = 'COMPONENTS_DOWN';
          }
        });
        deferred.resolve(groups);
      }).error(function() {

        Session.destroy();
    
        deferred.reject();
      });
      return deferred.promise;
    },
    getGroup: function(group, automatic) {
      var deferred = $q.defer();
      $log.debug('Retrieving group', group);
      var url = cpconfig.API_URL + '/cloud/group/' + group + '/customer/' + Session.user.customer.id;
      if (automatic) {
        url += '?automatic';
      }

      this.getServers(automatic).then(function(servers) {
        $http.get(url).success(function(group) {
          var running = true;
          for (var i = 0; i < group.volumes.length; i++) {
            var volume = group.volumes[i];
            var linked = [];
            volume.name = volume.tags.Name || volume.externalId;
            for (var j = 0; j < volume.instanceIds.length; j++) {
              var server = $filter('filter')(servers, { externalId: volume.instanceIds[j] });
              if (server.length > 0) {
                linked.push(server[0].name);
              }
            }
            volume.instanceNames = linked.join(', ');
          }

          group.amazonVolumes = $filter('filter')(group.volumes, { provider: 'AMAZON' });
          group.slVolumes = $filter('filter')(group.volumes, { provider: 'SOFTLAYER' });

          angular.forEach(group.instances, function(instance) {
            if (instance.status !== 'RUNNING') {
              running = false;
              group.componentsDown++;
            }

            if (instance.name === null || instance.name === '') {
              instance.name = $translate.instant('UNNAMED');
            }
          });

          if (running) {
            group.status = 'GROUP_RUNNING';
          } else {
            group.status = 'COMPONENTS_DOWN';
          }

          deferred.resolve(group);
        }).error(function() {
    Session.destroy();
          deferred.reject();
        });
      }, function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getGroupConfiguration: function(groupName) {
      var deferred = $q.defer();
      this.getGroup(groupName).then(function(group) {
        $log.debug('Retrieving group configuration', group);
        $http.get(cpconfig.API_URL + '/cloud/group/' + groupName + '/customer/' + Session.user.customer.id + '/configuration')
          .success(function(configuration) {
            $log.debug('Group configuration retrieved', configuration);

            angular.forEach(configuration.instanceGroups, function(instanceGroup) {
              var servers = [];
              angular.forEach(instanceGroup.instanceIds, function(instanceId) {
                angular.forEach(group.instances, function(instance) {
                  if (instance.id === instanceId) {
                    servers.push(instance);
                  }
                });
              });
              delete instanceGroup.instanceIds;
              instanceGroup.servers = servers;
            });
            deferred.resolve(configuration);
          })
          .error(function() {
            $log.debug('Environment configuration not found');
            deferred.resolve(null);
          });
      });
      return deferred.promise;
    },
    saveGroupConfiguration: function(configuration) {
      return $http.post(cpconfig.API_URL + '/cloud/group/' + configuration.groupName + '/customer/' + Session.user.customer.id + '/configuration', configuration);
    },
    createOrUpdateRegion: function (region) {
      return $http.post(cpconfig.API_URL + '/cloud/region', region);
    },
    getRegions: function () {
      var deferred = $q.defer();
      $http.get(cpconfig.API_URL + '/cloud/region/all').success(function (regions) {
        deferred.resolve(regions);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getAmazonRegions: function () {
      return $http.get(cpconfig.API_URL + '/cloud/region/all').then(function (regions) {
        return $filter('filter')(regions.data, { provider: 'AMAZON' });
      });
    },
    getMapRegions: function () {
      var deferred = $q.defer();
      var that = this;

      function getAppropriateRegion(regions, region) {
        switch (region.regionId) {
          case 'DALLAS':
          case 'DALLAS02':
          case 'DALLAS04':
          case 'DALLAS05':
          case 'DALLAS06':
          case 'DALLAS07':
          case 'DALLAS09':
            for (var i = 0; i < regions.length; i++) {
              var localRegion = regions[i];
              if (localRegion.regionId === 'DALLAS') {
                return localRegion;
              }
            }
        }
        return region;
      }

      $http.get(cpconfig.API_URL + '/cloud/region/all').success(function(regions) {

        var requests = [];
        requests.push(that.getServers());
        requests.push(that.getLoadBalancers());
        requests.push(that.getVolumes());

        $q.all(requests).then(function(results) {
          var servers = results[0];
          var loadBalancers = results[1];
          var volumes = results[2];

          var i = regions.length;
          while (i--) {
            var region = regions[i];

            region.serverCount = 0;
            region.loadBalancersCount = 0;
            region.volumesCount = 0;

            if (region.provider === 'SOFTLAYER') { // Combine Dallas
              switch (region.regionId) {
                case 'DALLAS':
                  region.name = 'Dallas (multiple)';
                  break;
                case 'DALLAS02':
                case 'DALLAS04':
                case 'DALLAS05':
                case 'DALLAS06':
                case 'DALLAS07':
                case 'DALLAS09':
                case 'DALLAS10':
                  regions.splice(i, 1);
                  continue;
              }
            }

            var localRegion = getAppropriateRegion(regions, region);

            for (var j = 0; j < servers.length; j++) {
              var server = servers[j];
              if (server.location.region.id === region.id) {
                localRegion.serverCount++;
              }
            }

            for (var k = 0; k < volumes.length; k++) {
              var volume = volumes[k];
              if (volume.location && volume.location.region.id === region.id) {
                localRegion.volumesCount++;
              }
            }

            for (var l = 0; l < loadBalancers.length; l++) {
              var loadBalancer = loadBalancers[l];
              if (loadBalancer.location && loadBalancer.location.region.id === region.id) {
                localRegion.loadBalancersCount++;
              }
            }

            var clazz = 'mapInformation map-popup-' + region.id;
            if (region.provider === 'AMAZON') {
              if (localRegion.serverCount + localRegion.loadBalancersCount + localRegion.volumesCount > 0) {
                localRegion.icon = 'images/maps/datacenter-amazon-icon.png';
              } else {
                localRegion.icon = 'images/maps/datacenter-amazon-icon-inactive.png';
                clazz += ' mapInformation--info';
              }
            } else {
              if (localRegion.serverCount + localRegion.loadBalancersCount + localRegion.volumesCount > 0) {
                localRegion.icon = 'images/maps/datacenter-softlayer-icon.png';
              } else {
                localRegion.icon = 'images/maps/datacenter-softlayer-icon-inactive.png';
                clazz += ' mapInformation--info';
              }
            }

            localRegion.showWindow = false;
            localRegion.imageExtension = 'png';
            localRegion.infoWindowOptions = {
              boxClass: clazz,
              disableAutoPan: true
            };
          }

          deferred.resolve(regions);
        }, function() {
    Session.destroy();
          deferred.reject();
        });
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    deleteRegion: function(regionId) {
      return $http.delete(cpconfig.API_URL + '/cloud/region/' + regionId);
    },
    deleteGroup: function(group) {
      return $http.delete(cpconfig.API_URL + '/cloud/group/' + group + '/customer/' + Session.user.customer.id);
    },
    addInstanceGroup: function(server, group) {
      return $http.post(cpconfig.API_URL + '/cloud/addGroup/instance/' + server.id + '/group/' + group);
    },
    addVolumeGroup: function(volume, group) {
      return $http.post(cpconfig.API_URL + '/cloud/addGroup/volume/' + volume.id + '/group/' + group);
    },
    addSnapshotGroup: function(snapshot, group) {
      return $http.post(cpconfig.API_URL + '/cloud/addGroup/snapshot/' + snapshot.id + '/group/' + group);
    },
    addLoadBalancerGroup: function(loadBalancer, group) {
      return $http.post(cpconfig.API_URL + '/cloud/addGroup/load_balancer/' + loadBalancer.id + '/group/' + group);
    },
    removeInstanceGroup: function(server, group) {
      return $http.post(cpconfig.API_URL + '/cloud/removeGroup/instance/' + server.id + '/group/' + group);
    },
    removeVolumeGroup: function(volume, group) {
      return $http.post(cpconfig.API_URL + '/cloud/removeGroup/volume/' + volume.id + '/group/' + group);
    },
    removeSnapshotGroup: function(snapshot, group) {
      return $http.post(cpconfig.API_URL + '/cloud/removeGroup/snapshot/' + snapshot.id + '/group/' + group);
    },
    removeLoadBalancerGroup: function(loadBalancer, group) {
      return $http.post(cpconfig.API_URL + '/cloud/removeGroup/load_balancer/' + loadBalancer.id + '/group/' + group);
    },
    preloadClouds: function() {
      if (Session.user.customer) {
        return $http.post(cpconfig.API_URL + '/cloud/customer/' + Session.user.customer.id + '/preload');
      }
    },
    getCredentials: function() {
      $log.debug('Retrieving clouds for client', Session.user.customer.id);
      return $http.get(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud');
    },
    resetPassword: function(email) {
      $log.debug('Resetting password for user', email);
      return $http.get(cpconfig.API_URL + '/user/changePassword/' + email);
    },
    changePassword: function(email, passwordBean) {
      return $http.post(cpconfig.API_URL + '/user/changePassword/' + email, passwordBean);
    },
    reset2FA: function(email) {
      $log.debug('Resetting password for user', email);
      return $http.post(cpconfig.API_URL + '/user/reset2fa/' + email);
    },
    createCustomer: function(customer) {
        return $http.post(cpconfig.API_URL + '/customer', customer)
      },
    updateCustomer: function(customer) {
      return $http.put(cpconfig.API_URL + '/customer', customer);
    },
    createUser: function(user) {
      return $http.post(cpconfig.API_URL + '/user', user);
    },
    createAdmin: function(admin) {
      return $http.post(cpconfig.API_URL + '/user/admin', admin);
    },
    updateUser: function(user) {
      return $http.put(cpconfig.API_URL + '/user', user);
    },
    deleteUser: function(email) {
      return $http['delete'](cpconfig.API_URL + '/user/' + email);
    },
    addAmazonAccount: function(account) {
      return $http.post(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazon', account);
    },
    updateAmazonAccount: function(account) {
      return $http.put(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazon', account);
    },
    deleteAmazonAccount: function(cloudId) {
      return $http['delete'](cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazon/' + cloudId);
    },
    addAmazonRoleAccount: function(account) {
        return $http.post(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazonrole', account);
    },
    updateAmazonRoleAccount: function(account) {
        return $http.put(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazonrole', account);
    },
    deleteAmazonRoleAccount: function(cloudId) {
        return $http['delete'](cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazon/' + cloudId);
    },
    getAccountAndExternalId: function() {
      $log.debug('Getting Account ID & External ID to create amazon role');
      return $http.get(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/amazonrole').then(
          function(response) {
              return $q.resolve(response.data);
          }
      );
    },
    addSoftLayerAccount: function(account) {
      return $http.post(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/softlayer', account);
    },
    updateSoftLayerAccount: function(account) {
      return $http.put(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/softlayer', account);
    },
    deleteSoftLayerAccount: function(cloudId) {
      return $http['delete'](cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/cloud/softlayer/' + cloudId);
    },
    startInstance: function(id) {
      $log.debug('Starting instance with id', id);
      return $http.post(cpconfig.API_URL + '/cloud/instance/' + id + '/start');
    },
    startInstances: function(ids) {
      $log.debug('Starting instances ', ids);
      return $http.post(cpconfig.API_URL + '/cloud/instances/start', ids);
    },
    startGroup: function(name) {
      $log.debug('Starting group with name', name);
      return $http.post(cpconfig.API_URL + '/cloud/group/' + name + '/customer/' + Session.user.customer.id + '/start?automatic');
    },
    stopInstance: function(id) {
      $log.debug('Stopping instance with id', id);
      return $http.post(cpconfig.API_URL + '/cloud/instance/' + id + '/stop');
    },
    stopInstances: function(ids) {
      $log.debug('Stopping instances ', ids);
      return $http.post(cpconfig.API_URL + '/cloud/instances/stop', ids);
    },
    rebootInstance: function(id) {
      $log.debug('Restarting instance with id', id);
      return $http.post(cpconfig.API_URL + '/cloud/instance/' + id + '/reboot');
    },
    rebootInstances: function(ids) {
      $log.debug('Restarting instances ', ids);
      return $http.post(cpconfig.API_URL + '/cloud/instances/reboot', ids);
    },
    stopGroup: function(name) {
      $log.debug('Stopping group with name', name);
      return $http.post(cpconfig.API_URL + '/cloud/group/' + name + '/customer/' + Session.user.customer.id + '/stop?automatic');
    },
    rebootGroup: function(name) {
      $log.debug('Restarting group with name', name);
      return $http.post(cpconfig.API_URL + '/cloud/group/' + name + '/customer/' + Session.user.customer.id + '/reboot?automatic');
    },
    registerInstancesWithLoadBalancer: function (id, request) {
      $log.debug('Registering instances to load balancer', id);
      return $http.post(cpconfig.API_URL + '/cloud/load_balancers/' + id + '/register', request);
    },

    // -- Scheduling


    createWorkspaceSchedule: function(workspaceid, action, expression, timezone, expirationDate, extendedSchedule, startDate) {

      return $http.post(cpconfig.API_URL + '/cloud/schedule/workspace/' + workspaceid + '/' + action, {
        name: 'Schedule ' + action + ' for workspace ' + workspaceid,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },


    createInstanceSchedule: function(instanceId, action, expression, timezone, expirationDate, extendedSchedule, startDate) {

      return $http.post(cpconfig.API_URL + '/cloud/schedule/instance/' + instanceId + '/' + action, {
        name: 'Schedule ' + action + ' for instance ' + instanceId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createVolumeSchedule: function(volumeId, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/volume/' + volumeId + '/snapshot/take', {
        name: 'Scheduled snapshot for volume identified by ' + volumeId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createVolumeScheduleWithRegion: function(volumeId, expression, timezone, expirationDate, destinationRegion, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/volume/' + volumeId + '/snapshot/take/region/' + destinationRegion, {
        name: 'Scheduled snapshot for volume identified by ' + volumeId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createVolumeDeletionSchedule: function(volumeId, age, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/volume/' + volumeId + '/snapshot/delete/' + age, {
        name: 'Scheduled delete snapshots for volume identified by ' + volumeId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createVolumeResizeSchedule: function(volumeId, sizeIncrement, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/volume/' + volumeId + '/modifysize/' + sizeIncrement, {
        name: 'Scheduled snapshot for volume identified by ' + volumeId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createInstanceSnapshotSchedule: function(instanceId, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/instance/' + instanceId + '/snapshot/take', {
        name: 'Scheduled snapshots for instance identified by ' + instanceId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createInstanceSnapshotScheduleWithRegion: function(instanceId, expression, timezone, expirationDate, destinationRegion, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/instance/' + instanceId + '/snapshot/take/region/' + destinationRegion, {
        name: 'Scheduled snapshots for instance identified by ' + instanceId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createInstanceSnapshotDeletionSchedule: function(instanceId, age, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/instance/' + instanceId + '/snapshot/delete/' + age, {
        name: 'Scheduled delete snapshots for instance identified by ' + instanceId,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createGroupSnapshotSchedule: function(groupName, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/group/' + groupName + '/' + Session.user.customer.id + '/snapshot/take', {
        name: 'Scheduled snapshot for group identified by ' + groupName,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createGroupSnapshotScheduleWithRegion: function(groupName, expression, timezone, expirationDate, destinationRegion, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/group/' + groupName + '/' + Session.user.customer.id + '/snapshot/take/region/' + destinationRegion, {
        name: 'Scheduled snapshot for group identified by ' + groupName,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createGroupSnapshotDeletionSchedule: function(groupName, age, expression, timezone, expirationDate, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/group/' + groupName + '/' + Session.user.customer.id + '/snapshot/delete/' + age, {
        name: 'Scheduled delete snapshots for group identified by ' + groupName,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createGroupSchedule: function(group, action, expression, timezone, expirationDate, scheduleExcludedInstances, extendedSchedule, startDate) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/group/' + group + '/' + Session.user.customer.id + '/' + action, {
        name: 'Schedule ' + action + ' for group ' + group,
        cronExpression: expression,
        timeZoneId: timezone,
        expirationDate: expirationDate,
        scheduleExcludedInstances: scheduleExcludedInstances,
        extendedSchedule: extendedSchedule,
        validFrom: startDate
      });
    },

    createLambdaSchedule: function(lambdaId, model) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/lambda/' + lambdaId + '/invoke', model);
    },

    createEc2CommandSchedule: function(documentId, model) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/document/' + documentId + '/sendCommand', model);
    },

    createReverseSchedule: function(instanceId, model) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/instance/' + instanceId + '/reverse', model);
    },

    createElasticIpSchedule: function(instanceId, publicIp, model) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/instance/' + instanceId + '/elasticip/' + publicIp + '/assign', model);
    },

    getTasks: function() {
      $log.debug('Retrieving all customer tasks for customer', Session.user.customer.id);
      var deferred = $q.defer();

      this.getServers(false).then(function(servers) {
        $http.get(cpconfig.API_URL + '/cloud/schedule/customer/' + Session.user.customer.id).success(function(tasks) {
          for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            if (task.type === 'START_INSTANCE' || task.type === 'STOP_INSTANCE' || task.type === 'REBOOT_INSTANCE' ||
              task.type === 'TAKE_SNAPSHOT_INSTANCE' || task.type === 'DELETE_SNAPSHOT_INSTANCE') {
              for (var j = 0; j < servers.length; j++) {
                var server = servers[j];
                if (task.instanceId === server.id) {
                  task.instanceName = server.name;
                }
              }
            }
          }
          deferred.resolve({
            tasks: tasks,
            servers: servers
          });
        }).error(function() {
    Session.destroy();
          deferred.reject();
        });
      });

      return deferred.promise;
    },
    getTasksByCloudAccount: function(cloudAccountId) {
      $log.debug('Retrieving customer tasks for cloud account', cloudAccountId);
      var deferred = $q.defer();
      $http.get(cpconfig.API_URL + '/cloud/schedule/customer/' + Session.user.customer.id + '/account/' + cloudAccountId).success(function(tasks) {
        deferred.resolve(tasks);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    deleteTask: function(taskId) {
      return $http['delete'](cpconfig.API_URL + '/cloud/schedule/task/' + taskId);
    },
    getRunningStates: function(startTimestamp, stopTimestamp, pageSize, pageIdx, group) {
      var deferred = $q.defer();
      var url = cpconfig.API_URL + '/cloud/schedule/instances/customer/' + Session.user.customer.id +
        '/running/' + startTimestamp + '/' + stopTimestamp + '/pagination/' + pageSize + '/' + pageIdx;
      if (group && group !== '') {
        url += '/group/' + group;
      }
      $http.get(url).success(function(response) {
        deferred.resolve(response);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getActivityEvents: function(pageSize, pageIdx, customerId, automatic) {
      var deferred = $q.defer();
      $log.debug('Retrieving activity events with page size ' + pageSize + ' and index ' + pageIdx);

      var url = cpconfig.API_URL + '/cloud/events/' + pageSize + '/' + pageIdx;
      if (customerId !== null && customerId !== '') {
         url += '/customer/' + customerId;
      }

      if (automatic) {
        url += '?automatic';
      }
      $http.get(url).success(function(events) {
        deferred.resolve(events);
      }).error(function() {
            Session.destroy();
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    getActivityEventsByCustomer: function(pageSize, pageIdx, automatic) {
      var deferred = $q.defer();
      $log.debug('Retrieving activity events with page size ' + pageSize + ' and index ' + pageIdx);
      var url = cpconfig.API_URL + '/cloud/events/' + pageSize + '/' + pageIdx + '/customer/' + Session.user.customer.id;
      if (automatic) {
        url += '?automatic';
      }
      $http.get(url).success(function(events) {
        deferred.resolve(events);
      }).error(function() {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    updateHeadquarter: function(address, latitude, longitude) {
      return $http.post(cpconfig.API_URL + '/customer/' + Session.user.customer.id + '/headquarter', {
        address: address,
        latitude: latitude,
        longitude: longitude
      });
    },
    sendFeedback: function(message) {
      return $http.post(cpconfig.API_URL + '/user/email/support/full', {
        msg: message,
        page: $location.absUrl()
      });
    },
    enableCustomer: function(customerId) {
      return $http.put(cpconfig.API_URL + '/customer/' + customerId + '/enable');
    },
    disableCustomer: function(customerId) {
      return $http.put(cpconfig.API_URL + '/customer/' + customerId + '/disable');
    },

    toggleTutorial: function(state) {
      return $http.put(cpconfig.API_URL + '/user/' + Session.user.email + '/showTutorial/' + state).success(function() {
        Session.user.showTutorial = false;
        Session.setUser(Session.user);
      });
    },

    // -- Best Practices
    loadBestPractice: function(id) {
      return $http.get(cpconfig.API_URL + '/cloud/js_best_practice/' + id);
    },
    saveBestPractice: function(model) {
      model.creatorId = Session.user.customer.id;
      if (model.id !== null) {
        return $http.put(cpconfig.API_URL + '/cloud/js_best_practice/' + model.id, model);
      } else {
        return $http.post(cpconfig.API_URL + '/cloud/js_best_practice', model);
      }
    },
    removeBestPractice: function(id) {
      return $http.delete(cpconfig.API_URL + '/cloud/js_best_practice/' + id);
    },
    getBestPractices: function(category, importance) {
      var url = cpconfig.API_URL + '/best-practice/' + Session.user.customer.id + '?automatic=true';
      if (category !== '') {
        url += '&category=' + category;
      }
      if (importance !== 'ShowAll') {
        url += '&importance=' + importance;
      }
      return $http.get(url);
    },
    getBestPracticeResults: function(accountId, importance) {
      return $http.get(cpconfig.API_URL + '/best-practice/' + Session.user.customer.id + '/' + accountId + '/get_results?importance=' + importance + '&automatic=true');
    },
    configureBestPractice: function(practice) {
      return $http.post(cpconfig.API_URL + '/cloud/js_best_practice/configure/' + practice.id + '/customer/' + Session.user.customer.id, practice.parameters);
    },
    deleteConfiguration: function(configuration) {
      return $http.delete(cpconfig.API_URL + '/cloud/js_best_practice/configurations/' + configuration.id + '/customer/' + Session.user.customer.id);
    },

    // -- Lambda function
    getLambdas: function() {
      return $http.get(cpconfig.API_URL + '/cloud/lambda/list/' + Session.user.customer.id);
    },
    invokeLambda: function(lambdaId, payload) {
      return $http.post(cpconfig.API_URL + '/cloud/lambda/' + lambdaId + '/invoke', payload);
    },

    // -- Softlayer snapshotting

    enableWeeklySnapshots: function(volumeId, retentionCount, dow, hour, minute) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId + '/schedule', {
        type: 'WEEKLY',
        retentionCount: retentionCount,
        dayOfWeek: dow,
        hour: hour,
        minute: minute,
        enabled: true
      });
    },
    enableDailySnapshots: function(volumeId, retentionCount, hour, minute) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId + '/schedule', {
        type: 'DAILY',
        retentionCount: retentionCount,
        dayOfWeek: 1,
        hour: hour,
        minute: minute,
        enabled: true
      });
    },
    enableHourlySnapshots: function(volumeId, retentionCount, minute) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId + '/schedule', {
        type: 'HOURLY',
        retentionCount: retentionCount,
        dayOfWeek: 1,
        hour: 12,
        minute: minute,
        enabled: true
      });
    },
    disableWeeklySnapshots: function(volumeId) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId + '/schedule', {
        type: 'WEEKLY',
        retentionCount: 1,
        hour: 1,
        minute: 0,
        enabled: false
      });
    },
    disableDailySnapshots: function(volumeId) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId + '/schedule', {
        type: 'DAILY',
        retentionCount: 1,
        hour: 1,
        minute: 0,
        enabled: false
      });
    },
    disableHourlySnapshots: function(volumeId) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + volumeId + '/schedule', {
        type: 'HOURLY',
        retentionCount: 1,
        minute: 0,
        enabled: false
      });
    },
    copySnapshotTo: function(snapshotId, destination) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshots/' + snapshotId + '/copy/' + destination);
    },
    updateTask: function(taskId, model) {
      return $http.put(cpconfig.API_URL + '/cloud/schedule/task/' + taskId, model);
    },
    updateGroupTask: function(taskId, model) {
      return $http.put(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/group', model);
    },
    updateTakeSnapshotTask: function(taskId, model) {
      return $http.put(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/snapshot', model);
    },
    updateDeleteSnapshotTask: function(taskId, model) {
      return $http.put(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/snapshot/delete', model);
    },
    updateLambdaTask: function(taskId, model) {
      return $http.put(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/lambda', model);
    },
    getDocuments: function () {
      return $http.get(cpconfig.API_URL + '/cloud/document/list/' + Session.user.customer.id);
    },
    runDocument: function (documentId, request) {
      return $http.post(cpconfig.API_URL + '/cloud/document/' + documentId + '/sendCommand', request);
    },
    getEventTypes: function() {
      return $http.get(cpconfig.API_URL + '/event/types');
    },
    createEventNotification: function(eventNotification) {
      return $http.post(cpconfig.API_URL + '/event/notification', eventNotification);
    },
    updateEventStreamNotification: function(eventNotification) {
      return $http.post(cpconfig.API_URL + '/event/notification/' + eventNotification.id + '/update', eventNotification);
    },
    deleteEventNotifications: function(eventNotificationIds) {
      return $http({
        url: cpconfig.API_URL + '/event/delete',
        method: 'DELETE',
        data: eventNotificationIds,
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
    },
    getEventNotifications: function() {
      var deferred = $q.defer();
      $http.get(cpconfig.API_URL + '/event//list').success(function (eventStreamNotifications) {
        deferred.resolve(eventStreamNotifications);
      }).error(function () {
    Session.destroy();
        deferred.reject();
      });
      return deferred.promise;
    },
    skipNextExecution: function (taskId, eventId) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/event/' + eventId + '/skipNextExecution');
    },
    postponeNextExecution: function (taskId, eventId, minutes) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/event/' + eventId + '/posponeNextExecution/' + minutes + '/minutes' );
    },
    disableTaskUntil: function (taskId, date) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/disableUntil', {
        validFrom: date
      });
    },
    cancelTaskActions: function (taskId, eventId) {
      return $http.post(cpconfig.API_URL + '/cloud/schedule/task/' + taskId + '/event/' + eventId + '/removeScheduledActions');
    },
    getAvailableIpsForInstance: function (instanceId) {
      return $http.get(cpconfig.API_URL + '/cloud/instance/' + instanceId + '/availableIps');
    },
    addEip: function (instanceId, publicIp) {
      return $http.get(cpconfig.API_URL + '/cloud/instance/' + instanceId + '/elasticip/' + publicIp + '/associate');
    },
    removeEip: function (instanceId, publicIp) {
      return $http.get(cpconfig.API_URL + '/cloud/instance/' + instanceId + '/elasticip/' + publicIp + '/disassociate');
    },
    modifyVolumeSize: function (volumeId, newSize) {
      return $http.get(cpconfig.API_URL + '/cloud/volume/' + volumeId + '/modifySize/' + newSize);
    },
    // Security Groups
    getSecurityGroups: function () {
      return $http.get(cpconfig.API_URL + '/cloud/security-group/customer/' + Session.user.customer.id + '/list').then(function(response) {
        return response.data;
      });
    },
    saveSecurityGroup: function (securityGroup) {
      return $http.post(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + securityGroup.cloudAccountId, securityGroup);
    },
    deleteSecurityGroup: function (securityGroup) {
      $http.defaults.headers.delete = { 'Content-Type': 'application/json;charset=utf-8' };
      return $http.delete(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + securityGroup.cloudAccountId,
        {
          data: {
            groupId: securityGroup.groupId,
            regionId: securityGroup.regionId
          }
        }
      );
    },
    removeOutboundRule: function (securityGroup, outboundRule) {
      return $http.post(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + securityGroup.cloudAccountId + '/revokeOutboundPermission', outboundRule);
    },
    removeInboundRule: function (securityGroup, inboundRule) {
      return $http.post(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + securityGroup.cloudAccountId + '/revokeInboundPermission', inboundRule);
    },
    saveInboundRule: function (securityGroup, inboundRule) {
      return $http.post(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + securityGroup.cloudAccountId + '/addInboundPermission', inboundRule);
    },
    saveOutboundRule: function (securityGroup, outboundRule) {
      return $http.post(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + securityGroup.cloudAccountId + '/addOutboundPermission', outboundRule);
    },
    getVpcListByRegionId: function (cloudAccountId, regionId) {
      return $http.get(cpconfig.API_URL + '/cloud/security-group/cloudAccount/' + cloudAccountId + '/vpcs/' + regionId).then(function(response) {
        return response.data;
      });
    },
    getWorkspaces: function (request) {
      return $http.post(cpconfig.API_URL + '/workspace/customer/' + Session.user.customer.id + '/list', request).then(function(response) {
        return response.data;
      });
    },
    getWorkspaceDetails: function (request) {

      return $http.post(cpconfig.API_URL + '/workspace/customer/' + Session.user.customer.id + '/listDetails', request).then(function(response) {
        return response.data;
      });
    }
  };
});
