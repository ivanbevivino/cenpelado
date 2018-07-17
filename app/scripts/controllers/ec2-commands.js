'use strict';

angular.module('cloudpoxee.controllers').controller('Ec2CommandsCtrl', function($log, $scope, $filter, $aside, growl, CloudAPI, SchedulingService) {
  $log.debug('CloudPoxee EC2 commands controller...');

  var aside = null;
  $scope.commands = null;

  CloudAPI.getDocuments().then(function (response) {
    $scope.commands = response.data;
    $log.debug($scope.commands);
  });

  $scope.configureAndSchedule = function (command) {
    SchedulingService.openWidget('EC2_COMMAND', angular.copy(command), false);
  };

  $scope.configureAndRun = function (command) {
    var scope = $scope.$new();
    scope.model = {};
    scope.command = angular.copy(command);

    angular.forEach(scope.command.parameters, function (parameter) {
      parameter.value = parameter.defaultValue;
    });

    var items = [];
    CloudAPI.getServers(false).then(function (response) {
      angular.forEach(response, function (item) {
        if (item.managed) {
          if (item.location.name === command.location.name) {
            items.push({ id: item.id, label: item.name + '  (' + item.externalId + ')' });
          }
        }
      });
    });

    scope.loadItems = function ($query) {
      return $filter('autocomplete')(items, $query);
    };

    scope.run = function () {
      if (scope.model.selection && scope.model.selection.length > 0) {
        var parameters = {};
        if (scope.command.parameters !== null) {
          angular.forEach(scope.command.parameters, function (parameter) {
            parameters[parameter.name] = parameter.value;
          });
        }

        CloudAPI.runDocument(scope.command.id, {
          documentName: scope.command.name,
          instanceIds: scope.model.selection.map(function (server) { return server.id; }),
          parameters: parameters
        }).then(function () {
          growl.success('RUN_COMMAND_SUCCESS');
          aside.hide();
        }, function () {
          growl.error('RUN_COMMAND_ERROR');
        });
      } else {
        growl.error('RUN_COMMAND_FIELD_ERROR');
      }
    };
    aside = $aside({
      scope: scope,
      container: 'body',
      placement: 'right',
      template: 'views/templates/ec2-command/run.html'
    });
  };

});
