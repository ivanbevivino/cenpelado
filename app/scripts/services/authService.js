'use strict';

// --------------------------------------------------------------------------
// Keeps authentication service
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').factory('AuthService', function($http, $log, Session) {
  var authService = {};

  authService.login = function(credentials) {
    return $http.post(cpconfig.API_URL + '/user/authenticate/', {
      email: credentials.email,
      password: credentials.password,
      twoFactorCode: credentials.authCode
    }).then(function(response) {
      Session.create(response.data.sessionId, response.data.signInToken, response.data.user);
      return response.data;
    }, function(response) {
      $log.debug('Login error...');
      return response.data;
    });
  };

  authService.isAuthenticated = function() {
    return Session.isAuthenticated();
  };

  authService.isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }

    if (authService.isAuthenticated()) {
      var authorized = false;
      angular.forEach(Session.user.roles, function(role) {
        if (authorizedRoles.indexOf(role) !== -1) {
          authorized = true;
          return false;
        }
      });
      return authorized;
    }
    return false;
  };
  authService.hasApplications = function(aplications) {
    if (authService.isAuthorized('ROLE_CH_SYSTEM_ADMIN')) {
      return true;
    }else{
      if (!angular.isArray(aplications)) {
        aplications = [aplications];
      }

      if (authService.isAuthenticated()) {
        var authorized = false;
        angular.forEach(Session.user.customer.apps, function(app) {
          if (aplications.indexOf(app) !== -1) {
            authorized = true;
            return false;
          }
        });
        return authorized;
      }
      return false;
    }
  };

  return authService;
});

// --------------------------------------------------------------------------
// Keeps session information
// --------------------------------------------------------------------------

angular.module('cloudpoxee.services').service('Session', function($log, localStorageService) {
  this.create = function(sessionId, signInToken, user) {
    $log.debug('Creating session...');
    this.sessionId = sessionId;
    this.signInToken = signInToken;
    this.user = user;
    localStorageService.set('session', this);
  };

  this.destroy = function() {
    $log.debug('Destroying session...');
    this.sessionId = null;
    this.signInToken = null;
    this.user = null;
    localStorageService.remove('session');
  };

  this.reload = function() {
    $log.debug('Reloading session...');
    var session = localStorageService.get('session', this);

    if (session) {
      angular.extend(this, session);
    }
  };

  this.setUser = function(user) {
    this.user = user;
    localStorageService.set('session', this);
  };

  this.setCustomer = function(customer) {
    this.user.customer = customer;
    localStorageService.set('session', this);
  };

  this.isAuthenticated = function() {
    return !!this.sessionId;
  };

  return this;
});
