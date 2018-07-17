'use strict';

// --------------------------------------------------------------------------
// Admin Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('AdminService', function($log, $q, CloudAPI) {
  var adminService = {
    activeClient: null
  };

  adminService.setActiveClient = function(client) {
    this.activeClient = client;
  };

  adminService.getActiveClient = function() {
    return this.activeClient;
  };

  adminService.getClients = function() {
    var deferred = $q.defer();
    CloudAPI.getCustomers().success(function(data) {
      $log.debug('Clients retrieved', data);
      deferred.resolve(data);
    }).error(function() {
      $log.warn('Error retrieving clients');
      deferred.reject();
    });
    return deferred.promise;
  };

  return adminService;
});
