'use strict';

angular.module('cloudpoxee.controllers').controller('CustomerSettingsCtrl', function($log, $aside, $scope, $rootScope,
  $filter, $modal, $q, $timeout, growl, users, credentials, Session, AuthService,
  CloudAPI, Utilities, PermissionService, USER_ROLES, liquidware) {

  $log.debug('CloudPoxee customer settings controller...');

  // -- Instance variables
  var modal;

  // -- Table sorting

  $scope.userSort = 'name';
  $scope.credentialSort = 'accountName';
  $scope.forms = {};

  $scope.sortTable = function(sortName, attribute) {
    if (attribute === $scope[sortName]) {
      $scope[sortName] = '-' + attribute;
    } else {
      $scope[sortName] = attribute;
    }
  };

  // -- Scope variables

  $scope.initializeUser = function() {
    $scope.newUser = {
      email: '',
      name: '',
      lastName: '',
      secondaryEmail: '',
      password: '',
      role: 'ROLE_CH_USER_ADMIN'
    };
  };

  $scope.initializeUser();

  $scope.tab = 'users';
  $scope.customer = Session.user.customer;
  $scope.users = users.data;
  $scope.isAuthorized = AuthService.isAuthorized;
  $scope.roles = USER_ROLES;
  $scope.credentials = credentials.data;
  $scope.liquidware = liquidware.data;

  $scope.activateTab = function(tabName) {
    $scope.tab = tabName;
  };

  // -- Modals

  $scope.createUserPopup = function() {
    $log.debug('Opening create user popup...');
    modal = $modal({
      scope: $scope,
      title: 'Create user',
      template: 'views/templates/user-add-modal.html'
    });
  };

  $scope.createEditUserPopup = function($event, user) {
    $log.debug('Opening edit user popup...', user);
    $event.stopPropagation();
    $scope.editUser = angular.copy(user);
    $scope.editUser.role = $scope.editUser.roles[0];
    delete $scope.editUser.roles;

    modal = $modal({
      scope: $scope,
      title: 'Edit user',
      template: 'views/templates/user-edit-modal.html'
    });
  };

  $scope.createCloudAccount = function(provider) {
    $log.debug('Opening create cloud popup...', provider);
    modal = $modal({
      scope: $scope,
      title: 'Create user',
      template: 'views/templates/' + provider + '/cloud-add-modal.html'
    });
  };

  $scope.createEditCloudPopup = function($event, cloud) {
    $log.debug('Opening edit cloud popup...', cloud);
    $event.stopPropagation();
    $scope.editAccount = {
      id: cloud.id,
      accountName: cloud.accountName
    };

    modal = $modal({
      scope: $scope,
      title: 'Edit user',
      template: 'views/templates/' + cloud.provider + '/cloud-edit-modal.html'
    });
  };

  $scope.showAmazonPolicy = function() {
    $modal({
      template: 'views/templates/AMAZON/policy-modal.html'
    });
    return false;
  };

  // -- Modal callbacks

  $scope.createUser = function() {
    var user = $scope.newUser;
    if (_.isEmpty(user.name) || _.isEmpty(user.lastName) ||
      _.isEmpty(user.email) || _.isEmpty(user.password) ||
      _.isEmpty(user.role)) {
      growl.error('NEW_CLIENT_STEP_3_VALIDATION_1');
    } else if (!Utilities.validateEmail(user.email) || (!_.isEmpty(user.secondaryEmail) && !Utilities.validateEmail(user.secondaryEmail))) {
      growl.error('NEW_CLIENT_STEP_3_VALIDATION_2');
    } else {
      $log.debug('Creating user...');
      CloudAPI.createUser({
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        password: user.password,
        passwordConfirm: user.password,
        roles: [user.role],
        customerId: $scope.customer.id
      }).success(function() {
        growl.success('USER_CREATE_SUCCESS');
        CloudAPI.getUsers().then(function(response) {
          $scope.users = response.data;
        });
        modal.hide();
        $scope.initializeUser();
      }).error(function() {
        growl.error('USER_CREATE_ERROR');
      });
    }
  };

  $scope.updateUser = function() {
    var user = $scope.editUser;
    if (_.isEmpty(user.name) || _.isEmpty(user.lastName) || _.isEmpty(user.email) || _.isEmpty(user.role)) {
      growl.error('NEW_CLIENT_STEP_3_VALIDATION_1');
    } else if (!Utilities.validateEmail(user.email) || (!_.isEmpty(user.secondaryEmail) && !Utilities.validateEmail(user.secondaryEmail))) {
      growl.error('NEW_CLIENT_STEP_3_VALIDATION_2');
    } else {
      $log.debug('Creating user...');
      CloudAPI.updateUser({
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        password: user.password,
        passwordConfirm: user.password,
        roles: [user.role],
        customerId: $scope.customer.id
      }).success(function() {
        growl.success('USER_UPDATE_SUCCESS');
        CloudAPI.getUsers().then(function(response) {
          $scope.users = response.data;
        });
        modal.hide();
        $scope.initializeUser();
      }).error(function() {
        growl.error('USER_UPDATE_ERROR');
      });
    }
  };

  function preloadClouds() {
    modal.hide();
    $rootScope.$broadcast('loadingBlock', true);
    CloudAPI.preloadClouds().success(function() {
      $rootScope.$broadcast('loadingBlock', false);
      CloudAPI.getCredentials().then(function(credentials) {
        $scope.credentials = credentials.data;
      });
    }).error(function() {
      growl.warning('ERROR_PRELOAD_CLOUD_ACCOUNT'); // update warning
      $rootScope.$broadcast('loadingBlock', false);
    });
  }

  $scope.addAmazonAccount = function(name, accessKey, secretKey, accountReach) {
    $log.debug('Adding Amazon account', name, accessKey, secretKey);
    if (_.isEmpty(name) || _.isEmpty(accessKey) || _.isEmpty(secretKey)) {
      growl.error('VERIFY_REQUIRED_FIELDS');
    } else {
      CloudAPI.addAmazonAccount({
        accountName: name,
        accessKey: accessKey,
        secretKey: secretKey,
        accountReach: accountReach
      }).then(function() {
        preloadClouds(); // Preload just one account TODO
      }, function(response) {
        if (response.status === 423) {
          growl.error('ERROR_CLOUD_ACCOUNT_EXISTS');
        } else {
          growl.error('ERROR_CLOUD_ACCOUNT');
        }
      });
    }
  };

  $scope.editAmazonAccount = function(cloud) {
    if (_.isEmpty(cloud.accountName) || _.isEmpty(cloud.accessKey) || _.isEmpty(cloud.secretKey)) {
      growl.error('VERIFY_REQUIRED_FIELDS');
    } else {
      CloudAPI.updateAmazonAccount(cloud).success(function() {
        preloadClouds(); // Preload just one account TODO
      });
    }
  };

  $scope.addSoftLayerAccount = function(name, username, apiKey) {
    $log.debug('Adding Soft Layer account', name, username, apiKey);
    if (_.isEmpty(name) || _.isEmpty(username) || _.isEmpty(apiKey)) {
      growl.error('VERIFY_REQUIRED_FIELDS');
    } else {
      CloudAPI.addSoftLayerAccount({
        accountName: name,
        username: username,
        apiKey: apiKey
      }).success(function() {
        preloadClouds(); // Preload just one account TODO
      }).error(function() {
        growl.error('ERROR_CLOUD_ACCOUNT');
      });
    }
  };

  $scope.editSoftLayerAccount = function(cloud) {
    $log.debug('Edit SoftLayer account', cloud);
    if (_.isEmpty(cloud.accountName) || _.isEmpty(cloud.username) || _.isEmpty(cloud.apiKey)) {
      growl.error('VERIFY_REQUIRED_FIELDS');
    } else {
      CloudAPI.updateSoftLayerAccount(cloud).success(function() {
        preloadClouds(); // Preload just one account TODO
      });
    }
  };

  // -- Modal utilities

  $scope.configurePermission = function(permission) {
    $scope.newUser.role = permission;
  };

  $scope.configureEditPermission = function(permission) {
    $scope.editUser.role = permission;
  };

  // -- User Dropdown

  $scope.dropdownUser = [{
      'text': 'Delete',
      'click': 'deleteUsers()'
    },
    {
      'text': 'Reset Password',
      'click': 'resetPasswords()'
    },
    {
      'text': 'Reset 2FA',
      'click': 'reset2FA()'
    },
    {
      'text': 'Add Permission',
      'click': 'addPermission()'
    },
    {
      'text': 'Remove Permission',
      'click': 'removePermission()'
    }
  ];

  $scope.deleteUsers = function() {
    var selectedUsers = $filter('filter')($scope.users, {
      active: true
    });
    $log.debug('Deleting users...', selectedUsers);
    var requests = [];
    var selfError = false;
    angular.forEach(selectedUsers, function(user) {
      if (user.id === Session.user.id) {
        selfError = true;
        return;
      }
      requests.push(CloudAPI.deleteUser(user.email));
    });

    if (selfError) {
      growl.error('DELETE_CURRENT_USER');
    } else if (requests.length > 0) {
      $q.all(requests).then(function() {
        CloudAPI.getUsers().then(function(response) {
          $scope.users = response.data;
          growl.success('DELETE_USER_SUCCESS');
        });
      }, function() {
        growl.error('DELETE_USER_ERROR');
      });
    }
  };

  $scope.resetPasswords = function() {
    var selectedUsers = $filter('filter')($scope.users, {
      active: true
    });
    $log.debug('Resetting passwords...', selectedUsers);
    var requests = [];
    angular.forEach(selectedUsers, function(user) {
      requests.push(CloudAPI.resetPassword(user.email));
    });
    if (requests.length > 0) {
      $q.all(requests).then(function() {
        growl.success('RESET_PASSWORD_SUCCESS');
      }, function() {
        growl.error('RESET_PASSWORD_ERROR');
      });
    }
  };

  $scope.reset2FA = function() {
    var selectedUsers = $filter('filter')($scope.users, {
      active: true
    });
    $log.debug('Resetting 2FA...', selectedUsers);
    var requests = [];
    angular.forEach(selectedUsers, function(user) {
      requests.push(CloudAPI.reset2FA(user.email));
    });
    if (requests.length > 0) {
      $q.all(requests).then(function() {
        growl.success('RESET_2FA_SUCCESS');
      }, function() {
        growl.error('RESET_2FA_ERROR');
      });
    }
  };

  $scope.addPermission = function() {
    var selectedUsers = $filter('filter')($scope.users, {
      active: true
    });
    var innerScope = $scope.$new();
    innerScope.addPermission = function(key, value) {
      if (!_.isEmpty(key) && !_.isEmpty(value)) {
        var requests = [];
        angular.forEach(selectedUsers, function(user) {
          requests.push(PermissionService.addUserPermission(user, key + ':' + value));
        });
        if (requests.length > 0) {
          $q.all(requests).then(function() {
            growl.success('PERMISSION_SUCCESS');
            if (m) {
              m.hide();
            }
          }, function() {
            growl.error('PERMISSION_ERROR');
          });
        }
      }
    };
    var m = $modal({
      scope: innerScope,
      template: 'views/templates/permission-add-modal.html'
    });
  };

  $scope.removePermission = function() {
    var selectedUsers = $filter('filter')($scope.users, {
      active: true
    });
    var innerScope = $scope.$new();

    innerScope.removePermission = function(key, value) {
      if (!_.isEmpty(key) && !_.isEmpty(value)) {
        var requests = [];
        angular.forEach(selectedUsers, function(user) {
          requests.push(PermissionService.removeUserPermission(user, key + ':' + value));
        });

        if (requests.length > 0) {
          $q.all(requests).then(function() {
            growl.success('PERMISSION_SUCCESS');
            if (m) {
              m.hide();
            }
          }, function() {
            growl.error('PERMISSION_ERROR');
          });
        }
      }
    };
    var m = $modal({
      scope: innerScope,
      template: 'views/templates/permission-remove-modal.html'
    });
  };

  // -- Cloud Dropdown

  $scope.dropdownCloud = [{
      'text': 'Amazon',
      'click': 'createCloudAccount("AMAZON")'
    },
    {
      'text': 'Soft Layer',
      'click': 'createCloudAccount("SOFTLAYER")'
    }
  ];

  $scope.deleteClouds = function() {
    var selectedClouds = $filter('filter')($scope.credentials, {
      active: true
    });
    $log.debug('Deleting cloud accounts', selectedClouds);

    var requests = [];
    var deleteRequests = [];

    var accountsWithoutSchedules = 0;
    var accountsWithSchedules = 0;

    angular.forEach(selectedClouds, function(cloud) {
      requests.push(CloudAPI.getTasksByCloudAccount(cloud.id).then(function(tasks) {
        if (tasks.length === 0) {
          accountsWithoutSchedules++;

          if (cloud.provider === 'AMAZON') {
            deleteRequests.push(CloudAPI.deleteAmazonAccount(cloud.id));
          } else if (cloud.provider === 'SOFTLAYER') {
            deleteRequests.push(CloudAPI.deleteSoftLayerAccount(cloud.id));
          }
        } else {
          accountsWithSchedules++;
        }
      }));
    });

    if (requests.length > 0) {
      $q.all(requests).then(function() {
        if (deleteRequests.length > 0) {
          $q.all(deleteRequests).then(function() {
            CloudAPI.getCredentials().then(function(response) {
              $scope.credentials = response.data;

              if (accountsWithSchedules > 0) {
                growl.warning('DELETE_CLOUDS_WARNING');
              } else {
                growl.success('DELETE_CLOUDS_SUCCESS');
              }
            });
          }, function() {
            growl.error('DELETE_CLOUDS_ERROR');
          });
        } else {
          growl.warning('DELETE_CLOUDS_WARNING');
        }
      });
    }
  };

  $scope.nextPageDisabled = function() {
    return $scope.currentPage === $scope.pageCount() ? 'disabled' : '';
  };

  // -- Map Settings
  function updateHQLocation(place) {
    if ($scope.clickedMarker !== null) {
      $log.debug('1');
      $scope.clickedMarker[0].latitude = place.geometry.location.lat();
      $scope.clickedMarker[0].longitude = place.geometry.location.lng();
    } else {
      $log.debug('2');
      $scope.clickedMarker = [{
        id: 0,
        icon: 'images/maps/hq-icon.png',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      }];
    }
    $scope.map.center.latitude = place.geometry.location.lat();
    $scope.map.center.longitude = place.geometry.location.lng();

    var hq = Session.user.customer.headquarter;
    hq.address = place.formatted_address;
    hq.latitude = place.geometry.location.lat();
    hq.longitude = place.geometry.location.lng();
    Session.setCustomer(Session.user.customer);

    $scope.map.zoom = 17;
  }

  $scope.searchbox = {
    template: 'searchbox.tpl.html',
    events: {
      place_changed: function(autocomplete) {
        var place = autocomplete.getPlace();

        if (!place.geometry) {
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode({
            'address': place.name
          }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results.length > 0) {
                place = results[0];
                CloudAPI.updateHeadquarter(place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng()).then(function() {
                  growl.success('Location saved!');
                  updateHQLocation(place);
                }, function() {
                  growl.error('Problem saving location');
                });
                $scope.$apply();
              } else {
                growl.error('Location not found!');
              }
            } else {
              growl.error('Location not found!');
            }
          });
        } else {
          CloudAPI.updateHeadquarter(place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng()).then(function() {
            growl.success('Location saved!');
            updateHQLocation(place);
          }, function() {
            growl.error('Problem saving location');
          });
        }
        $scope.$apply();
      }
    },
    options: {
      autocomplete: true,
      types: ['geocode']
    }
  };

  $scope.map = {
    center: {
      latitude: 30,
      longitude: -60
    },
    zoom: 4
  };

  var hq = Session.user.customer.headquarter;
  if (hq === null) {
    hq = Session.user.customer.headquarter = {};
    $scope.clickedMarker = null;
  } else {
    if (hq.address !== null && hq.address !== '') {
      $scope.clickedMarker = [{
        id: 0,
        icon: 'images/maps/hq-icon.png',
        latitude: hq.latitude,
        longitude: hq.longitude
      }];
      $scope.map.center.latitude = hq.latitude;
      $scope.map.center.longitude = hq.longitude;
      $scope.map.zoom = 17;
    } else {
      $scope.clickedMarker = null;
    }
  }

  $scope.options = {
    mapTypeControl: false,
    streetViewControl: false,
    scaleControl: false,
    wheelControl: false,
    minZoom: 4,
    maxZoom: 17,
    styles: [{
        'featureType': 'all',
        'elementType': 'all',
        'stylers': [{
          'visibility': 'off'
        }]
      },
      {
        'featureType': 'administrative',
        'elementType': 'labels.text.fill',
        'stylers': [{
          'color': '#444444'
        }]
      },
      {
        'featureType': 'administrative.country',
        'elementType': 'geometry',
        'stylers': [{
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
        'stylers': [{
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
        'stylers': [{
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
        'stylers': [{
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
        'stylers': [{
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
        'stylers': [{
          'visibility': 'off'
        }]
      },
      {
        'featureType': 'road',
        'elementType': 'all',
        'stylers': [{
            'saturation': -100
          },
          {
            'lightness': 45
          },
          {
            'visibility': 'on'
          }
        ]
      },
      {
        'featureType': 'road.highway',
        'elementType': 'all',
        'stylers': [{
          'visibility': 'off'
        }]
      },
      {
        'featureType': 'road.arterial',
        'elementType': 'labels.icon',
        'stylers': [{
          'visibility': 'off'
        }]
      },
      {
        'featureType': 'transit',
        'elementType': 'all',
        'stylers': [{
          'visibility': 'off'
        }]
      },
      {
        'featureType': 'water',
        'elementType': 'all',
        'stylers': [{
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
        'stylers': [{
          'color': '#fdfdfd'
        }]
      }
    ]
  };

  //uiGmapIsReady.promise().then(function(maps) {
  // TODO Add code here...
  //});

  $scope.$on('customer-settings:tabChange', function(evt, tab) {
    $scope.tab = tab;
  });

  //EVENTS_STREAM_NOTIFICATIONS

  $scope.eventStreamNotification = {
    customerId: $scope.user.customer.id,
    method: 'EMAIL'
  };

  function retrieveEventTypes() {
    CloudAPI.getEventTypes().then(function(response) {
      $scope.eventTypes = response.data;
      $scope.eventStreamNotification.eventType = response.data[0];
    });
  }



  $scope.createEventNotification = function createEventNotification() {
    $log.debug('Creating event notification...');
    CloudAPI.createEventNotification($scope.eventStreamNotification).then(function() {
      refreshEventNotifications();
      $scope.eventStreamNotification = {
        customerId: $scope.user.customer.id,
        method: 'EMAIL',
        eventType: $scope.eventTypes[0]
      };

      if ($scope.forms.form.email) {
        $scope.forms.form.email.$pristine = true;
      }

      if ($scope.forms.form.url) {
        $scope.forms.form.url.$pristine = true;
      }
    });
  };

  $scope.toggleAll = function() {
    angular.forEach($scope.eventStreamNotifications, function(row) {
      row.active = ($scope.allActive) ? false : true;
    });
    $scope.allActive = !$scope.allActive;
  };

  $scope.toggleOne = function(row) {
    $scope.allActive = false;
    row.active = !row.active;
  };

  $scope.viewEventStreamNotification = function($event, eventStreamNotification) {
    $event.stopPropagation();
    var innerScope = $scope.$new();
    var modal;
    innerScope.eventStreamNotification = {
      id: eventStreamNotification.id,
      endpoint: eventStreamNotification.endpoint,
      method: eventStreamNotification.method,
      customerId: eventStreamNotification.customerId,
      eventType: eventStreamNotification.eventType
    };
    innerScope.updateEventStreamNotification = function() {
      CloudAPI.updateEventStreamNotification(innerScope.eventStreamNotification)
        .then(function() {
          modal.hide();
          refreshEventNotifications();
        });
    };
    modal = $modal({
      scope: innerScope,
      templateUrl: 'views/templates/event-stream-notification-modal.html'
    });
  };

  // -- Update servers
  function refreshEventNotifications() {
    CloudAPI.getEventNotifications(true).then(function(data) {
      $scope.eventStreamNotifications = data;
    });
  }

  $scope.deleteEventStreamNotifications = function() {
    var selectedItems = $filter('filter')($scope.eventStreamNotifications, {
      active: true
    });
    if (selectedItems.length > 0) {
      CloudAPI.deleteEventNotifications({
        eventStreamNotificationIds: selectedItems.map(function(i) {
          return i.id;
        })
      }).then(function() {
        refreshEventNotifications();
      });
    }
  };

  $scope.initializeliquidware = function() {
    CloudAPI.getLiquidware().success(function(response) {
      $scope.liquidware = response;
    }).error(function() {
      growl.error('NEW_CLIENT_STEP_1_UPDATE_ERROR');
    });
  };

  $scope.editLiquidware = function() {

    var innerScope = $scope.$new();
    innerScope.liquidware = this.row;
    if(innerScope.liquidware.liquidwareConfiguration.internal == null) innerScope.liquidware.liquidwareConfiguration.internal = true;
    innerScope.execute = function() {
      innerScope.liquidware.liquidwareConfiguration.idaccount = innerScope.liquidware.id

        if(innerScope.liquidware.liquidwareConfiguration.internal == true){
            innerScope.liquidware.liquidwareConfiguration.url = null
            innerScope.liquidware.liquidwareConfiguration.username = null
            innerScope.liquidware.liquidwareConfiguration.password = null
        }
        
      CloudAPI.updateLiquidware(innerScope.liquidware.liquidwareConfiguration).success(function() {
        growl.success('NEW_CLIENT_STEP_1_UPDATE_SUCCESS');
        $scope.initializeliquidware();
        aside.hide();
      }).error(function() {
        growl.error('NEW_CLIENT_STEP_1_UPDATE_ERROR');
      });
    };

    var aside;
    aside = $aside({
      scope: innerScope,
      container: 'body',
      placement: 'right',
      template: 'views/customers/aside/customer.liquidware.html',
      backdrop: 'static'
    });
  }


  retrieveEventTypes();
  refreshEventNotifications();
});
