'use strict';

// --------------------------------------------------------------------------
// Admin Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('WorkspaceValidationAPI', function($http, Session) {
  return {
    listValidators: function () {
      return $http.get(cpconfig.API_URL + '/workspace/warnings/customer/' + Session.user.customer.id + '/list')
        .then(function (response) {
          return response.data;
        });
    },
    listWorkspaceValidators: function (workspaceId) {
      return $http.get(cpconfig.API_URL + '/workspace/warnings/workspace/' + workspaceId + '/list')
        .then(function (response) {
          return response.data;
        });
    },
    createValidator: function (request) {
      return $http.post(cpconfig.API_URL + '/workspace/warnings', request).then(function(response) {
        return response.data;
      });
    },
    deleteValidator: function (validatorId) {
      return $http['delete'](cpconfig.API_URL + '/workspace/warnings/' + validatorId);
    }
  };
});
