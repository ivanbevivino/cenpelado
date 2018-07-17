'use strict';

angular.module('cloudpoxee.controllers').controller('MapDistributionCtrl', function($log, $scope, $rootScope, $timeout, Session,regions) {
  $log.debug('CloudPoxee map distribution controller...', regions);

  $scope.markers = regions;

  var hq = Session.user.customer.headquarter;
  if (hq !== null && hq.address !== null && hq.address !== '') {
    $scope.hq = {
      id: 0,
      icon: 'images/maps/hq-icon.png',
      latitude: hq.latitude,
      longitude: hq.longitude,
      address: hq.address,
      infoWindowOptions: {
        boxClass: 'mapInformation hq-popup',
        disableAutoPan: true
      }
    };
    $scope.markers.push($scope.hq);
  }

  $scope.map = {
    center: {
      latitude: 30,
      longitude: -60
    },
    zoom: 4
  };
  $scope.options = {
    mapTypeControl: false,
    streetViewControl: false,
    scaleControl: false,
    wheelControl: false,
    minZoom: 4,
    maxZoom: 10,
    styles: [
      {
        'featureType': 'all',
        'elementType': 'all',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'administrative',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'color': '#444444'
          }
        ]
      },
      {
        'featureType': 'administrative.country',
        'elementType': 'geometry',
        'stylers': [
          {
            'visibility': 'on'
          },
          {
            'color': '#fdfdfd'
          }
        ]
      },
      {
        'featureType': 'administrative.country',
        'elementType': 'geometry.fill',
        'stylers': [
          {
            'visibility': 'off'
          },
          {
            'color': '#aa3434'
          }
        ]
      },
      {
        'featureType': 'administrative.country',
        'elementType': 'labels',
        'stylers': [
          {
            'visibility': 'simplified'
          },
          {
            'color': '#979796'
          }
        ]
      },
      {
        'featureType': 'landscape',
        'elementType': 'all',
        'stylers': [
          {
            'color': '#f2f2f2'
          },
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'landscape',
        'elementType': 'geometry.fill',
        'stylers': [
          {
            'visibility': 'on'
          },
          {
            'color': '#dedee0'
          }
        ]
      },
      {
        'featureType': 'poi',
        'elementType': 'all',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'road',
        'elementType': 'all',
        'stylers': [
          {
            'saturation': -100
          },
          {
            'lightness': 45
          },
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'road.highway',
        'elementType': 'all',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'road.arterial',
        'elementType': 'labels.icon',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'transit',
        'elementType': 'all',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'all',
        'stylers': [
          {
            'color': '#fdfdfd'
          },
          {
            'visibility': 'on'
          }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'geometry.fill',
        'stylers': [
        {
          'color': '#fdfdfd'
        }
        ]
      }
    ]
  };
});
