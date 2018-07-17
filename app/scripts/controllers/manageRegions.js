'use strict';

angular.module('cloudpoxee.controllers').controller('ManageRegionsCtrl', function($log, $scope, $filter, $modal, $translate, growl, regions, CloudAPI) {
  $log.debug('CloudPoxee manage regions controller...');

  var modal;
  $scope.regions = $filter('orderBy')(regions, 'name');

  // Modal events

  $scope.createRegionPopup = function () {
    $log.debug('Opening create user popup...');
    $scope.activeRegion = {};
    modal = $modal({
      scope: $scope,
      title: $translate.instant('CREATE_REGION'),
      template: 'views/templates/region-modal.html'
    });
  };

  $scope.editRegionPopup = function (event, region) {
    event.stopPropagation();
    $log.debug('Access details for', region);
    $scope.activeRegion = angular.copy(region, {});
    modal = $modal({
      scope: $scope,
      title: $translate.instant('CREATE_REGION'),
      template: 'views/templates/region-modal.html'
    });
  };

  $scope.deleteRegion = function (event, region) {
    event.stopPropagation();
    CloudAPI.deleteRegion(region.id).then(function () {
      retrieveRegions();
      growl.success('REGION_REMOVED');
    }, function () {
      growl.error('REGIONS_ERROR');
    });
  };

  // Modal callbacks

  $scope.modalCallback = function () {
    CloudAPI.createOrUpdateRegion($scope.activeRegion).then(function () {
      retrieveRegions();
      growl.success('REGIONS_UPDATED');
      modal.hide();
    }, function () {
      growl.error('REGIONS_ERROR');
    });
  };

  // Refresh regions
  function retrieveRegions () {
    CloudAPI.getRegions().then(function (regions) {
      $scope.regions = $filter('orderBy')(regions, 'name');
    });
  }

  // Toggle utilities

  $scope.toggleAll = function () {
    angular.forEach($scope.admins, function (row) {
      row.active = ($scope.allActive) ? false : true;
    });
    $scope.allActive = !$scope.allActive;
  };

  $scope.toggleOne = function (row) {
    $scope.allActive = false;
    row.active = !row.active;
  };
});
