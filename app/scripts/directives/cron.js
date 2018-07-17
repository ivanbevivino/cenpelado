'use strict';

angular.module('cloudpoxee.directives').directive('cron', function ($rootScope, $log, $translate) {
  function updateTranslations(result) {
    result.CRON_HOUR = $translate.instant('CRON_HOUR');
    result.CRON_HOUR_POSTFIX = $translate.instant('CRON_HOUR_POSTFIX');
    result.CRON_DAY = $translate.instant('CRON_DAY');
    result.CRON_MONTH = $translate.instant('CRON_MONTH');
    result.CRON_YEAR = $translate.instant('CRON_YEAR');
    result.CRON_OF = $translate.instant('CRON_OF');
    result.CRON_AT = $translate.instant('CRON_AT');
    return result;
  }

  function getWeekdayString (dow) {
    var weekdays = [
      { id: 'MON', label: $translate.instant('MONDAY'), smallLabel: $translate.instant('MONDAY-SMALL') },
      { id: 'TUE', label: $translate.instant('TUESDAY'), smallLabel: $translate.instant('TUESDAY-SMALL') },
      { id: 'WED', label: $translate.instant('WEDNESDAY'), smallLabel: $translate.instant('WEDNESDAY-SMALL') },
      { id: 'THU', label: $translate.instant('THURSDAY'), smallLabel: $translate.instant('THURSDAY-SMALL') },
      { id: 'FRI', label: $translate.instant('FRIDAY'), smallLabel: $translate.instant('FRIDAY-SMALL') },
      { id: 'SAT', label: $translate.instant('SATURDAY'), smallLabel: $translate.instant('SATURDAY-SMALL') },
      { id: 'SUN', label: $translate.instant('SUNDAY'), smallLabel: $translate.instant('SUNDAY-SMALL') }
    ];

    var days = dow.split(',');
    var result = [];

    angular.forEach(days, function (day) {
      angular.forEach(weekdays, function (weekday) {
        if (day === weekday.id) {
          result.push(weekday.label);
        }
      });
    });

    return result.join(',');
  }

  function cronToReadableExpression(translations, expression) {
    if (expression) {
      var parts = expression.split(' ');

      var minute = parts[1];
      var hour = parts[2];
      var day = parts[3];
      var month = parts[4];

      moment.locale($translate.use());

      var months = moment.months();

      var momentConfig = {};
      if (day !== '*') {
        momentConfig.day = day;
      }

      if (hour !== '*') {
        momentConfig.hour = hour;
      }

      if (minute !== '*') {
        momentConfig.minute = minute;
      }

      var formatter = moment(momentConfig);
      if (parts[2] === '*' && parts[3] === '*' && parts[4] === '*') { // hour
        return translations.CRON_DAY + getWeekdayString(parts[5]) + translations.CRON_AT + formatter.format('mm') + translations.CRON_HOUR_POSTFIX;
      } else if (parts[3] === '*' && parts[4] === '*') { // day
        return translations.CRON_DAY + getWeekdayString(parts[5]) + translations.CRON_AT + formatter.format('HH:mm');
      } else if (parts[4] === '*' && parts[5] === '*') { // month
        return translations.CRON_MONTH + formatter.format('Do') + translations.CRON_AT + formatter.format('HH:mm');
      } else { // year
        return translations.CRON_YEAR + formatter.format('Do') + translations.CRON_OF + months[month - 1] + translations.CRON_AT + formatter.format('HH:mm');
      }
    }
    return '';
  }

  return {
    restrict: 'A',
    scope: {
      cron: '=cron'
    },
    template: '{{expression}}',
    link: function (scope) {
      scope.expression = cronToReadableExpression(updateTranslations({}), scope.cron);

      $rootScope.$on('$translateChangeSuccess', function () {
        scope.expression = cronToReadableExpression(updateTranslations({}), scope.cron);
      });
    }
  };
});
