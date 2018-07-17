'use strict';

// --------------------------------------------------------------------------
// Utilities Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('Introduction', function($log, $rootScope, $translate, $q, $timeout, $state,
  Session, CloudAPI, nzTour) {
  function getDefaultStepOptions(hasNext) {
    return {
      config: {
        container: '.scroller', // The container to mask
        scrollBox: '.scroller', // The container to scroll when searching for elements
        animationDuration: 400, // Animation Duration for the box and mask
        placementPriority: ['bottom', 'right', 'top', 'left'],
        previousText: $translate.instant('PREVIOUS'),
        nextText: $translate.instant('NEXT'),
        finishText: hasNext ? $translate.instant('NEXT') : $translate.instant('FINISH'),
        mask: {
          visible: true, // Shows the element mask
          clickThrough: false, // Allows the user to interact with elements beneath the mask
          clickExit: false, // Exit the tour when the user clicks on the mask
          scrollThrough: true, // Allows the user to scroll the scrollbox or window through the mask
          color: 'rgba(0,0,0,.7)' // The mask color
        }
      }
    };
  }

  function refreshScreenPromise() {
    var d = $q.defer();
    $timeout(function() {
      $(window).resize();
    }, 250);
    d.resolve();
    return d.promise;
  }

  return {
    getDashboardOptions: function() {
      return {
        steps: [{
            target: '#js-resources-summary',
            content: $translate.instant('DASHBOARD_STEP_1')
          },
          {
            target: '#js-groups-down',
            content: $translate.instant('DASHBOARD_STEP_2')
          },
          {
            target: '#js-servers-down',
            content: $translate.instant('DASHBOARD_STEP_3')
          },
          {
            target: '#js-activity-stream',
            content: $translate.instant('DASHBOARD_STEP_4')
          },
          {
            target: '.js-menu-trigger',
            content: $translate.instant('DASHBOARD_STEP_5')
          }
        ]
      };
    },
    getGroupsOptions: function() {
      return {
        steps: [{
          target: '.state-content',
          content: $translate.instant('GROUPS_STEP_1')
        }]
      };
    },
    getConnectOptions: function() {
      return {
        steps: [{
          target: '.connect-instance',
          content: $translate.instant('GS_CONNECT_INSTANCE')
        }]
      };
    },
    getDashboardconnectOptions: function() {
      return {
        steps: [{
            target: '.tab-dashboard-connect',
            content: $translate.instant('CONNECT_DASHBOARD'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '0');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.tab-agents-connect1',
            content: $translate.instant('CONNECT_AGENT_STATUS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '3');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.tab-agents-connect2',
            content: $translate.instant('CONNECT_AGENT_DETAILS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '3');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '#reportrange',
            content: $translate.instant('CONNECT_DATERANGE'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '2');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.tab-calls-agents',
            content: $translate.instant('CONNECT_CALLS_AGENTS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '2');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.tab-calls-table',
            content: $translate.instant('CONNECT_CALLS_TABLE'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '2');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '#reportrange',
            content: $translate.instant('CONNECT_REPORTS_DATERANGE'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '1');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.tab-reports-report',
            content: $translate.instant('CONNECT_REPORTS_REPORT'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('connect_dashboard:tabChange', '1');

              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          }
        ]
      };
    },
    getGroupConfigurationOptions: function() {
      return {
        steps: [{
            target: '.groups',
            content: $translate.instant('GROUPS_CONFIG_TUTORIAL_GROUPS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('group-configuration:tabChange');
              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.group-name',
            content: $translate.instant('GROUPS_CONFIG_TUTORIAL_GROUP_NAME'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('group-configuration: Change');
              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.servers',
            content: $translate.instant('GROUPS_CONFIG_TUTORIAL_SERVERS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('group-configuration:tabChange');
              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.wizard-indicator-label--2',
            content: $translate.instant('GROUPS_CONFIG_TUTORIAL_START_ORDER'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('group-configuration:tabChange');
              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.wizard-indicator-label--3',
            content: $translate.instant('GROUPS_CONFIG_TUTORIAL_STOP_ORDER'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('group-configuration:tabChange');
              $timeout(function() {
                d.resolve();
              }, 75);
              return d.promise;
            },
            after: refreshScreenPromise
          }
        ]
      };
    },
    getDistributionOptions: function() {
      return {
        steps: [{
          target: '.map-legend',
          content: $translate.instant('MAP_DISTRIBUTION_STEP_1')
        }]
      };
    },
    getSchedulingOptions: function() {
      return {
        steps: [{
            target: '.js-scheduling-charts',
            content: $translate.instant('SCHEDULING_STEP_1')
          },
          {
            target: '.js-schedule-list',
            content: $translate.instant('SCHEDULING_STEP_2')
          }
        ]
      };
    },
    getCustomerSettingsOptions: function() {
      return {
        steps: [{
            target: '.js-intro-helper',
            content: $translate.instant('CUSTOMER_SETTINGS_USERS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('customer-settings:tabChange', 'users');
              d.resolve();
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.js-intro-helper',
            content: $translate.instant('CUSTOMER_SETTINGS_CREDENTIALS'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('customer-settings:tabChange', 'credentials');
              d.resolve();
              return d.promise;
            },
            after: refreshScreenPromise
          },
          {
            target: '.js-intro-helper',
            content: $translate.instant('CUSTOMER_SETTINGS_HQ'),
            before: function() {
              var d = $q.defer();
              $rootScope.$broadcast('customer-settings:tabChange', 'headquarter');
              d.resolve();
              return d.promise;
            },
            after: refreshScreenPromise
          }
        ]
      };
    },
    getServersOptions: function() {
      return {
        steps: [{
          target: '.js-servers-page',
          content: $translate.instant('SERVERS_STEP')
        }]
      };
    },
    getLoadBalancersOptions: function() {
      return {
        steps: [{
          target: '.js-load-balancers-page',
          content: $translate.instant('LOAD_BALANCERS_STEP')
        }]
      };
    },
    getVolumesOptions: function() {
      return {
        steps: [{
          target: '.js-volumes-page',
          content: $translate.instant('VOLUMES_STEP')
        }]
      };
    },
    getSnapshotsOptions: function() {
      return {
        steps: [{
          target: '.js-snapshots-page',
          content: $translate.instant('SNAPSHOTS_STEP')
        }]
      };
    },
    getAdminDashboardOptions: function() {
      return {
        steps: [{
            target: '.js-resources-summary',
            content: $translate.instant('ADMIN_DASHBOARD_STEP_1')
          },
          {
            target: '.js-usage-details',
            content: $translate.instant('ADMIN_DASHBOARD_STEP_2')
          },
          {
            target: '.js-main-metrics',
            content: $translate.instant('ADMIN_DASHBOARD_STEP_3')
          },
          {
            target: '.js-activity-stream',
            content: $translate.instant('ADMIN_DASHBOARD_STEP_4')
          }
        ]
      };
    },
    getProfileOptions: function() {
      return {
        steps: [{
          target: '.js-not-found',
          content: $translate.instant('PROFILE_STEP')
        }]
      };
    },
    getNextStep: function(currentState) {
      var helpFlow = ['app.dashboard', 'app.servers', 'app.volumes', 'app.snapshots', 'app.load-balancers', 'app.groups', 'app.map-distribution', 'app.scheduling', 'app.customer-settings', 'app.connect'];
      for (var i = 0; i < helpFlow.length; i++) {
        if (helpFlow[i] === currentState && i + 1 < helpFlow.length) {
          return helpFlow[i + 1];
        }
      }
      return null;
    },
    startTour: function(currentState, continuous) {
      var options = null;
      var nextStep = null;

      if (continuous) {
        nextStep = this.getNextStep(currentState);
        if (nextStep !== null) {
          options = getDefaultStepOptions(true);
        } else {
          options = getDefaultStepOptions(false);
        }
      } else {
        options = getDefaultStepOptions(false);
      }

      var tour = null;
      switch (currentState) {
        case 'app.admin-dashboard':
          tour = nzTour.start(angular.extend(options, this.getAdminDashboardOptions()));
          break;
        case 'app.volumes':
          tour = nzTour.start(angular.extend(options, this.getVolumesOptions()));
          break;
        case 'app.snapshots':
          tour = nzTour.start(angular.extend(options, this.getSnapshotsOptions()));
          break;
        case 'app.load-balancers':
          tour = nzTour.start(angular.extend(options, this.getLoadBalancersOptions()));
          break;
        case 'app.servers':
          tour = nzTour.start(angular.extend(options, this.getServersOptions()));
          break;
        case 'app.customer-settings':
          tour = nzTour.start(angular.extend(options, this.getCustomerSettingsOptions()));
          break;
        case 'app.map-distribution':
          tour = nzTour.start(angular.extend(options, this.getDistributionOptions()));
          break;
        case 'app.scheduling':
          tour = nzTour.start(angular.extend(options, this.getSchedulingOptions()));
          break;
        case 'app.groups':
          tour = nzTour.start(angular.extend(options, this.getGroupsOptions()));
          break;
        case 'app.dashboard':
          tour = nzTour.start(angular.extend(options, this.getDashboardOptions()));
          break;
        case 'app.profile':
          tour = nzTour.start(angular.extend(options, this.getProfileOptions()));
          break;
        case 'app.groupConfig':
          tour = nzTour.start(angular.extend(options, this.getGroupConfigurationOptions()));
          break;
        case 'app.connect':
          tour = nzTour.start(angular.extend(options, this.getConnectOptions()));
          break;
        case 'app.connect_dashboard':
          tour = nzTour.start(angular.extend(options, this.getDashboardconnectOptions()));
          break;
      }

      if (continuous) {
        tour.then(function() {
          if (tour !== null && nextStep !== null) {
            $state.go(nextStep);
          } else {
            CloudAPI.toggleTutorial(false);
            $state.go('app.dashboard');
          }
        }).catch(function() {
          CloudAPI.toggleTutorial(false);
        });
      }
    }
  };
});
