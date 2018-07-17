'use strict';

angular.module('cloudpoxee.controllers').controller('LoadBalancersCtrl',
  function($log, $scope, $rootScope, $interval, growl, LoadBalancerOptions, CloudAPI, TagHandler) {

  $log.debug('CloudPoxee load balancers controller...');
  CloudAPI.getLoadBalancers().then(function(response) {
    $scope.loadBalancers = response;

    // -- Tag management
    TagHandler.initialize($scope, $rootScope);
    TagHandler.configureType('lb', 'loadBalancers');
  });

  // -- Load balancer actions
  LoadBalancerOptions.setOptions(
    $scope,
    'loadBalancerOptions',
    'loadBalancers',
    function() {}
  );

  // -- Auto refresh

  var lbTimer = $interval(function() {
    $log.debug('Refreshing load balancers...');
    CloudAPI.getLoadBalancers(true).then(function(response) {
      for (var i = 0; i < $scope.loadBalancers.length; i++) {
        var loadBalancer = $scope.loadBalancers[i];
        if (loadBalancer.active) {
          for (var j = 0; j < response.length; j++) {
            if (loadBalancer.id === response[j].id) {
              response[j].active = true;
            }
          }
        }
      }
      $scope.loadBalancers = response;
      // We need to re-configure TagHandler so that it updates it's items
      TagHandler.configureType('lb', 'loadBalancers');
    });
  }, 30000);

  // -- Listeners

  $scope.$on('$destroy', function() {
    $interval.cancel(lbTimer);
  });

});
