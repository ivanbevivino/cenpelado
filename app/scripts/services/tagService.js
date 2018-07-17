'use strict';

// --------------------------------------------------------------------------
// Tag service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('TagService', function($http) {
  return {
    saveInstanceTag: function (id, name, value) {
      return $http.post(cpconfig.API_URL + '/cloud/instance/' + id + '/' + name + '/' + value);
    },
    deleteInstanceTag: function (id, name) {
      return $http.delete(cpconfig.API_URL + '/cloud/instance/' + id + '/' + name);
    },
    saveLoadBalancerTag: function (id, name, value) {
      return $http.post(cpconfig.API_URL + '/cloud/load_balancer/' + id + '/' + name + '/' + value);
    },
    deleteLoadBalancerTag: function (id, name) {
      return $http.delete(cpconfig.API_URL + '/cloud/load_balancer/' + id + '/' + name);
    },
    saveSnapshotTag: function (id, name, value) {
      return $http.post(cpconfig.API_URL + '/cloud/snapshot/' + id + '/' + name + '/' + value);
    },
    deleteSnapshotTag: function (id, name) {
      return $http.delete(cpconfig.API_URL + '/cloud/snapshot/' + id + '/' + name);
    }
  };
});
