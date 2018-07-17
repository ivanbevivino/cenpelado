'use strict';

// --------------------------------------------------------------------------
// Tag service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('PermissionService', function($http) {
  return {
    addUserPermission: function(user, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/addPermission/user/' + user.id + '/permission/' + permission);
    },
    addInstancePermission: function(instance, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/addPermission/instance/' + instance.id + '/permission/' + permission);
    },
    addVolumePermission: function(volume, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/addPermission/volume/' + volume.id + '/permission/' + permission);
    },
    addSnapshotPermission: function(snapshot, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/addPermission/snapshot/' + snapshot.id + '/permission/' + permission);
    },
    addLoadBalancerPermission: function(loadBalancer, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/addPermission/load_balancer/' + loadBalancer.id + '/permission/' + permission);
    },
    removeUserPermission: function(user, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/removePermission/user/' + user.id + '/permission/' + permission);
    },
    removeInstancePermission: function(instance, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/removePermission/instance/' + instance.id + '/permission/' + permission);
    },
    removeVolumePermission: function(volume, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/removePermission/volume/' + volume.id + '/permission/' + permission);
    },
    removeSnapshotPermission: function(snapshot, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/removePermission/snapshot/' + snapshot.id + '/permission/' + permission);
    },
    removeLoadBalancerPermission: function(loadBalancer, permission) {
      return $http.post(cpconfig.API_URL + '/cloud/removePermission/load_balancer/' + loadBalancer.id + '/permission/' + permission);
    }
  };
});
