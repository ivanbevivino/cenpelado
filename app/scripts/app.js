'use strict';

/**
 * @ngdoc overview
 * @name CloudPoxee
 *
 * Main module of the application.
 */
var cpconfig = null;
var app = angular.module('cloudpoxee', [
  'ui.router', 'ui.gravatar', 'ui.select2', 'ui.bootstrap', 'pascalprecht.translate',  'nzTour','smart-table', 'ui.ace',
  'LocalStorageModule', 'mgcrea.ngStrap', 'ngAnimate', 'ngSanitize', 'ngCookies', 'dndLists', 'ngclipboard',
  'ngTagsInput', 'angular-growl', 'angularMoment', 'cloudpoxee.controllers', 'cloudpoxee.directives',
  'cloudpoxee.filters', 'xeditable', 'exceptionOverwrite', 'angular-svg-round-progressbar','checklist-model','angular.filter','permission', 'permission.ui'
]);

app.config(function($stateProvider, $urlRouterProvider, $translateProvider, $dropdownProvider, $modalProvider,
  gravatarServiceProvider, localStorageServiceProvider,  growlProvider) {






  jQuery.ajax({
    url: 'config.json',
    success: function (response) {
      cpconfig = response;
    },
    async: false
  });

  $urlRouterProvider.otherwise('/dashboard');

  $stateProvider.state('app', {
    url: '',
    templateUrl: 'views/app.html',
    controller: 'ApplicationCtrl',
    abstract: true,
    data: {
      secured: true
    }
  })

  // ------------------------------------------------------------------------
  // Menu Items
  // ------------------------------------------------------------------------
  .state('app.dashboard', {
    url: '/dashboard',
    title: 'Dashboard',
    templateUrl: 'views/dashboard/dashboard.html',
    controller: 'DashboardCtrl',

    data:{
      permissions: {
        only: ['CLOUDPOXEE','ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })







 //EVENTS
  .state('app.events', {
    url: '/eventos',
    title: 'Eventos',
    templateUrl: 'views/eventos/eventos.html',
    controller: 'EventostCtrl',
    resolve:{
      connects: function(ConnectAPI){
        return ConnectAPI.getConnectInstances();
      }
    },
    data:{
      permissions: {
        only: ['CONNECT','ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })





 //CATEGORIES
  .state('app.categories', {
    url: '/categories',
    title: 'Categories',
    templateUrl: 'views/categories/categories.html',
    controller: 'categoriesCtrl',
    resolve:{
      connects: function(ConnectAPI){
        return ConnectAPI.getConnectInstances();
      }
    },
    data:{
      permissions: {
        only: ['CONNECT','ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })







  //CONNECT
  .state('app.connect', {
    url: '/connect',
    title: 'Connect',
    templateUrl: 'views/connect/connect.html',
    controller: 'ConnectCtrl',
    resolve:{
      connects: function(ConnectAPI){
        return ConnectAPI.getConnectInstances();
      }
    },
    data:{
      permissions: {
        only: ['CONNECT','ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })

  //CONNECT
  .state('app.connectDashboard', {
    url: '/connectdashboard/:instanceId',
    title: 'Dashboard',
    templateUrl: 'views/connect/dashboard.html',
    controller: 'ConnectDashboardCtrl',
    resolve:{
      connects: function(ConnectAPI,$stateParams){
        return ConnectAPI.getConnectInstance($stateParams.instanceId);
      }
    },
    params:{
      instanceId:null
    },
    data:{
      permissions: {
        only: ['CONNECT','ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })

  .state('app.welcome', {
    url: '/welcome',
    title: 'Welcome to Centricity',
    templateUrl: 'views/welcome/welcome.html',
    controller: 'WelcomeCtrl'
  })

  .state('app.profile', {
    url: '/profile',
    title: 'Profile',
    templateUrl: 'views/profile/profile.html',
    controller: 'ProfileCtrl',
    data:{
      permissions: {
        only: ['ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })








  .state('app.customers-add', {
    url: '/customers-add',
    title: 'Add Customer',
    templateUrl: 'views/customers/customers.add.html',
    controller: 'CustomersAddCtrl',
    data:{
      permissions: {
        only: ['ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })

  .state('app.customers-management', {
    url: '/customers-management',
    title: 'Customer Management',
    templateUrl: 'views/customers/customers.management.html',
    controller: 'CustomersManagementCtrl',
    resolve: {
      customers: function(CloudAPI) {
        return CloudAPI.getCustomers();
      }
    },
    data:{
      permissions: {
        only: ['ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })

  .state('app.customer-settings', {
    url: '/customer-settings',
    title: 'Customer Settings',
    templateUrl: 'views/customerSettings/customer-settings.html',
    controller: 'CustomerSettingsCtrl',
    resolve: {
      users: function(CloudAPI) {
        return CloudAPI.getUsers();
      },
      credentials: function(CloudAPI) {
        return CloudAPI.getCredentials();
      },
      liquidware: function(CloudAPI) {
        return CloudAPI.getLiquidware();
      }
    }
  })

  .state('app.admin-dashboard', {
    url: '/admin-dashboard',
    title: 'Admin Dashboard',
    templateUrl: 'views/admindashboard/admin.dashboard.html',
    controller: 'AdminDashboardCtrl',
    resolve: {
      events: function(CloudAPI) {
        return CloudAPI.getActivityEvents(10, 0, null);
      },
      /*customers: function(CloudAPI) {
        return CloudAPI.getCustomersData();
      },*/
      stats: function(CloudAPI) {
        return CloudAPI.getMainStats();
      }
    },
    data:{
      permissions: {
        only: ['ROLE_CH_SYSTEM_ADMIN']
      }
    }
  })

  .state('app.credentials', {
    url: '/credentials',
    title: 'Credentials',
    templateUrl: 'views/credentials/manager.html',
    controller: 'CredentialsCtrl',
    resolve: {
      credentials: function(CloudAPI) {
        return CloudAPI.getCredentials();
      }
    }
  })

  .state('app.credentials-new-by-iam-role', {
    url: '/new_by_iam_role',
    title: 'Credentials - New By IAM Role',
    templateUrl: 'views/credentials/new-by-iam-role.html',
    controller: 'CredentialsCreatorCtrl',
    resolve: {
        cloudpoxeeServerCredentials: function(CloudAPI) {
            return CloudAPI.getAccountAndExternalId();
        }
    }
  })

  .state('app.credentials-new-by-accesskey', {
    url: '/new_by_accesskey',
    title: 'Credentials - New By Access Key',
    templateUrl: 'views/credentials/new-by-accesskey.html',
    controller: 'CredentialsCreatorCtrl',
    resolve: {
        cloudpoxeeServerCredentials: function(CloudAPI) {
            return CloudAPI.getAccountAndExternalId();
        }
    }
  })

  .state('app.credentials-new-softlayer', {
      url: '/new_softlayer_credential',
      title: 'Credentials - New SoftLayer Credential',
      templateUrl: 'views/credentials/new-softlayer.html',
      controller: 'CredentialsCreatorCtrl',
      resolve: {
          cloudpoxeeServerCredentials: function(CloudAPI) {
              return CloudAPI.getAccountAndExternalId();
          }
      }
  })

 



  // --------------------------------------------------------------------------
  // Manage admins and regions
  // --------------------------------------------------------------------------
  .state('app.manage-admins', {
    url: '/manage-admins',
    title: 'Manage admins',
    templateUrl: 'views/manageAdmins/manage.admins.html',
    controller: 'ManageAdminsCtrl',
    resolve: {
      admins: function(CloudAPI) {
        return CloudAPI.getAdmins();
      }
    }
  })


  // --------------------------------------------------------------------------
  // Access
  // --------------------------------------------------------------------------
  .state('login', {
    url: '/login',
    title: 'Login',
    templateUrl: 'views/login/login.html',
    controller: 'AccessCtrl',
    data: {
      secured: false
    }
  })

  .state('forgotPassword', {
    url: '/forgotPassword',
    title: 'Forgot Password',
    templateUrl: 'views/forgotpassword/password-forgot.html',
    controller: 'ForgotPasswordCtrl',
    data: {
      secured: false
    }
  })

  .state('changePassword', {
    url: '/changePassword/:token',
    title: 'Change Password',
    templateUrl: 'views/changepassword/password-change.html',
    controller: 'ChangePasswordCtrl',
    data: {
      secured: false
    }
  })

  .state('passwordChanged', {
    url: '/passwordChanged',
    title: 'Password Changed',
    templateUrl: 'views/changepassword/password-changed.html',
    data: {
      secured: false
    }
  })


  .state('accountCreated', {
    url: '/accountCreated',
    title: 'Account Created',
    templateUrl: 'views/access/account-created.html',
    data: {
      secured: false
    }
  });

  // --------------------------------------------------------------------------
  // Gravatar default configuration
  // --------------------------------------------------------------------------
  var url = cpconfig.CONTENT_URL;
  gravatarServiceProvider.defaults = {
    size: 42,
    'default':  'mm'
  };

  // --------------------------------------------------------------------------
  // Translate default configuration
  // --------------------------------------------------------------------------
  $translateProvider.useStaticFilesLoader({
    prefix: 'i18n/locale-',
    suffix: '.json'
  });
  $translateProvider.preferredLanguage('en_US');
  $translateProvider.useLocalStorage();
  $translateProvider.useSanitizeValueStrategy('escaped');

  // --------------------------------------------------------------------------
  // Local storage configuration
  // --------------------------------------------------------------------------
  localStorageServiceProvider.setPrefix('cloudpoxee');

  // --------------------------------------------------------------------------
  // Dropdowns configuration
  // --------------------------------------------------------------------------
  angular.extend($dropdownProvider.defaults, {
    html: true
  });

  // --------------------------------------------------------------------------
  // Google maps configuration
  // --------------------------------------------------------------------------
  // uiGmapGoogleMapApiProvider.configure({
  //     key: 'AIzaSyC-_h6Qj4tqOxENQ5fDKgK1eTvr_UbuTRw',
  //     v: '3.17',
  //     libraries: 'geometry,visualization,places'
  // });

  // --------------------------------------------------------------------------
  // Growl provider configuration
  // --------------------------------------------------------------------------
  growlProvider.globalTimeToLive({
    success: 2000,
    error: 5000,
    warning: 4000,
    info: 5000
  });
  growlProvider.globalPosition('top-right');

  // --------------------------------------------------------------------------
  // Modal configurations
  // --------------------------------------------------------------------------
  angular.extend($modalProvider.defaults, {
    animation: 'am-fade',
    placement: 'center',
    backdrop: 'static'
  });

});

app.run(function($log, $state, $rootScope, $timeout, $location, AuthService, Session, Introduction, growl, USER_ROLES, APPLICATIONS,RedirectAPI,PermPermissionStore,PermRoleStore) {
  $log.debug('CloudPoxee starting up...');

  var permissions = ['WORKSPACES', 'CONNECT', 'SCHEDULER', 'MEDIABOX', 'CLOUDPOXEE']

  PermRoleStore.defineManyRoles({ //TODO mejorar el esquema de persmisos, eliminar el esquema actual e implementar el esquema de ui-roles
      'ROLE_CH_SYSTEM_ADMIN': permissions
    });



  PermPermissionStore.defineManyPermissions(permissions, /*@ngInject*/ function (permissionName) {
    if (AuthService.isAuthorized('ROLE_CH_SYSTEM_ADMIN')) {
      return true
    }
    return (Session.user.customer.apps.indexOf(permissionName) !== -1)
  });

  // Adding to rootScope to handle different styles
  $rootScope.$state = $state;

  // Reload session
  Session.reload();

  // --------------------------------------------------------------------------
  // Navigation utilities
  // --------------------------------------------------------------------------
  var setTitle = function(title) {
    $rootScope.title = (title) ? title + ' | Centricity' : 'CloudPoxee';
  };

  $rootScope.$on('$stateChangeStart', function(event, toState) {

    // Depending if the role is authorized and has a customer set if not redirect to dashboard!
    var authenticated = AuthService.isAuthenticated();

    if (toState.data.secured && !authenticated) { // Secured resource Si no esta logueado
      $log.debug('Not authenticated. Redirect to login...');
      $state.go('login');
      toState = $state.get('login');
      event.preventDefault();
    } else if (toState.url === '/login' && authenticated) { //Si esta logueado y quiere ir a login

      RedirectAPI.homeRedirect();

    } else if (toState.url !== '/profile' && toState.url !== '/customers-add' && toState.url !== '/admin-dashboard' &&
      toState.url !== '/welcome' && toState.url !== '/manage-admins' && toState.url !== '/manage-regions' &&
      toState.url !== '/customers-management' && authenticated && AuthService.isAuthorized([USER_ROLES.CH_SYSTEM_ADMIN]) &&
      Session.user.customer === null) { //Si esta autorizado
      $state.go('app.admin-dashboard');
      toState = $state.get('app.admin-dashboard');
      event.preventDefault();
    }

    // TODO Redirect to this screen always if they do not have any credentials set up and they are a normal user


    $rootScope.$broadcast('menu:close');
    setTitle(toState.title);
  });

  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    if (Session.user && Session.user.showTutorial) {
      $timeout(function() {
        Introduction.startTour(toState.name, true);
      }, 750);
    }
  });

  // ----------------------------------------------------------------------------
  // Root scope events
  // ----------------------------------------------------------------------------
  $rootScope.$on('logout', function() {
    $log.debug('Logging out...');
    Session.destroy();
    $timeout(function() {
      $state.go('login');
    });
  });

  $rootScope.$on('loading', function(event, state) {
    $rootScope.loading = state;
  });

  $rootScope.$on('loadingBlock', function(event, state) {
    $rootScope.loadingBlock = state;
  });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    newrelic.noticeError('Cannot open: ' + toState.title + ' Error: ' + error.config.url + ' with status ' + error.status);
    growl.error('GENERIC_ERROR');
  });
});

// ----------------------------------------------------------------------------
// User Roles
// ----------------------------------------------------------------------------
app.constant('USER_ROLES', {
  CH_SYSTEM_ADMIN: 'ROLE_CH_SYSTEM_ADMIN',
  CH_USER_ADMIN: 'ROLE_CH_USER_ADMIN',
  CH_USER_LIMITED: 'ROLE_CH_LIMITED_ADMIN',
  CH_USER: 'ROLE_CH_USER'
});
// ----------------------------------------------------------------------------
// CUSTOMER APPLICATIONS
// ----------------------------------------------------------------------------
app.constant('APPLICATIONS', {
  CLOUDPOXEE: 'CLOUDPOXEE',
  SCHEDULER: 'SCHEDULER',
  WORKSPACES: 'WORKSPACES',
  CONNECT: 'CONNECT',
  MEDIABOX: 'MEDIABOX'
});


// ----------------------------------------------------------------------------
// CloudPoxee definition
// ----------------------------------------------------------------------------
angular.module('cloudpoxee.services', []);
angular.module('cloudpoxee.filters', []);
angular.module('cloudpoxee.directives', ['cloudpoxee.services']);
angular.module('cloudpoxee.controllers', ['cloudpoxee.services']);

// JS Error Handling for New Relic
angular.module('exceptionOverwrite', []).factory('$exceptionHandler', ['$log', function($log) {
  return function myExceptionHandler(exception, cause) {
    newrelic.noticeError(exception);
    $log.error(exception, cause || null);
  };
}]);
