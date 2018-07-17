'use strict';

angular.module('cloudpoxee.directives').directive('activityEntry', function ($log, $modal, $aside, growl, CloudAPI) {
  function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  return {
    restrict: 'E',
    scope: {
      event: '=event'
    },
    templateUrl: 'views/templates/activity/event.html',
    replace: true,
    link: function (scope) {
      scope.email = scope.event.principalUserEmail;
      scope.showUserImage = false;

      scope.now = new Date().getTime();

      scope.appPath = cpconfig.CONTENT_URL;

      scope.displayDetails = function (event) {
        var innerScope = scope.$new();
        innerScope.event = event;
        $modal({
          scope: innerScope,
          template: 'views/templates/exception-details.html'
        });
      };

      scope.postpone = function (event) {
        $log.debug('Postpone', event);

        var asideScope = scope.$new();
        asideScope.event = event;
        asideScope.postpone = function (delay) {
          CloudAPI.postponeNextExecution(event.taskId, event.id, delay).then(function () {
            growl.success('NEXT_SCHEDULE_POSTPONED');
            event.canceled = false;
            event.postponed = true;
          }, function () {
            growl.error('NEXT_SCHEDULE_POSTPONED_FAILED');
          });
        };

        $aside({
          scope: asideScope,
          container: 'body',
          placement: 'right',
          templateUrl: 'views/templates/scheduling/postpone-aside.html',
          backdrop: 'static'
        });
      };

      scope.cancelImpending = function (event) {
        CloudAPI.skipNextExecution(event.taskId, event.id).then(function () {
          growl.success('NEXT_SCHEDULE_CANCELED');
          event.canceled = true;
          event.postponed = false;
        }, function () {
          growl.error('NEXT_SCHEDULE_CANCELED_FAILED');
        });
      };

      scope.cancelReverse = function (event) {
        CloudAPI.cancelTaskActions(event.taskId, event.id).then(function () {
          growl.success('NEXT_SCHEDULE_CANCELED');
          event.canceled = true;
        }, function () {
          growl.error('NEXT_SCHEDULE_CANCELED_FAILED');
        });
      };

      switch (scope.event.type) {
        case 'INSTANCE_START':
        case 'INSTANCE_REBOOT':
        case 'INSTANCE_STOP':
        case 'USER_CREATE':
        case 'USER_UPDATE':
        case 'USER_DELETE':
        case 'USER_ADD_TO_CUSTOMER':
        case 'USER_REMOVE_TO_CUSTOMER':
        case 'CLOUD_ACCOUNT_CREATE':
        case 'CLOUD_ACCOUNT_DELETE':
        case 'CLOUD_ACCOUNT_UPDATE':
          if (validateEmail(scope.email)) {
            scope.showUserImage = true;
          }
      }
    }
  };
});
