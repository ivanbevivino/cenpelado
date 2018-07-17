'use strict';

angular.module('cloudpoxee.controllers').controller('ServersCtrl', function($log, $scope, $rootScope, $filter, $interval, growl,
  servers, ServerOptions, CloudAPI, TagHandler) {

  $log.debug('CloudPoxee servers controller...');
  $scope.servers = servers;

  // -- Server Actions
  ServerOptions.setOptions(
    $scope,
    'serverOptions',
    'servers',
    function() {
      $interval.cancel(serverTimer);
    },
    function() {
      if ($scope.servers) {
        for (var i = 0; i < $scope.servers.length; i++) {
          $scope.servers[i].active = false;
        }
      }

      serverTimer = $interval(function() {
        $log.debug('Updating servers...');
        refreshServers();
      }, 10000);
      refreshServers();
    }
  );

  // -- Update servers
  function refreshServers() {
    CloudAPI.getServers(true).then(function(data) {
      for (var i = 0; i < $scope.servers.length; i++) {
        var server = $scope.servers[i];
        if (server.active) {
          for (var j = 0; j < data.length; j++) {
            if (server.id === data[j].id) {
              data[j].active = true;
            }
          }
        }
      }
      $scope.servers = data;
      // We need to re-configure TagHandler so that it updates it's items
      TagHandler.configureType('sv', 'servers');
    });
  }

  // -- Tag management

  TagHandler.initialize($scope, $rootScope);
  TagHandler.configureType('sv', 'servers');

  // -- Auto refresh

  var serverTimer = $interval(function() {
    $log.debug('Updating servers...');
    refreshServers();
  }, 20000);

  // -- Listeners

  $scope.$on('cloud:preloaded', function() {
    refreshServers();
  });

  $scope.$on('$destroy', function() {
    $interval.cancel(serverTimer);
  });

});
