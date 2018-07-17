'use strict';

// --------------------------------------------------------------------------
// Dropdown data service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('ServerOptions', function($log, $rootScope, $translate, $filter, $aside, $q, $modal, growl, CloudAPI, SchedulingService) {
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
    setOptions: function(scope, path, itemsPath, startAction, stopAction) {
      var that = this;
      scope[path] = [
        {
          text: $translate.instant('START'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), {active: true});
            if (servers.length > 0) {
              CloudAPI.startInstances({
                ids: servers.map(function (i) {
                  return i.id;
                })
              })
                .then(function () {
                  growl.success('SERVERS_STARTED');
                  stopAction();
                }, function () {
                  growl.error('SERVERS_STARTED_FAILED');
                  stopAction();
                });
            } else {
              growl.warning('SERVERS_SELECTION');
              stopAction();
            }
          }
        },
        {
          text: $translate.instant('STOP'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (servers.length > 0) {
              CloudAPI.stopInstances({
                ids: servers.map(function (i) {
                  return i.id;
                })
              })
                .then(function () {
                  growl.success('SERVERS_STOPPED');
                  stopAction();
                }, function () {
                  growl.error('SERVERS_STOPPED_FAILED');
                  stopAction();
                });
            } else {
              growl.warning('SERVERS_SELECTION');
              stopAction();
            }
          }
        },
        {
          text: $translate.instant('RESTART'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (servers.length > 0) {
              CloudAPI.rebootInstances({
                ids: servers.map(function (i) {
                  return i.id;
                })
              })
                .then(function () {
                  growl.success('SERVERS_RESTARTED');
                  stopAction();
                }, function () {
                  growl.error('SERVERS_RESTARTED_FAILED');
                  stopAction();
                });
            } else {
              growl.warning('SERVERS_SELECTION');
              stopAction();
            }
          }
        },
        {
          'divider': true
        },
        {
          text: $translate.instant('SCHEDULE'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            var selection = [];
            if (servers.length > 0) {
              angular.forEach(servers, function (item) {
                selection.push({ id: item.id, label: item.name + '  (' + item.externalId + ')' });
              });
            }
            SchedulingService.openWidget('SERVERS', selection, true);
            stopAction();
          }
        },
        {
          text: $translate.instant('REVERSE_SCHEDULE'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            var selection = [];
            if (servers.length > 0) {
              angular.forEach(servers, function (item) {
                selection.push({ id: item.id, label: item.name + '  (' + item.externalId + ')' });
              });
            }
            SchedulingService.openWidget('REVERSE_SCHEDULE', selection, true);
            stopAction();
          }
        },
        {
          text: $translate.instant('ELASTIC_IP_SCHEDULE'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            var selection = [];
            if (servers.length === 1) {
              angular.forEach(servers, function (item) {
                selection.push({ id: item.id, label: item.name + '  (' + item.externalId + ')' });
              });
              SchedulingService.openWidget('ELASTIC_IP_SCHEDULE', selection, true);
            } else {
              growl.warning('SERVERS_SINGLE_SELECTION');
            }
            stopAction();
          }
        },
        {
          'divider': true
        },
        {
          text: $translate.instant('ADD_GROUP'),
          click: function() {
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (servers.length > 0) {
              var innerScope = scope.$new();

              innerScope.addGroup = function(groupName) {
                if (!_.isEmpty(groupName)) {
                  var requests = [];
                  for (var i = 0; i < servers.length; i++) {
                    requests.push(CloudAPI.addInstanceGroup(servers[i], groupName));
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
            } else {
              growl.warning('SERVERS_SELECTION');
            }
          }
        },
        {
          text: $translate.instant('REMOVE_GROUP'),
          click: function() {
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (servers.length > 0) {
              var innerScope = scope.$new();

              innerScope.removeGroup = function(groupName) {
                if (!_.isEmpty(groupName)) {
                  var requests = [];
                  for (var i = 0; i < servers.length; i++) {
                    requests.push(CloudAPI.removeInstanceGroup(servers[i], groupName));
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
            } else {
              growl.warning('SERVERS_SELECTION');
            }
          }
        },
        {
          'divider': true
        },
        {
          text: $translate.instant('ELASTIC_IPS'),
          click: function() {
            startAction();
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (servers.length === 1) {
              SchedulingService.openElasticIpsWidget(servers);
            } else {
              growl.warning('SERVERS_SINGLE_SELECTION');
            }
            stopAction();
          }
        },
        {
          'divider': true
        },
        {
          text: $translate.instant('ATTACH_TO_LB'),
          click: function() {
            var servers = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (servers.length > 0) {
              var locationId = servers[0].location.id;
              var instanceIds = [];
              var sameLocation = true;
              for (var i = 0; i < servers.length; i++) {
                if (servers[i].location.id !== locationId) {
                  sameLocation = false;
                }
                instanceIds.push(servers[i].id);
              }

              if (sameLocation) {
                var aside;
                var innerScope = scope.$new();
                innerScope.model = {};

                var items = [];
                CloudAPI.getLoadBalancers().then(function(loadBalancers) {
                  for (var i = 0; i < loadBalancers.length; i++) {
                    if (loadBalancers[i].location.id === locationId && loadBalancers[i].managed) {
                      var item = loadBalancers[i];
                      items.push({ id: item.id, label: item.externalId + ' (' + item.location.name + ')' });
                    }
                  }

                  innerScope.loadItems = function ($query) {
                    return $filter('autocomplete')(items, $query);
                  };
                });

                innerScope.register = function () {
                  if (innerScope.model.selection) {
                    var requests = [];
                    angular.forEach(innerScope.model.selection, function (lb) {
                      requests.push(CloudAPI.registerInstancesWithLoadBalancer(lb.id, {
                        instances: instanceIds
                      }));
                    });

                    $q.all(requests).then(function () {
                      growl.success('SERVERS_REGISTERED_TO_LOAD_BALANCER');
                    }, function () {
                      growl.error('SERVERS_REGISTERED_TO_LOAD_BALANCER_ERROR');
                    }).finally(function () {
                      aside.hide();
                    });
                  }
                };

                aside = $aside({
                  scope: innerScope,
                  container: 'body',
                  placement: 'right',
                  template: 'views/templates/attach-lb-aside.html',
                  backdrop: 'static'
                });

              } else {
                growl.warning('SERVERS_LOCATION_MISMATCH');
              }
            } else {
              growl.warning('SERVERS_SELECTION');
            }
          }
        },
      ];

      if (eventCleanup !== null) {
        eventCleanup();
      }
      eventCleanup = $rootScope.$on('$translateChangeSuccess', function() {
        that.setOptions(scope, path, itemsPath, startAction, stopAction);
      });
    }
  };
});
