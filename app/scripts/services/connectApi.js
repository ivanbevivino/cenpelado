'use strict';

// --------------------------------------------------------------------------
// Connect Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('ConnectAPI', function($http, Session) {
  return {
    getConnectInstances: function () {
      return $http.get(cpconfig.API_CONNECT_URL + '/instances/customer/' + Session.user.customer.id + '/list').then(function(response) {
        return response.data;
      });
    },
    getConnectInstance: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/instances/getinstance/' + Session.user.customer.id + '/'+ request, request).then(function(response) {
        return response.data;
      });
    },
    addConnectInstance: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/instances/addinstance/'+Session.user.customer.id, request);
    },
    updateConnectInstance: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/instances/updateinstance/'+Session.user.customer.id, request);
    },
    deleteConnectInstance: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/instances/deleteinstance/'+Session.user.customer.id, request);
    },
    addReport: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/reports/addreport/'+Session.user.customer.id+'/'+request.instanceid, request);
    },
    updateReport: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/reports/updatereport/'+Session.user.customer.id, request);
    },
    getListReports: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/reports/listsql/'+Session.user.customer.id+ '/'+request).then(function(response) {
        return response.data;
      });
    },
    deleteReport: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/reports/deletereport/'+request, request);
    },
    getListAgents: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/agents/list/'+request).then(function(response) {
        return response.data;
      });
    },
    getAgentCalls: function (request) {
      return $http.post(cpconfig.API_CONNECT_URL + '/calls/getagentcalls/', request).then(function(response) {
        return response.data;
      });
    },
    getUrlSigned: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/calls/getUrlSigned/'+request).then(function(response) {
        return response.data;
      });
    },
    getAgentsStatus: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/agents/status/'+request).then(function(response) {
        return response.data;
      });
    },
    getLastAgentsStatus: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/agents/laststatus/'+request).then(function(response) {
        return response.data;
        // return {};
      });
    },
    getTranscribe: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/calls/transcribe/'+request).then(function(response) {
        return response.data;
      });
    },

    getListDashboard: function (request) {
      return $http.get(cpconfig.API_CONNECT_URL + '/reports/list/'+Session.user.customer.id+ '/'+request).then(function(response) {
        // return response.data;
        var a = [{
          id: 1,
          name:"dashboard1",
          config:[{
            "id": 1,
            "name": "Statistics per day",
            "api": null,
            "parameters": ["date_from", " date_to"],
            "type": "sql",
            "object": "not implemented",
            "format":"line"
          },
          {
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"pie"
          },
          {
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"bar"
          }
          ,{
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"area"
          }
          ,{
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"gauge"
          },
          {
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"ring"
          }
          ,{
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"line"
          }
          ,{
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"gauge"
          }
          ,{
          "id": 10,
          "name": "Statistics per Month",
          "api": null,
          "parameters": ["date_from", " date_to"],
          "type": "sql",
          "object": {},
          "format":"bar"
          }
          ],
          default:true
          },
          {
          id: 2,
          name:"dashboard2",
          config:[{
            "id": 1,
            "name": "Statistics per day",
            "api": null,
            "parameters": ["date_from", " date_to"],
            "type": "sql",
            "object": "not implemented",
            "format":"line"
          },
          {
            "id": null,
            "name": "LongestQueueWaitTime",
            "api": "cloudwatchsynchronizer",
            "parameters": ["Statistics", "StartTime", "EndTime", "Period"],
            "type": "cw",
            "object": "{\"namespace\":\"AWS/Connect\",\"metricName\":\"LongestQueueWaitTime\",\"dimensions\":[{\"name\":\"InstanceId\",\"value\":\"8d869a43-e5cf-4d78-9fde-3fa54140a6ad\"},{\"name\":\"MetricGroup\",\"value\":\"Queue\"},{\"name\":\"QueueName\",\"value\":\"BasicQueue\"}]}",
           "options" : [  ],
           "format":"line"
          },{
          "id": 10,
          "name": "Statistics per Month",
          "api": null,
          "parameters": ["date_from", " date_to"],
          "type": "sql",
          "object": "not implemented",
          "format":"line"
          }
          ],
          default:false
          }]

        return a;
      });
    },



    getConfigAlerts: function (instanceId) {

      return $http.get(cpconfig.API_CONNECT_URL + '/realtimealarms/get/' + Session.user.id+ '/' +instanceId ).then(function(response) {
        return response.data;
      })
    },

    saveConfigAlerts: function (config, instanceId,version,IDconfig) {
      return $http.post(cpconfig.API_CONNECT_URL + '/realtimealarms/save/' + Session.user.id + '/' + instanceId+'/'+version,
      {
        id: IDconfig,
        config: JSON.stringify(config),


      }).then(function(response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
        return null;
      })
    },



    getReportValues: function (accountId, request, region) {

      return $http.post(cpconfig.METRICS_URL + '/getStatistics/' + accountId + '/' + region, request).then(function(response) {
        return response.data;
      })
    },

    getAllReportValues: function (accountId, request, region, range) {
      return $http.post(cpconfig.METRICS_URL + '/getAllStatistics/' + accountId + '/' + region + '/' + range, request).then(function(response) {
        return response.data;
      });
    },

    reportGetAgentsRealtime: function (instanceId,routingProfile) {
      return $http.post(cpconfig.API_CONNECT_URL + '/reports/realtimeAgents/' + Session.user.customer.id + '/' + instanceId+'/'+routingProfile).then(function(response) {
        return response.data;
      });
    },

    reportGetQueuesRealtime: function (instanceId,routingProfile) {
      return $http.post(cpconfig.API_CONNECT_URL + '/reports/realtimeQueues/' + Session.user.customer.id + '/' + instanceId+'/'+routingProfile).then(function(response) {
        return response.data;
      });
    },

    reportListAvailableReports: function (instanceId) {

      return $http.get(cpconfig.API_CONNECT_URL + '/reports/list/' + Session.user.customer.id + '/' + instanceId).then(function(response) {
        return response.data;
      });
    },

    getDefaultDashboard: function (instanceId) {
      return $http.get(cpconfig.API_CONNECT_URL + '/dashboard/get_default/' + Session.user.id + '/' + instanceId).then(function(response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
        return null;
      })
    },

    saveDashboard: function (config, instanceId) {
      return $http.post(cpconfig.API_CONNECT_URL + '/dashboard/save/' + Session.user.id + '/' + instanceId,
      {
        alias: 'default',
        config: JSON.stringify(config),
        defaultDash: 'true'

      }).then(function(response) {
        return response.data;
      }).catch(function(err) {
        console.log(err);
        return null;
      })
    },


    executeReport: function (reportId,request) {
      // console.log(request);
      return $http.post(cpconfig.API_CONNECT_URL + '/reports/execute/'+reportId,request).then(function(response) {
        // console.log(response.data);
        return response.data;
      });
    },


    getRoutingProfiles: function (instanceId) {

      return $http.post(cpconfig.API_CONNECT_URL + '/reports/routingProfiles/'+ Session.user.id + '/' + instanceId).then(function(response) {
        // console.log(response.data);
        return response.data;
      });
    },


  };
});
