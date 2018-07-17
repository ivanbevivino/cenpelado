'use strict';

angular.module('cloudpoxee.controllers').controller('ApplicationCtrl', function($log, $rootScope, growl, $modal, $scope, $state, $timeout, $aside, $translate, CloudAPI, AuthService, Session, AdminService, Introduction, USER_ROLES, APPLICATIONS) {
  $log.debug('CloudPoxee application controller...');

  // --------------------------------------------------------------------------
  // Security related
  // --------------------------------------------------------------------------
  $scope.$rootScope = $rootScope;
  $scope.user = Session.user;
  $scope.customer = Session.user.customer;
  $scope.roles = USER_ROLES;
  $scope.applications = APPLICATIONS;
  $scope.isAuthorized = AuthService.isAuthorized;
  $scope.hasApplications = AuthService.hasApplications;

  // --------------------------------------------------------------------------
  // Domain related
  // --------------------------------------------------------------------------
  $scope.appPath = cpconfig.CONTENT_URL;


function hidenMenu(){
  if(!$scope.hasApplications([$scope.applications.MEDIABOX])){
    $('.app-mediabox').addClass('hidden');
  }
  if(!$scope.hasApplications([$scope.applications.CONNECT])){
      $('.app-connect').addClass('hidden');
  }
  if(!$scope.hasApplications([$scope.applications.CLOUDPOXEE])){
    $('.app-cloudpoxee').addClass('hidden');
  }
  if(!$scope.hasApplications([$scope.applications.SCHEDULER])){
    $('.app-scheduler').addClass('hidden');
  }
  if(!$scope.hasApplications([$scope.applications.WORKSPACES])){
    $('.app-workspaces').addClass('hidden');
  }
}
hidenMenu();
  // --------------------------------------------------------------------------
  // User menu settings
  // --------------------------------------------------------------------------
  function setDropdownOptions() {
    $scope.dropdown = [
      {
        'text': $translate.instant('MY_PROFILE'),
        'click': 'goProfile()'
      },
      {
        'divider': true
      },
      {
        'text': $translate.instant('REFRESH_DATA'),
        'click': 'refresh()'
      },
      {
        'divider': true
      },
      {
        'text': 'English',
        'click': 'selectLanguage("en_US")'
      },
      {
        'text': 'Español',
        'click': 'selectLanguage("es_ES")'
      },
      {
        'divider': true
      },
      {
        'text': $translate.instant('HELP'),
        'click': 'help()'
      },
      {
        'text': $translate.instant('FEEDBACK_SUGGESTIONS'),
        'click': 'feedback()'
      },
      {
        'text': $translate.instant('TUTORIAL'),
        'click': 'tutorial()'
      },
      {
        'divider': true
      },
      {
        'text': $translate.instant('LOG_OUT'),
        'click': '$rootScope.$broadcast("logout")'
      }
    ];
  }
  setDropdownOptions();
  $rootScope.$on('$translateChangeSuccess', setDropdownOptions);

  $scope.go = function(link) {
    if ($state.current.name !== 'app.welcome') {
      $state.go(link);
    }
  };

  $scope.selectLanguage = function(code) {
    $translate.use(code);
    $rootScope.$broadcast('language:change', code);
  };

  $scope.goProfile = function() {
    $timeout(function() {
      $state.go('app.profile');
    });
  };

  $scope.refresh = function() {
    CloudAPI.preloadClouds();
  };

  var aside;

  $scope.openClientsPanel = function() {
    AdminService.getClients().then(function(data) {
      $scope.clients = data;
      aside = $aside({
        scope: $scope,
        container: 'body',
        placement: 'right',
        template: 'views/templates/clients-aside.html'
      });
    });
  };

  $scope.search = {
    enabled: true
  };

  $scope.selectClient = function(client) {
    $rootScope.$broadcast('client:changed', client);
    if (aside) {
      aside.hide();
    }

    $timeout(function() {
      
      $state.go('app.dashboard');
    });
  };

  $scope.addClient = function() {
    aside.hide();
    $state.go('app.customers-add');
  };

  $scope.feedback = function() {
    var modal;
    var modalScope = $scope.$new();

    modalScope.sendFeedback = function(message) {
      if (message && message.length > 0) {
        $log.debug('Sending feedback message');
        CloudAPI.sendFeedback(message).then(function() {
          growl.success('FEEDBACK_SUCCESS');
          modal.hide();
        }, function() {
          growl.error('FEEDBACK_ERROR');
        });
      }
    };

    modal = $modal({
      scope: modalScope,
      template: 'views/templates/feedback-modal.html'
    });
  };

  $scope.help = function() {
    Introduction.startTour($state.current.name);
  };

  $scope.tutorial = function() {
    Session.user.showTutorial = true;
    if ($state.current.name !== 'app.dashboard') {
      $state.go('app.dashboard');
    } else {
      Introduction.startTour('app.dashboard', true);
    }
  };

  // -- Event listeners

  $scope.$on('client:changed', function(evt, client) {
    Session.setCustomer(client);
    $scope.customer = client;
  });

  $scope.$on('user:changed', function(evt, user) {
    Session.setUser(user);
    $scope.user = user;
  });

});
