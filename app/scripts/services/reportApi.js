'use strict';

// --------------------------------------------------------------------------
// Report Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('ReportAPI', function($http, Session) {
  return {
    reportWorkspacesEvents: function (dateFromTo) {
      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/events',dateFromTo).then(function(response) {
        
        return response.data;
      });
    },

    reportWorkspacesAvgPerformance: function (dateFromTo) {

      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/avg_cpu_mem_hdd',dateFromTo).then(function(response) {
        return response.data;
      });
    },

    reportWorkspacesLastUserConnection: function (dateFromTo) {

      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/last_known_user_connection',dateFromTo).then(function(response) {
        return response.data;
      });
    },


    reportWorkspaceseventsAcumulated: function (dateFromTo) {

      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/events_acumulated_by_workspaces',dateFromTo).then(function(response) {
        return response.data;
      });
    },

    reportWorkspacesUsedTimeHours: function (dateFromTo) {

      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/used_time_by_hours',dateFromTo).then(function(response) {
        return response.data;
      });
    },

    reportWorkspacesUsedTimeDays: function (dateFromTo) {

      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/used_time_by_days',dateFromTo).then(function(response) {
        return response.data;
      });
    },
    reportWorkspacesUserCount: function (dateFromTo) {

      return $http.post(cpconfig.API_URL + '/reports/workspaces/' + Session.user.customer.id + '/machine_count_vs_user_count',dateFromTo).then(function(response) {
        return response.data;
      });
    },


  };
});
