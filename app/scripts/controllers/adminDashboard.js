'use strict';

angular.module('cloudpoxee.controllers').controller('AdminDashboardCtrl',
  function($log, $scope, $rootScope, $timeout, $interval, $filter, $translate, $state,
    CloudAPI, events, stats) {

    $log.debug('CloudPoxee admin dashboard controller...');

    $scope.labels = ['Amazon Resources', 'SoftLayer Resources'];
    $scope.data = [0, 0];
    $scope.colours = ['#3489ce', '#1e202a'];
    $scope.options = {
      tooltips: {
        enabled: false,
      },
      legend: {
        display: true,
        position: 'bottom',
        fullWidth: true,
        labels : {
          boxWidth: 20
        }
      } 
    };

    $scope.mainStats = stats.data.mainStats;
    $scope.usageDetails = stats.data.cloudStats;
    $scope.summary = stats.data.summaryStats;

    $scope.tools = [
      {
        text: $translate.instant('MANAGE_ADMINS'),
        click: function() {
          $state.go('app.manage-admins');
        }
      },
      {
        text: $translate.instant('MANAGE_REGIONS'),
        click: function() {
          $state.go('app.manage-regions');
        }
      }
    ];

    $scope.usageDetails.totalServers += $scope.usageDetails.amazonServers;
    $scope.usageDetails.totalServers += $scope.usageDetails.softlayerServers;
    $scope.usageDetails.totalBalancers += $scope.usageDetails.amazonBalancers;
    $scope.usageDetails.totalBalancers += $scope.usageDetails.softlayerBalancers;
    $scope.usageDetails.totalVolumes += $scope.usageDetails.amazonVolumes;
    $scope.usageDetails.totalVolumes += $scope.usageDetails.softlayerVolumes;
    $scope.usageDetails.totalSnapshots += $scope.usageDetails.amazonSnapshots;
    $scope.usageDetails.totalSnapshots += $scope.usageDetails.softlayerSnapshots;

    var amazonItems = $scope.summary.amazonServers + $scope.summary.amazonLoadBalancers + $scope.summary.amazonVolumes;
    var softlayerItems = $scope.summary.softlayerServers + $scope.summary.softlayerLoadBalancers + $scope.summary.softlayerVolumes;

    $scope.data = [amazonItems, softlayerItems];

    /*******************/
    /* Activity Events */
    /*******************/
    $scope.clientSelected = null;
    $scope.currentEventsPage = 1;

    // -- Update events
    function updateEvents(eventResult) {
      $scope.eventResult = eventResult;
      $scope.currentEventsPage = eventResult.pageIndex + 1;
      $log.debug('Update events...', eventResult);
    }

    // -- Autorefresh

    var refreshEvents = function() {
      $log.debug('Updating activity stream...');
      CloudAPI.getActivityEvents($scope.eventResult.pageSize, $scope.currentEventsPage - 1,
        $scope.clientSelected, true).then(updateEvents);
    };

    var eventsTimer = $interval(refreshEvents, 30000);

    updateEvents(events);

    $scope.reloadPage = function(newPageIndex) {
      $scope.currentEventsPage = newPageIndex;
      refreshEvents();
    };

    /*******************/
    /* Listeners       */
    /*******************/

    $scope.$watch('clientSelected', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        refreshEvents();
      }
    });

    $scope.$on('client:changed', function() {
      $state.go($state.current, {}, {reload: true});
    });

    /***********/
    /* Destroy */
    /***********/

    $scope.$on('$destroy', function() {
      $interval.cancel(eventsTimer);
    });

  }
);
