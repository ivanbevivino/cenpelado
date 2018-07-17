'use strict';

angular.module('cloudpoxee.controllers').controller('ConnectCtrl', function($aside, $log, $scope, $modal, growl, ConnectAPI, Utilities, connects, $filter, Session) {
  $log.debug('Connect controller...');
  $scope.connect_instances = connects;


  $scope.initialize = function() {
    Utilities.loading(true);
    ConnectAPI.getConnectInstances().then(function(response) {
      $scope.connect_instances = response;
      $log.debug(response);
      $scope.loaded = true;
    });
    Utilities.loading(false);
  }

  $scope.addConnect = function() {
    var innerScope = $scope.$new();
    innerScope.connect = {};
    innerScope.execute = function() {
      Utilities.loading(true);

      ConnectAPI.addConnectInstance(innerScope.connect).then(function() {

        aside.hide();
        Utilities.loading(false);
        growl.success('Connect will be created. This may take a few minutes.');
        $scope.initialize();
        $scope.displayedRows = $scope.connect_instances;
      }).catch(function(error) {
        Utilities.loading(false);

        growl.error(error.message);
      });
    };

    var aside;
    aside = $aside({
      scope: innerScope,
      container: 'body',
      placement: 'right',
      template: 'views/connect/aside/addConnect.html',
      backdrop: 'static'
    });

  };

  $scope.updateConnect = function(instance) {
    var innerScope = $scope.$new();
    innerScope.connect = JSON.parse(JSON.stringify(instance));

    innerScope.execute = function() {
      Utilities.loading(true);
      ConnectAPI.updateConnectInstance(innerScope.connect).success(function() {
        aside.hide();
        Utilities.loading(false);
        growl.success('Connect will be updated. This may take a few minutes.');
        $scope.initialize();
        $scope.displayedRows = $scope.connect_instances;
      }).error(function(error) {
        Utilities.loading(false);
        growl.error(error.message);
      });
    };

    var aside;
    aside = $aside({
      scope: innerScope,
      container: 'body',
      placement: 'right',
      template: 'views/connect/aside/addConnect.html',
      backdrop: 'static'
    });

  };

  $scope.addReports = function(instance) {
    var innerScope = $scope.$new();
    innerScope.selectedreport = {};
    innerScope.reports = {};

    ConnectAPI.getListReports(JSON.parse(JSON.stringify(instance)).instanceid).then(function(response) {
      innerScope.reports = response;
      $log.debug(response);
      $scope.loaded = true;
    });
    innerScope.deleteReport = function(report) {
      Utilities.loading(true);
      ConnectAPI.deleteReport(report).success(function() {
        aside.hide();
        Utilities.loading(false);
        growl.success('Report will be deleted. This may take a few minutes.');
      }).error(function(error) {
        Utilities.loading(false);
        growl.error(error.message);
      });
    }
    innerScope.saveReport = function(report) {
      innerScope.selectedreport = report;
      innerScope.selectedreport.instanceId = instance.instanceid
      innerScope.selectedreport.customerId = Session.user.customer.id
      Utilities.loading(true);
      if (innerScope.selectedreport.id == null) {
        ConnectAPI.addReport(innerScope.selectedreport).success(function() {
          aside.hide();
          Utilities.loading(false);
          growl.success('Report will be created. This may take a few minutes.');
        }).error(function(error) {
          Utilities.loading(false);
          growl.error(error.message);
        });
      } else {
        ConnectAPI.updateReport(innerScope.selectedreport).success(function() {
          aside.hide();
          Utilities.loading(false);
          growl.success('Report will be updated. This may take a few minutes.');
        }).error(function(error) {
          Utilities.loading(false);
          growl.error(error.message);
        });
      }

    }
    var aside;
    aside = $aside({
      scope: innerScope,
      container: 'body',
      placement: 'right',
      template: 'views/connect/aside/addReports.html',
      backdrop: 'static'
    });
  };



});
