'use strict';

angular.module('cloudpoxee.directives').directive('menu', function ($log) {
  return {
    restrict: 'A',
    link: function (scope, element) {
      $log.debug('Configuring menu...');
      var menu = new PushMenu(element.get(0), $('.js-menu-trigger').get(0), {
        type : 'cover'
      });

      scope.$on('menu:open', function() {
        menu._openMenu();
      });

      scope.$on('menu:close', function() {
        menu._resetMenu();
      });
    }
  };
});
