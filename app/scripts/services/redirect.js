'use strict';

// --------------------------------------------------------------------------
// Admin Service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('RedirectAPI', function($http, Session, $state, AuthService) {



  return {

    homeRedirect: function() {
      if (AuthService.isAuthorized('ROLE_CH_SYSTEM_ADMIN')) {
        return $state.go('app.admin-dashboard');
      } else {
        if (Session.user.customer.apps.indexOf("CLOUDPOXEE") !== -1) {
          $state.go('app.dashboard');
          event.preventDefault();
        } else if (Session.user.customer.apps.indexOf("SCHEDULER") !== -1) {
          $state.go('app.scheduling');
          event.preventDefault();
        } else if (Session.user.customer.apps.indexOf("WORKSPACES") !== -1) {
          $state.go('app.workspaces');
          event.preventDefault();
        } else if (Session.user.customer.apps.indexOf("CONNECT") !== -1) {
          $state.go('app.connect');
          event.preventDefault();
        } else if (Session.user.customer.apps.indexOf("MEDIABOX") !== -1) {
          $state.go('app.mediabox_stream_manager');
          event.preventDefault();
        }
      }
    },
  };
});
