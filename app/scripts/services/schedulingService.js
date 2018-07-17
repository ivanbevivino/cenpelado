'use strict';

// --------------------------------------------------------------------------
// Keeps authentication service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('SchedulingService', function($log, $filter, $aside, $translate, $rootScope, $q, growl, CloudAPI, WorkspaceAPI) {
  var service = {};
  var aside = null;
  var scope = null;

  function initializeScope(scope, type, selection, showSelection, task, callback) {
    scope.model = {};
    scope.callback = callback;
    initializeCronData(scope);
    scope.allDays = [{
        id: 'MON',
        label: $translate.instant('MONDAY')
      },
      {
        id: 'TUE',
        label: $translate.instant('TUESDAY')
      },
      {
        id: 'WED',
        label: $translate.instant('WEDNESDAY')
      },
      {
        id: 'THU',
        label: $translate.instant('THURSDAY')
      },
      {
        id: 'FRI',
        label: $translate.instant('FRIDAY')
      },
      {
        id: 'SAT',
        label: $translate.instant('SATURDAY')
      },
      {
        id: 'SUN',
        label: $translate.instant('SUNDAY')
      }
    ];

    if (!type) {
      scope.view = 'SELECTION';
      scope.showSelection = true;
    } else {
      scope.view = type + '_SELECTION';
      scope.type = type;
      scope.showSelection = showSelection;
      scope.model.selection = selection;

      switch (type) {
        case 'SERVERS':
          initializeServersData(scope);
          break;
        case 'WORKSPACES':
          initializeWorkspacesData(scope);
          break;
        case 'REVERSE_SCHEDULE':
          initializeReverseScheduleData(scope);
          break;
        case 'ELASTIC_IP_SCHEDULE':
          initializeElasticIpScheduleData(scope);
          break;
        case 'VOLUMES':
          initializeVolumesData(scope);
          break;
        case 'VOLUMES_RESIZE':
          initializeVolumesResizeData(scope);
          break;
        case 'GROUPS':
          initializeGroupsData(scope);
          break;
        case 'LAMBDA':
          initializeLambdaData(scope);
          break;
        case 'EC2_COMMAND':
          initializeCommandData(scope);
          break;
        case 'UPDATE_TASK':
          initializeTaskData(scope, task, callback);
          break;
        case 'UPDATE_REVERSE_SCHEDULE':
          initializeTaskData(scope, task, callback);
          break;
        case 'UPDATE_GROUP_TASK':
          initializeTaskData(scope, task, callback);
          parseGroupTaskFields(scope, task);
          break;
        case 'UPDATE_SNAPSHOT_TASK':
          initializeTaskData(scope, task, callback);
          parseCustomTaskFields(scope, task);
          break;
        case 'UPDATE_DELETE_SNAPSHOT_TASK':
          initializeTaskData(scope, task, callback);
          parseCustomTaskFields(scope, task);
          break;
        case 'UPDATE_INVOKE_LAMBDA_TASK':
          initializeTaskData(scope, task, callback);
          parseCustomTaskFields(scope, task, callback);
          break;
        case 'UPDATE_EC2_COMMAND_TASK':
          initializeTaskData(scope, task, callback);
          // parseCustomEc2CommandTaskFields(scope, task, callback);
          break;
      }
    }

    scope.cancel = function() {
      if (scope.type) {
        aside.hide();
      } else {
        scope.view = 'SELECTION';
      }
    };

    scope.selectCloudItem = function(type) {
      scope.view = type + '_SELECTION';

      switch (type) {
        case 'SERVERS':
          initializeServersData(scope);
          break;
        case 'VOLUMES':
          initializeVolumesData(scope);
          break;
        case 'GROUPS':
          initializeGroupsData(scope);
          break;
        case 'LAMBDA':
          initializeLambdaData(scope);
          break;
        case 'EC2_COMMAND':
          initializeCommandData(scope);
          break;
        case 'WORKSPACES':
          initializeWorkspacesData(scope);
          break;
      }
    };

    return scope;
  }

  function initializeCronData(scope) {
    scope.hours = [];
    for (var i = 0; i < 24; i++) {
      scope.hours.push(i);
    }

    scope.minutes = [];
    for (var j = 0; j < 60; j++) {
      scope.minutes.push(j);
    }

    scope.days = [];
    for (var k = 1; k <= 31; k++) {
      scope.days.push(k);
    }

    angular.extend(scope.model, {
      period: 'day',
      hour: 12,
      minute: 0,
      month: 1,
      pastTheHour: 0,
      daysOfWeek: [],
      day: 1,
      timezone: 'US/Eastern'
    });
  }

  // ------------------------------
  // Servers data & functionality
  // ------------------------------

  function initializeServersData(scope) {
    angular.extend(scope.model, {
      maxAge: 7,
      type: 'start'
    });

    if (scope.showSelection) {
      var items = [];
      CloudAPI.getServers(false).then(function(response) {
        angular.forEach(response, function(item) {
          if (item.managed) {
            items.push({
              id: item.id,
              label: item.name + '  (' + item.externalId + ')'
            });
          }
        });

        items = $filter('orderBy')(items, 'label');
      });

      scope.loadItems = function($query) {
        return $filter('autocomplete')(items, $query);
      };
    }

    scope.schedule = function() {
      var requests = [];
      switch (scope.model.type) {
        case 'start':
        case 'stop':
        case 'reboot':
          angular.forEach(scope.model.selection, function(item) {
            requests.push(CloudAPI.createInstanceSchedule(
              item.id,
              scope.model.type,
              retrieveCronExpression(scope),
              scope.model.timezone,
              scope.model.expirationDate,
              scope.model.extendedSchedule,
              scope.model.startDate
            ));
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SERVERS_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            });
          } else {
            growl.warning('SERVERS_SELECTION');
          }
          break;
        case 'take_snapshot':
          angular.forEach(scope.model.selection, function(item) {
            if (scope.model.region && scope.model.region !== '') {
              requests.push(CloudAPI.createInstanceSnapshotScheduleWithRegion(
                item.id,
                retrieveCronExpression(scope),
                scope.model.timezone,
                scope.model.expirationDate,
                scope.model.region,
                scope.model.extendedSchedule,
                scope.model.startDate
              ));
            } else {
              requests.push(CloudAPI.createInstanceSnapshotSchedule(
                item.id,
                retrieveCronExpression(scope),
                scope.model.timezone,
                scope.model.expirationDate,
                scope.model.extendedSchedule,
                scope.model.startDate
              ));
            }
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SNAPSHOTS_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function() {
              growl.error('SCHEDULING_FAILED');
              aside.hide();
            });
          } else {
            growl.warning('SERVERS_SELECTION');
          }
          break;
        case 'delete_snapshot':
          angular.forEach(scope.model.selection, function(item) {
            requests.push(CloudAPI.createInstanceSnapshotDeletionSchedule(
              item.id,
              scope.model.maxAge,
              retrieveCronExpression(scope),
              scope.model.timezone,
              scope.model.expirationDate,
              scope.model.extendedSchedule,
              scope.model.startDate
            ));
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SNAPSHOTS_DELETION_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function() {
              growl.error('SCHEDULING_FAILED');
              aside.hide();
            });
          } else {
            growl.warning('SERVERS_SELECTION');
          }
          break;
      }
    };
  }





  function initializeWorkspacesData(scope) {

    angular.extend(scope.model, {
      maxAge: 7,
      type: 'start'
    });

    if (scope.showSelection) {
      var items = [];

      WorkspaceAPI.getWorkspaces({}).then(function(response) {


        var elements = response;


        //Get details after load

        var idsToLoad = [];

        angular.forEach(elements, function(element) {
          if (!element.loading && !element.loaded) {
            element.loading = true;
            idsToLoad.push(element.id);
          }
        });

        if (idsToLoad.length > 0) {
          WorkspaceAPI.getWorkspaceDetails(idsToLoad).then(function(responses) {

            for (var i = 0; i < responses.length; i++) {
              if (responses[i].isManaged != false) {
                items.push({
                  id: responses[i].id,
                  label: responses[i].userName + '  (' + responses[i].workspaceId + ')'
                });
              }
            }
          })
        }







        items = $filter('orderBy')(items, 'label');
      });

      scope.loadItems = function($query) {
        return $filter('autocomplete')(items, $query);
      };
    }

    scope.schedule = function() {

      var requests = [];
      switch (scope.model.type) {
        case 'start':
        case 'stop':
        case 'reboot':
        case 'rebuild':
          angular.forEach(scope.model.selection, function(item) {
            requests.push(CloudAPI.createWorkspaceSchedule(
              item.id,
              scope.model.type,
              retrieveCronExpression(scope),
              scope.model.timezone,
              scope.model.expirationDate,
              scope.model.extendedSchedule,
              scope.model.startDate
            ));
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SERVERS_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            });
          } else {
            growl.warning('SERVERS_SELECTION');
          }
          break;


      }
    };
  }







  function initializeReverseScheduleData(scope) {
    angular.extend(scope.model, {
      maxAge: 7,
      type: 'start',
      status: 'RUNNING'
    });

    if (scope.showSelection) {
      var items = [];
      CloudAPI.getServers(false).then(function(response) {
        angular.forEach(response, function(item) {
          if (item.managed) {
            items.push({
              id: item.id,
              label: item.name + '  (' + item.externalId + ')'
            });
          }
        });
      });

      scope.loadItems = function($query) {
        return $filter('autocomplete')(items, $query);
      };
    }

    scope.reverseSchedule = function() {
      var requests = [];
      var action;
      switch (scope.model.type) {
        case 'start':
          action = 'START';
          break;
        case 'stop':
          action = 'STOP';
          break;
        case 'reboot':
          action = 'REBOOT';
          break;
      }
      angular.forEach(scope.model.selection, function(item) {
        requests.push(CloudAPI.createReverseSchedule(
          item.id, {
            name: 'Reverse Schedule for instance ' + item.id,
            cronExpression: retrieveCronExpression(scope),
            timeZoneId: scope.model.timezone,
            expirationDate: scope.model.expirationDate,
            extendedSchedule: scope.model.extendedSchedule,
            actionType: action,
            instanceStatus: scope.model.status,
            delay: 120000, // 2 minutes
            validFrom: scope.model.startDate
          }
        ));
      });

      if (requests.length > 0) {
        $q.all(requests).then(function() {
          growl.success('SERVERS_SCHEDULED');
          aside.hide();

          if (scope.callback) {
            scope.callback();
          }
        });
      } else {
        growl.warning('SERVERS_SELECTION');
      }
    };
  }

  function initializeElasticIpScheduleData(scope) {
    var eips = [];
    var instanceId = scope.model.selection[0].id;
    CloudAPI.getAvailableIpsForInstance(instanceId).then(function(response) {
      angular.forEach(response.data, function(eip) {
        eips.push({
          id: eip.allocationId,
          label: eip.publicIp
        });
      });
      eips = $filter('orderBy')(eips, 'label');
    });

    scope.loadItems = function($query) {
      return $filter('autocomplete')(eips, $query);
    };

    scope.createElasticIpSchedule = function() {
      CloudAPI.createElasticIpSchedule(
        instanceId,
        scope.model.elasticIps[0].id, {
          name: 'EIP Schedule - ' + instanceId + ' : ' + scope.model.elasticIps[0].label,
          cronExpression: retrieveCronExpression(scope),
          timeZoneId: scope.model.timezone,
          expirationDate: scope.model.expirationDate,
          extendedSchedule: scope.model.extendedSchedule,
          validFrom: scope.model.startDate
        }
      ).then(function() {
        growl.success('SERVERS_SCHEDULED');
        aside.hide();

        if (scope.callback) {
          scope.callback();
        }
      });
    };
  }

  // ------------------------------
  // Volumes data & functionality
  // ------------------------------

  function initializeVolumesData(scope) {
    angular.extend(scope.model, {
      maxAge: 7,
      type: 'take_snapshot'
    });

    if (scope.showSelection) {
      var items = [];
      CloudAPI.getVolumes(false).then(function(response) {
        angular.forEach(response, function(item) {
          if (item.managed) {
            items.push({
              id: item.id,
              label: (item.tags.Name || $translate.instant('UNNAMED')) + '  (' + item.externalId + ')'
            });
          }
        });
        items = $filter('orderBy')(items, 'label');
      });

      scope.loadItems = function($query) {
        return $filter('autocomplete')(items, $query);
      };
    }

    scope.schedule = function() {
      var requests = [];
      switch (scope.model.type) {
        case 'take_snapshot':
          angular.forEach(scope.model.selection, function(item) {
            if (scope.model.region && scope.model.region !== '') {
              requests.push(CloudAPI.createVolumeScheduleWithRegion(
                item.id,
                retrieveCronExpression(scope),
                scope.model.timezone,
                scope.model.expirationDate,
                scope.model.region,
                scope.model.extendedSchedule,
                scope.model.startDate
              ));
            } else {
              requests.push(CloudAPI.createVolumeSchedule(
                item.id,
                retrieveCronExpression(scope),
                scope.model.timezone,
                scope.model.expirationDate,
                scope.model.extendedSchedule,
                scope.model.startDate
              ));
            }
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SNAPSHOTS_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function(response) {
              if (response.status === 412) {
                growl.error('SCHEDULE_OVERLAP');
                aside.hide();
              } else {
                growl.error('SCHEDULING_FAILED');
                aside.hide();
              }
            });
          } else {
            growl.warning('VOLUMES_SELECTION');
          }
          break;
        case 'delete_snapshot':
          angular.forEach(scope.model.selection, function(item) {
            requests.push(CloudAPI.createVolumeDeletionSchedule(
              item.id,
              scope.model.maxAge,
              retrieveCronExpression(scope),
              scope.model.timezone,
              scope.model.expirationDate,
              scope.model.extendedSchedule,
              scope.model.startDate
            ));
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SNAPSHOTS_DELETION_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function() {
              growl.error('SCHEDULING_FAILED');
              aside.hide();
            });
          } else {
            growl.warning('VOLUMES_SELECTION');
          }
          break;
      }
    };
  }

  function initializeVolumesResizeData(scope) {
    if (scope.showSelection) {
      var items = [];
      CloudAPI.getVolumes(false).then(function(response) {
        angular.forEach(response, function(item) {
          if (item.managed) {
            items.push({
              id: item.id,
              label: (item.tags.Name || $translate.instant('UNNAMED')) + '  (' + item.externalId + ')'
            });
          }
        });
        items = $filter('orderBy')(items, 'label');
      });

      scope.loadItems = function($query) {
        return $filter('autocomplete')(items, $query);
      };
    }

    scope.schedule = function() {
      var requests = [];
      angular.forEach(scope.model.selection, function(item) {
        requests.push(CloudAPI.createVolumeResizeSchedule(
          item.id,
          scope.model.sizeIncrement,
          retrieveCronExpression(scope),
          scope.model.timezone,
          scope.model.expirationDate,
          scope.model.extendedSchedule,
          scope.model.startDate
        ));
      });

      if (requests.length > 0) {
        $q.all(requests).then(function() {
          growl.success('SNAPSHOTS_SCHEDULED');
          aside.hide();

          if (scope.callback) {
            scope.callback();
          }
        }, function(response) {
          if (response.status === 412) {
            growl.error('SCHEDULE_OVERLAP');
            aside.hide();
          } else {
            growl.error('SCHEDULING_FAILED');
            aside.hide();
          }
        });
      } else {
        growl.warning('VOLUMES_SELECTION');
      }
    };
  }

  // ---------------------------------
  // Group data & functionality
  // ---------------------------------

  function initializeGroupsData(scope) {
    angular.extend(scope.model, {
      maxAge: 7,
      type: 'start'
    });

    if (scope.showSelection) {
      var items = [];
      CloudAPI.getGroupNames(false).then(function(response) {
        angular.forEach(response, function(item) {
          items.push({
            id: item,
            label: item
          });
        });
        items = $filter('orderBy')(items, 'label');
      });

      scope.loadItems = function($query) {
        return $filter('autocomplete')(items, $query);
      };

      var servers = [];
      CloudAPI.getServers().then(function(response) {
        angular.forEach(response, function(server) {
          servers.push({
            id: server.id,
            label: server.name + '  (' + server.externalId + ')'
          });
        });
      });

      scope.loadServers = function($query) {
        $log.debug(scope.model);
        return $filter('autocomplete')(servers, $query);
      };
    }

    scope.schedule = function() {
      var requests = [];
      switch (scope.model.type) {
        case 'start':
        case 'stop':
        case 'reboot':
          angular.forEach(scope.model.selection, function(item) {
            var exclusions = [];
            if (scope.model.exclusions) {
              exclusions = scope.model.exclusions.map(function(server) {
                return server.id;
              });
            }
            requests.push(CloudAPI.createGroupSchedule(
              item.id,
              scope.model.type,
              retrieveCronExpression(scope),
              scope.model.timezone,
              scope.model.expirationDate,
              exclusions,
              scope.model.extendedSchedule,
              scope.model.startDate
            ));
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('GROUPS_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function(response) {
              if (response.status === 412) {
                growl.error('SCHEDULE_OVERLAP');
                aside.hide();
              } else {
                growl.error('SCHEDULING_FAILED');
                aside.hide();
              }
            });
          } else {
            growl.warning('GROUPS_SELECTION');
          }
          break;
        case 'take_snapshot':
          angular.forEach(scope.model.selection, function(item) {
            if (scope.model.region && scope.model.region !== '') {
              requests.push(CloudAPI.createGroupSnapshotScheduleWithRegion(
                item.id,
                retrieveCronExpression(scope),
                scope.model.timezone,
                scope.model.expirationDate,
                scope.model.region,
                scope.model.extendedSchedule,
                scope.model.startDate
              ));
            } else {
              requests.push(CloudAPI.createGroupSnapshotSchedule(
                item.id,
                retrieveCronExpression(scope),
                scope.model.timezone,
                scope.model.expirationDate,
                scope.model.extendedSchedule,
                scope.model.startDate
              ));
            }
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SNAPSHOTS_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function() {
              growl.error('SCHEDULING_FAILED');
              aside.hide();
            });
          } else {
            growl.warning('SERVERS_SELECTION');
          }
          break;
        case 'delete_snapshot':
          angular.forEach(scope.model.selection, function(item) {
            requests.push(CloudAPI.createGroupSnapshotDeletionSchedule(
              item.id,
              scope.model.maxAge,
              retrieveCronExpression(scope),
              scope.model.timezone,
              scope.model.expirationDate,
              scope.model.extendedSchedule,
              scope.model.startDate
            ));
          });

          if (requests.length > 0) {
            $q.all(requests).then(function() {
              growl.success('SNAPSHOTS_DELETION_SCHEDULED');
              aside.hide();

              if (scope.callback) {
                scope.callback();
              }
            }, function() {
              growl.error('SCHEDULING_FAILED');
              aside.hide();
            });
          } else {
            growl.warning('GROUPS_SELECTION');
          }
          break;
      }
    };
  }

  // ------------------------------
  // Lambda data & functionality
  // ------------------------------
  function initializeLambdaData(scope) {
    initializeCronData(scope);
    scope.model.payload = '{\n\n}';

    CloudAPI.getLambdas().then(function(response) {
      scope.lambdas = response.data;
    });

    scope.schedule = function() {
      if (scope.model.selectionId && scope.model.selectionId !== '') {
        angular.forEach(scope.lambdas, function(lambda) {
          if (lambda.id === parseInt(scope.model.selectionId)) {
            scope.model.selection = lambda;
          }
        });
      }

      CloudAPI.createLambdaSchedule(scope.model.selection.id, {
        name: scope.model.selection.functionName,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        payload: scope.model.payload,
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('LAMBDA_SCHEDULED');
        aside.hide();

        if (scope.callback) {
          scope.callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('LAMBDA_NOT_SCHEDULED');
          aside.hide();
        }
      });
    };
  }

  // ---------------------------------
  // EC2 Command data & functionality
  // ---------------------------------
  function initializeCommandData(scope) {
    initializeCronData(scope);

    CloudAPI.getDocuments().then(function(response) {
      scope.commands = response.data;
    });

    if (scope.model.selection) {
      angular.forEach(scope.model.selection.parameters, function(parameter) {
        parameter.value = parameter.defaultValue;
      });
    }

    scope.updateSelection = function() {
      if (scope.model.selectionId && scope.model.selectionId !== '') {
        angular.forEach(scope.commands, function(command) {
          if (command.id === parseInt(scope.model.selectionId)) {
            scope.model.selection = command;
          }
        });
      }

      if (scope.model.selection) {
        angular.forEach(scope.model.selection.parameters, function(parameter) {
          parameter.value = parameter.defaultValue;
        });
      }
    };

    var items = [];
    CloudAPI.getServers(false).then(function(response) {
      angular.forEach(response, function(item) {
        if (item.managed) {
          items.push({
            id: item.id,
            label: item.name + '  (' + item.externalId + ')',
            provider: item.provider,
            location: item.location.name
          });
        }
      });
    });

    scope.loadItems = function($query) {
      var servers = $filter('autocomplete')(items, $query);
      if (scope.model.selectionId && scope.model.selectionId !== '') {
        angular.forEach(scope.commands, function(command) {
          if (command.id === parseInt(scope.model.selectionId)) {
            scope.model.selection = command;
          }
        });
      }

      if (scope.model.selection) {
        return $filter('filter')(servers, {
          provider: 'AMAZON',
          location: scope.model.selection.location.name
        });
      } else {
        return [];
      }
    };

    scope.schedule = function() {
      var parameters = {};
      if (scope.model.selection && scope.model.selection.parameters !== null) {
        angular.forEach(scope.model.selection.parameters, function(parameter) {
          parameters[parameter.name] = [parameter.value];
        });
      }

      CloudAPI.createEc2CommandSchedule(scope.model.selection.id, {
        name: scope.model.selection.name,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        sendCommandRequest: {
          name: scope.model.selection.name,
          instanceIds: scope.model.servers.map(function(server) {
            return server.id;
          }),
          parameters: parameters
        },
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('EC2_COMMAND_SCHEDULED');
        aside.hide();

        if (scope.callback) {
          scope.callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('EC2_COMMAND_NOT_SCHEDULED');
          aside.hide();
        }
      });
    };

  }

  // ------------------------------
  // Task data & functionality
  // ------------------------------

  function initializeTaskData(scope, task, callback) {
    initializeCronData(scope);
    parseCronExpression(scope, task);
    scope.model.task = task;

    scope.updateTask = function() {
      $log.debug('UPDATE!', retrieveCronExpression(scope));
      CloudAPI.updateTask(task.id, {
        name: task.name,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();

        if (callback) {
          callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('SCHEDULING_FAILED');
          aside.hide();
        }
      });
    };

    scope.updateGroupTask = function() {
      $log.debug('UPDATE!', retrieveCronExpression(scope));
      $log.debug(scope.model);
      var exclusions = [];
      if (scope.model.exclusions) {
        exclusions = scope.model.exclusions.map(function(server) {
          return server.id;
        });
      }
      CloudAPI.updateGroupTask(task.id, {
        name: task.name,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        scheduleExcludedInstances: exclusions,
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();

        if (callback) {
          callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('SCHEDULING_FAILED');
          aside.hide();
        }
      });
    };

    scope.updateSnapshotTask = function() {
      CloudAPI.updateTakeSnapshotTask(task.id, {
        name: task.name,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        destinationRegionName: scope.model.region,
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();

        if (callback) {
          callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('SCHEDULING_FAILED');
          aside.hide();
        }
      });
    };

    scope.updateDeleteSnapshotTask = function() {
      CloudAPI.updateDeleteSnapshotTask(task.id, {
        name: task.name,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        maxAge: scope.model.maxAge,
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();

        if (callback) {
          callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('SCHEDULING_FAILED');
          aside.hide();
        }
      });
    };

    scope.updateInvokeLambdaTask = function() {
      $log.debug('update!');
      CloudAPI.updateLambdaTask(task.id, {
        name: task.name,
        cronExpression: retrieveCronExpression(scope),
        timeZoneId: scope.model.timezone,
        expirationDate: scope.model.expirationDate,
        payload: scope.model.payload,
        extendedSchedule: scope.model.extendedSchedule,
        validFrom: scope.model.startDate
      }).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();

        if (callback) {
          callback();
        }
      }, function(response) {
        if (response.status === 412) {
          growl.error('SCHEDULE_OVERLAP');
          aside.hide();
        } else {
          growl.error('SCHEDULING_FAILED');
          aside.hide();
        }
      });
    };

    scope.cancelExtendedScheduleAction = function() {
      CloudAPI.skipNextExecution(task.id).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();
      }, function() {
        growl.error('SCHEDULING_FAILED');
        aside.hide();
      });
    };

    scope.posponeExtendedScheduleAction = function() {
      CloudAPI.posponeNextExecution(task.id, scope.model.minutesDelay).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();
      }, function() {
        growl.error('SCHEDULING_FAILED');
        aside.hide();
      });
    };

    scope.cancelTaskActions = function() {
      CloudAPI.cancelTaskActions(task.id).then(function() {
        growl.success('SCHEDULING_UPDATED');
        aside.hide();
      }, function() {
        growl.error('SCHEDULING_FAILED');
        aside.hide();
      });
    };
  }

  // ------------------------------
  // Cron retrieval and parsing
  // ------------------------------

  function retrieveCronExpression(scope) {
    var expression;
    if (scope.model.period === 'hour') {
      if (!scope.model.daysOfWeek) {
        growl.error($translate.instant('SCHEDULING_DOW_REQUIRED'));
      }

      var dayDows = scope.model.daysOfWeek.map(function(obj) {
        return obj.id;
      }).join(',');
      if (scope.model.daysOfWeek.length < 1) {
        dayDows = '*'
      }
      expression = ['0', '0', scope.model.pastTheHour, '*', '*', dayDows].join(' ');

    } else if (scope.model.period === 'day') {
      if (!scope.model.daysOfWeek) {
        growl.error($translate.instant('SCHEDULING_DOW_REQUIRED'));
      }

      var dayDows = scope.model.daysOfWeek.map(function(obj) {
        return obj.id;
      }).join(',');
      if (scope.model.daysOfWeek.length < 1) {
        dayDows = '*'
      }
      expression = ['0', scope.model.minute, scope.model.hour, '*', '*', dayDows].join(' ');

    } else if (scope.model.period === 'month') {
      expression = ['0', scope.model.minute, scope.model.hour, scope.model.day, '*', '*'].join(' ');
    } else if (scope.model.period === 'year') {
      expression = ['0', scope.model.minute, scope.model.hour, scope.model.day, scope.model.month, '*'].join(' ');
    }
    return expression;
  }

  function parseCronExpression(scope, task) {
    var cronParts = task.cronExpression.split(' ');

    if (cronParts[2] === '*' && cronParts[3] === '*' && cronParts[4] === '*') {
      scope.model.period = 'hour';
    } else if (cronParts[3] === '*' && cronParts[4] === '*') {
      scope.model.period = 'day';
    } else if (cronParts[4] === '*' && cronParts[5] === '*') {
      scope.model.period = 'month';
    } else {
      scope.model.period = 'year';
    }

    scope.model.hour = (cronParts[2] !== '*') ? cronParts[2] : 12;
    scope.model.minute = (cronParts[1] !== '*') ? cronParts[1] : 0;
    scope.model.pastTheHour = (cronParts[1] !== '0') ? cronParts[1] : 0;

    scope.model.daysOfWeek = [];
    if (cronParts[5] !== '*') {
      var dayIds = cronParts[5].split(',');
      angular.forEach(dayIds, function(dayId) {
        angular.forEach(scope.allDays, function(day) {
          if (dayId === day.id) {
            scope.model.daysOfWeek.push(day);
          }
        });
      });
    }

    scope.model.day = (cronParts[3] !== '*') ? cronParts[3] : 1;
    scope.model.month = (cronParts[4] !== '*') ? cronParts[4] : 1;
    scope.model.timezone = task.timeZoneId;
    scope.model.expirationDate = task.expirationDate;
    scope.model.extendedSchedule = task.extendedSchedule;
    scope.model.startDate = task.validFrom;
  }

  function parseCustomTaskFields(scope, task) {
    scope.model.maxAge = task.maxAge;
    scope.model.region = task.destinationRegionName;
    scope.model.payload = task.payload;
  }

  function parseGroupTaskFields(scope, task) {
    var servers = [];

    CloudAPI.getServers(false).then(function(response) {
      angular.forEach(response, function(server) {
        servers.push({
          id: server.id,
          label: server.name + '  (' + server.externalId + ')'
        });
      });
      scope.servers = response;
      scope.model.exclusions = [];
      task.scheduleExcludedInstances.forEach(function(id) {
        scope.servers.forEach(function(server) {
          if (server.id === id) {
            scope.model.exclusions.push({
              id: server.id,
              label: server.name + '  (' + server.externalId + ')'
            });
          }
        });
      });
    });

    scope.loadServers = function($query) {
      $log.debug($query);
      $log.debug(servers);
      return $filter('autocomplete')(servers, $query);
    };
  }

  service.openWidget = function(type, selection, showSelection, callback) {
    $log.debug('Open scheduling widget');
    scope = initializeScope($rootScope.$new(true), type, selection, showSelection, null, callback);
    aside = $aside({
      scope: scope,
      container: 'body',
      placement: 'right',
      templateUrl: 'views/templates/scheduling/scheduling-aside.html',
      backdrop: 'static'
    });
  };

  service.openUpdateWidget = function(type, task, callback) {
    $log.debug('Open update scheduling widget', task);
    scope = initializeScope($rootScope.$new(true), type, null, null, task, callback);
    aside = $aside({
      scope: scope,
      container: 'body',
      placement: 'right',
      templateUrl: 'views/templates/scheduling/scheduling-aside.html',
      backdrop: 'static'
    });
  };

  service.openElasticIpsWidget = function(selection) {
    $log.debug('Open scheduling widget');
    scope = initializeElasticIpsScope($rootScope.$new(true), selection);
    aside = $aside({
      scope: scope,
      container: 'body',
      placement: 'right',
      templateUrl: 'views/templates/elastic-ips-aside.html',
      backdrop: 'static'
    });
  };


  function initializeElasticIpsScope(scope, selection) {
    var externalId = selection[0].externalId;
    var instanceId = selection[0].id;

    scope.loadData = function() {
      scope.instanceElasticIps = [];
      scope.availableElasticIps = [];
      CloudAPI.getAvailableIpsForInstance(instanceId).then(function(response) {
        angular.forEach(response.data, function(eip) {
          if (eip.instanceId === externalId) {
            scope.instanceElasticIps.push(eip);
          } else {
            scope.availableElasticIps.push(eip);
          }
        });
      });
    };

    scope.addEip = function(eip) {
      CloudAPI.addEip(instanceId, eip).then(function() {
        scope.loadData();
      }).catch(function(response) {
        growl.error(response.data.message);
      });
    };

    scope.removeEip = function(eip) {
      CloudAPI.removeEip(instanceId, eip).then(function() {
        scope.loadData();
      }).catch(function(response) {
        growl.error(response.data.message);
      });
    };

    scope.cancel = function() {
      aside.hide();
    };

    scope.loadData();

    return scope;
  }

  return service;
});
