'use strict';

// --------------------------------------------------------------------------
// Dropdown data service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('LoadBalancerOptions', function($log, $rootScope, $translate, $filter, $q, $modal, growl, CloudAPI) {
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
          text: $translate.instant('ADD_GROUP'),
          click: function() {
            var items = $filter('filter')(getModel(scope, itemsPath), { active: true });
            if (items.length > 0) {
              var innerScope = scope.$new();

              innerScope.addGroup = function(groupName) {
                if (!_.isEmpty(groupName)) {
                  var requests = [];
                  for (var i = 0; i < items.length; i++) {
                    requests.push(CloudAPI.addLoadBalancerGroup(items[i], groupName));
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
                    requests.push(CloudAPI.removeLoadBalancerGroup(items[i], groupName));
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
