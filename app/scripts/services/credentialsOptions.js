'use strict';

// --------------------------------------------------------------------------
// Credentials View: New Credentials dropdown data service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('CredentialsOptions', function($log, $rootScope, $translate, $filter, $q, $modal, $state) {
  var eventCleanup = null;
  return {
    setOptions: function(scope, path, itemsPath) {
      var that = this;
      scope[path] = [
        {
          text: $translate.instant('CREDENTIALS_AMAZON_IAM_OPTION'),
          click: function() {
            $state.go('app.credentials-new-by-iam-role');
          }
        },
        {
          text: $translate.instant('CREDENTIALS_AMAZON_ACCESS_OPTION'),
          click: function() {
            $state.go('app.credentials-new-by-accesskey');
          }
        },
        {
          text: $translate.instant('CREDENTIALS_SOFTLAYER_OPTION'),
          click: function() {
            $state.go('app.credentials-new-softlayer');
          }
        }
      ];

      if (eventCleanup !== null) {
        eventCleanup();
      }
      eventCleanup = $rootScope.$on('$translateChangeSuccess', function() {
        that.setOptions(scope, path, itemsPath);
      });
    }
  };
});
