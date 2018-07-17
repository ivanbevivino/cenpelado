'use strict';

// --------------------------------------------------------------------------
// Admin Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('MediaBoxAPI', function($http, Session) {
  return {
    getChannels: function() {

      return $http.get(cpconfig.API_MEDIABOX_URL + '/channels/' + Session.user.customer.id + '/list').then(function(response) {


        return response.data;
      });
    },
    startChannel: function(request) {
      return $http.post(cpconfig.API_MEDIABOX_URL + '/channels/' + Session.user.customer.id + '/start', request);
    },
    stopChannel: function(request) {
      return $http.post(cpconfig.API_MEDIABOX_URL + '/channels/' + Session.user.customer.id + '/stop', request);
    },
    getCategories: function() {
      return $http.get(cpconfig.API_MEDIABOX_URL + '/categories/' + Session.user.customer.id + '/list').then(function(response) {
        return response.data;
      });
    },
    setCategories: function(request) {
      return $http.post(cpconfig.API_MEDIABOX_URL + '/categories/' + Session.user.customer.id + '/set', request);
    },
    removeCategory: function(request) {
      return $http.delete(cpconfig.API_MEDIABOX_URL + '/categories/' + Session.user.customer.id + '/delete/' + request);
    },
    getPastEvents: function(request) {
      return $http.post(cpconfig.API_MEDIABOX_URL + '/events/' + Session.user.customer.id, request).then(function(response) {
        return response.data;

      });


    },

    getEventsMediaLibrary: function(request) {

      return $http.post(cpconfig.API_MEDIABOX_URL + '/events/' + Session.user.customer.id+'/medialibrary', request).then(function(response) {
        return response.data;




      });


    },

    removeEventsMediaLibrary: function(request) {


     return $http.post(cpconfig.API_MEDIABOX_URL + '/events/' + Session.user.customer.id+'/medialibrary/delete' , request);
    },

  };
});
