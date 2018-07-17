'use strict';

angular.module('cloudpoxee.controllers').controller('ManageAdminsCtrl',
  function($log, $scope, $q, $filter, $modal, CloudAPI, growl, admins, Utilities, Session) {
    $log.debug('CloudPoxee manage admins controller...');
    $scope.admins = admins.data;
    var modal;

    $scope.createUserPopup = function() {
      $log.debug('Opening create user popup...');
      modal = $modal({
        scope: $scope,
        title: 'Create admin',
        template: 'views/templates/admin-add-modal.html'
      });
    };

    $scope.initializeUser = function() {
      $scope.newUser = {
        email: '',
        name: '',
        lastName: '',
        secondaryEmail: '',
        password: ''
      };
    };

    $scope.initializeUser();

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

    // -- Modal callbacks

    $scope.createUser = function() {
      var user = $scope.newUser;
      if (_.isEmpty(user.name) || _.isEmpty(user.lastName) ||
        _.isEmpty(user.email) || _.isEmpty(user.password)) {
        growl.error('NEW_CLIENT_STEP_3_VALIDATION_1');
      } else if (!Utilities.validateEmail(user.email) || (!_.isEmpty(user.secondaryEmail) && !Utilities.validateEmail(user.secondaryEmail))) {
        growl.error('NEW_CLIENT_STEP_3_VALIDATION_2');
      } else {
        $log.debug('Creating user...');
        CloudAPI.createAdmin({
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          password: user.password,
          passwordConfirm: user.password
        }).success(function() {
          growl.success('USER_CREATE_SUCCESS');
          CloudAPI.getAdmins().then(function(response) {
            $scope.admins = response.data;
          });
          modal.hide();
          $scope.initializeUser();
        }).error(function() {
          growl.error('USER_CREATE_ERROR');
        });
      }
    };

    // Dropdown user

    $scope.dropdownUser = [
      {
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
      }
    ];

    $scope.deleteUsers = function() {
      var selectedAdmins = $filter('filter')($scope.admins, { active: true });
      $log.debug('Deleting admins...', selectedAdmins);
      var requests = [];
      var selfError = false;
      angular.forEach(selectedAdmins, function(user) {
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
          CloudAPI.getAdmins().then(function(response) {
            $scope.admins = response.data;
            growl.success('DELETE_USER_SUCCESS');
          });
        }, function() {
          growl.error('DELETE_USER_ERROR');
        });
      }
    };

    $scope.resetPasswords = function() {
      var selectedAdmins = $filter('filter')($scope.admins, { active: true });
      $log.debug('Resetting passwords...', selectedAdmins);
      var requests = [];
      angular.forEach(selectedAdmins, function(user) {
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
      var selectedAdmins = $filter('filter')($scope.admins, { active: true });
      $log.debug('Resetting 2FA...', selectedAdmins);
      var requests = [];
      angular.forEach(selectedAdmins, function(user) {
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
  }
);
