'use strict';

// --------------------------------------------------------------------------
// Admin Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('WorkspaceAPI', function($http, Session) {
  return {

    getWorkspaces: function(request) {
      return $http.post(cpconfig.API_URL + '/workspace/customer/' + Session.user.customer.id + '/list', request).then(function(response) {
        return response.data;
      });
    },
    
    getWorkspaceDetails: function(request) {      
      return $http.post(cpconfig.API_URL + '/workspace/customer/' + Session.user.customer.id + '/listDetails', request).then(function(response) {
        return response.data;
      });
    },

    getWorkspaceBundles: function() {
      return $http.post(cpconfig.API_URL + '/workspace/customer/' + Session.user.customer.id + '/bundles').then(function(response) {
        return response.data;
      });
    },
    
    getWorkspaceGroups: function() {
      return $http.post(cpconfig.API_URL + '/workspace/customer/' + Session.user.customer.id + '/groups').then(function(response) {
        return response.data;
      });
    },

    // -------------------------------------------------------------------------------------------------------------------------------------  PROPERTIES  ---

    getWorkspaceProperties: function(workspaceid) {
      return $http.get(cpconfig.API_URL + '/workspace/properties/' + workspaceid)
    },

    updateDirectoriesWorkspaces: function() {
      return $http.post(cpconfig.API_URL + '/workspace/refresh_directories/' + Session.user.customer.id);
    },

    getWorkspaceAwsBundles: function() {
      return $http.post(cpconfig.API_URL + '/workspace/awsbundles/' + Session.user.customer.id).then(function(response) {
        return response.data;
      });
    },

    getWorkspaceDirectories: function() {
      return $http.post(cpconfig.API_URL + '/workspace/directories/' + Session.user.customer.id).then(function(response) {
        return response.data;
      });
    },

    // -------------------------------------------------------------------------------------------------------------------------------------------  TAGS  ---

    getDistinctWorkspacesTags: function() {
      return $http.post(cpconfig.API_URL + '/workspace/tags/byCustomerId/' +  Session.user.customer.id ).then(function(response) {
        // console.log(response);
        var nuevo= response.data.map(function(a){
          var b={id:a,text:a};
          return b;
        });
        return nuevo; 
      });
    },

    getWorkspaceTags: function(workspaceid) {
      return $http.post(cpconfig.API_URL + '/workspace/tags/' + workspaceid).then(function(response) {
        return response.data;
      });
    },

    WorkspaceTagsDelete: function(workspaceid,request) {
      return $http.post(cpconfig.API_URL + '/workspace/tags/' + workspaceid + "/delete", request)
    },

    WorkspaceTagsUpdate: function(workspaceid,request) {
      return $http.post(cpconfig.API_URL + '/workspace/tags/' + workspaceid + "/update", request)
    },

    // ----------------------------------------------------------------------------------------------------------------------------------------  METRICS  ---

    getCloudwatchMetrics: function(request) {
      return $http.post(cpconfig.API_URL + '/cloud/cloudWatch/workspaces/metric', request).then(function(response) {
        return response.data;
      });
    },

    getLiquidwareMetrics: function(request) {
      return $http.post(cpconfig.API_URL + '/liquidware/workspace/serverMetrics', request).then(function(response) {
        return response.data;
      });
    },

    getWorkspaceMetrics: function(workspaceId) {
      if (!workspaceId) {
        return $http.get(cpconfig.API_URL + '/workspace/metrics'); // TODO ACA FALTA OBTENER TODAS LAS METRICAS
      } else {
        return $http.get(cpconfig.API_URL + '/workspace/metrics'); // TODO ACA FALTA OBTENER METRICAS DE UN WORKSPACE
      }
    },

    deleteWorkspaceMetric: function(metricId) {
      return $http['delete'](cpconfig.API_URL + '/workspace/metrics/' + metricId); // TODO Falta verificar aca que sea la API correcta
    },

    // ----------------------------------------------------------------------------------------------------------------------------------------  ACTIONS  ---

    startWorkspace: function(request) {
      return $http.post(cpconfig.API_URL + '/workspace/start', request);
    },

    stopWorkspace: function(request) {
      return $http.post(cpconfig.API_URL + '/workspace/stop', request);
    },

    rebootWorkspace: function(request) {
      return $http.post(cpconfig.API_URL + '/workspace/reboot', request);
    },

    rebuildWorkspace: function(request) {
      return $http.post(cpconfig.API_URL + '/workspace/rebuild', request);
    },

    resizeWorkspace: function(workspacesid, request) {
      return $http.post(cpconfig.API_URL + '/workspace/resize/' + workspacesid, request);
    },

    terminateWorkspace: function(request) {
      return $http.post(cpconfig.API_URL + '/workspace/terminate', request);
    },

    launchWorkspaces: function (request) {
     return $http.post(cpconfig.API_URL + '/workspace/launch/' + Session.user.customer.id , request);
    },

  };
});
