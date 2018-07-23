'use strict';

angular.module('cloudpoxee.controllers').controller('EventsCtrl',
  function($log, $scope, $rootScope, $filter, $interval, $modal, $timeout, $state, CloudAPI) {

  $log.debug('CloudPoxee dashboard controller...');

 $scope.tab = 'list';


  $scope.activateTab = function(tabName) {
    $scope.tab = tabName;
  };
$scope.itemsByPage=10;


  $scope.dropdownUser = [{
      'text': 'Delete',
      'click': 'deleteEvent()'
    },
    {
      'text': 'Edit',
      'click': 'editEvent()'
    },
   
  ];








    $scope.rowCollection = [
        {firstName: '1', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '2', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},
            {firstName: '3', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '4', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '5', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '6', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '7', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '8', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '9', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '10', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '11', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '12', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '13', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '14', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '15', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '16', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '17', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '18', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '19', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '20', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '21', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '22', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '23', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '24', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

    {firstName: '25', lastName: 'Renard', birthDate: '1987-05-21', balance: 102, email: 'whatever@gmail.com'},
        {firstName: '26', lastName: 'Faivre', birthDate: '1987-04-25', balance: -2323.22, email: 'oufblandou@gmail.com'},

        {firstName: '27', lastName: 'Frere', birthDate: '1955-08-27', balance: 42343, email: 'raymondef@gmail.com'}
    ];





 $scope.addEvents = function() {
 	debugger;
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
      template: '../../views/eventsAdd/addEvents.html'
    });
  };



//  ----- Grid Media events -------

    $scope.currentPage = 0;
    $scope.pageSize = 10;
    // $scope.data = [];
    $scope.numberOfPages=function(){
        return Math.ceil($scope.rowCollection.length/$scope.pageSize);                
    }


    // for (var i=0; i<45; i++) {
    //     $scope.data.push("Item "+i);
    // }




})  // ------ ACA TERMINA EL FUNCTION



.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});