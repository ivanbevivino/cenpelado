'use strict';

angular.module('cloudpoxee.controllers').controller('SchedulingCtrl', function($log, $scope, $rootScope, $filter, $q, growl, CloudAPI, SchedulingService) {

  $log.debug('CloudPoxee scheduling controller...');

  function loadTasks() {
    var deferred = $q.defer();
    CloudAPI.getTasks().then(function(taskData) {

      var tasks = taskData.tasks;
      $scope.tab = 0;
      $scope.servers = [];
      $scope.volumes = [];
      $scope.groups = [];
      $scope.lambdas = [];
      $scope.commands = [];
      $scope.workspaces = [];

      angular.forEach(tasks, function(task) {
        switch (task.type) {
          case 'START_INSTANCE':
          case 'STOP_INSTANCE':
          case 'REBOOT_INSTANCE':
          case 'INSTANCE_REMINDER':
          case 'ASSIGN_EIP_INSTANCE':
            $scope.servers.push(task);
            break;
          case "START_WORKSPACE":
          case 'STOP_WORKSPACE':
          case 'REBOOT_WORKSPACE':
          case 'REBUILD_WORKSPACE':
            $scope.workspaces.push(task);
            break;
          case 'START_GROUP':
          case 'STOP_GROUP':
          case 'REBOOT_GROUP':
            $scope.groups.push(task);
            break;

          case 'TAKE_SNAPSHOT':
          case 'TAKE_SNAPSHOT_ENVIRONMENT':
          case 'TAKE_SNAPSHOT_INSTANCE':
          case 'TAKE_SNAPSHOT_SOFTLAYER':
          case 'DELETE_SNAPSHOT':
          case 'DELETE_SNAPSHOT_ENVIRONMENT':
          case 'DELETE_SNAPSHOT_INSTANCE':
          case 'MODIFY_VOLUME_SIZE':
            $scope.volumes.push(task);
            break;

          case 'INVOKE_LAMBDA':
            $scope.lambdas.push(task);
            break;

          case 'SEND_COMMAND':
            $log.debug(task);
            $scope.commands.push(task);
            break;
        }
      });

      deferred.resolve(tasks);
    });
    return deferred.promise;
  }

  loadTasks();

  $scope.schedule = function() {
    SchedulingService.openWidget(null, null, true, function() {
      loadTasks();
    });
  };

  $scope.deleteSchedules = function() {
    var tasks = [];
    switch ($scope.tab) {
      case 0:
        tasks = $scope.servers;
        break;
      case 1:
        tasks = $scope.volumes;
        break;
      case 2:
        tasks = $scope.groups;
        break;
      case 3:
        tasks = $scope.lambdas;
        break;
      case 4:
        tasks = $scope.commands;
        break;
      case 5:
        tasks = $scope.workspaces;
        break;
    }

    var selectedTasks = $filter('filter')(tasks, {
      active: true
    });
    if (selectedTasks.length > 0) {
      var requests = [];
      for (var i = 0; i < selectedTasks.length; i++) {
        requests.push(CloudAPI.deleteTask(selectedTasks[i].id));
      }
      $q.all(requests).then(function() {
        loadTasks().then(function() {
          growl.success('TASK_REMOVED');
        });
      });
    } else {
      growl.warning('TASKS_SELECTION');
    }
  };

  $scope.editTask = function(task, $event) {
    $event.stopPropagation();

    switch (task.type) {
      case 'START_GROUP':
      case 'STOP_GROUP':
      case 'REBOOT_GROUP':
        SchedulingService.openUpdateWidget('UPDATE_GROUP_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      case 'START_INSTANCE':
      case 'STOP_INSTANCE':
      case 'REBOOT_INSTANCE':
        SchedulingService.openUpdateWidget('UPDATE_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      case 'INSTANCE_REMINDER':
        SchedulingService.openUpdateWidget('UPDATE_REVERSE_SCHEDULE', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      case 'TAKE_SNAPSHOT':
      case 'TAKE_SNAPSHOT_INSTANCE':
      case 'TAKE_SNAPSHOT_GROUP':
        SchedulingService.openUpdateWidget('UPDATE_SNAPSHOT_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      case 'DELETE_SNAPSHOT':
      case 'DELETE_SNAPSHOT_INSTANCE':
      case 'DELETE_SNAPSHOT_GROUP':
        SchedulingService.openUpdateWidget('UPDATE_DELETE_SNAPSHOT_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      case 'INVOKE_LAMBDA':
        SchedulingService.openUpdateWidget('UPDATE_INVOKE_LAMBDA_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      case 'SEND_COMMAND':
        SchedulingService.openUpdateWidget('UPDATE_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
      default:
        SchedulingService.openUpdateWidget('UPDATE_TASK', task, function() {
          CloudAPI.getTasks().then(function(taskData) {
            $scope.tasks = taskData.tasks;
          });
        });
        break;
    }
  };

  $scope.toggleAll = function(type) {
    angular.forEach($scope[type], function(row) {
      row.active = $scope[type + 'AllActive'] ? false : true;
    });
    $scope[type + 'AllActive'] = !$scope[type + 'AllActive'];
  };

  $scope.toggleOne = function(type, row) {
    $scope[type + 'AllActive'] = false;
    row.active = !row.active;
  };
});
