'use strict';

angular.module('cloudpoxee.controllers').controller('ConnectDashboardCtrl', function($aside, $log, $scope, $modal, $filter, $stateParams, ConnectAPI, connects, $sce, growl, Utilities, $interval) {
  $log.debug('Connect Dashboard controller...');

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }


  $scope.selectedreport = [];
  $scope.tab = 4;
  $scope.refreshTime = 10;
  $scope.rangeTime = 3600000;
  $scope.iframeinstance = $stateParams;
  $scope.connect_instances = connects;
  $scope.reports = [];
  $scope.agents = [];
  $scope.requesreport = {};
  $scope.agentselected = {
    agents: []
  };
  $scope.calls = [];
  $scope.audiourl = {};
  // $scope.agentstatusquantity = [];
  $scope.agentstatusquantity = {};
  $scope.agentsstatuslist = {
    agents: []
  };

  $scope.custom = true;
  $scope.transcribe = {
    transcription: null,
    items: []
  }


  $scope.date_from_to = {
    datefrom: 0,
    dateto: 0
  }
  $scope.routingProfiles = "";
  $scope.routingProfileSelected = "";

//
// $scope.configAlerts ={
//   "dangerfc":"#FF0000",
//   "dangerbc":"#ffd5d5",
//   "warningfc":"#5C3C00",
//   "warningbc":"#fff4b6",
//   "duration_warning": 300,
//   "duration_danger": 3600,
//   "acw_warning":20 ,
//   "acw_danger":25 ,
//   "bt_warning":45 ,
//   "bt_danger":60 ,
//   "mc_warning":3 ,
//   "mc_danger": 4,
//   "hc_warning":30 ,
//   "hc_danger":20 ,
//   "aq_warning":10 ,
//   "aq_danger":5 ,
//   "aa_warning":5 ,
//   "aa_danger":2 ,
//   "aoc_warning":0 ,
//   "aoc_danger": 0,
//   "ana_warning":0 ,
//   "ana_danger": 0,
//   "aacw_warning":0 ,
//   "aacw_danger": 0,
//   "ae_warning":5 ,
//   "ae_danger": 8,
//   "ac_warning":5 ,
//   "ac_danger": 10,
//   "aht_warning":0 ,
//   "aht_danger": 0,
//   "asa_warning": 0,
//   "asa_danger": 0
//
// };
$scope.configAlertVersion= 3;


$scope.getAlerts = function (){
  ConnectAPI.getConfigAlerts($scope.connect_instances.instanceid).then(function(response){

    if(response.length>0){
      $scope.configAlerts=JSON.parse(response[0].config);
      $scope.ConfigAlertsID=response[0].id;

    }else{
      $scope.configAlerts ={
        "dangerfc":"#FF0000",
        "dangerbc":"#ffd5d5",
        "warningfc":"#5C3C00",
        "warningbc":"#fff4b6",
        "duration_warning": 300,
        "duration_danger": 3600,
        "acw_warning":20 ,
        "acw_danger":25 ,
        "bt_warning":45 ,
        "bt_danger":60 ,
        "mc_warning":3 ,
        "mc_danger": 4,
        "hc_warning":30 ,
        "hc_danger":20 ,
        "aq_warning":10 ,
        "aq_danger":5 ,
        "aa_warning":5 ,
        "aa_danger":2 ,
        "aoc_warning":0 ,
        "aoc_danger": 0,
        "ana_warning":0 ,
        "ana_danger": 0,
        "aacw_warning":0 ,
        "aacw_danger": 0,
        "ae_warning":5 ,
        "ae_danger": 8,
        "ac_warning":5 ,
        "ac_danger": 10,
        "aht_warning":0 ,
        "aht_danger": 0,
        "asa_warning": 0,
        "asa_danger": 0

      };
    }

  }).catch(function(err) {
    growl.error(err);

    $scope.configAlerts ={
      "dangerfc":"#FF0000",
      "dangerbc":"#ffd5d5",
      "warningfc":"#5C3C00",
      "warningbc":"#fff4b6",
      "duration_warning": 300,
      "duration_danger": 3600,
      "acw_warning":20 ,
      "acw_danger":25 ,
      "bt_warning":45 ,
      "bt_danger":60 ,
      "mc_warning":3 ,
      "mc_danger": 4,
      "hc_warning":30 ,
      "hc_danger":20 ,
      "aq_warning":10 ,
      "aq_danger":5 ,
      "aa_warning":5 ,
      "aa_danger":2 ,
      "aoc_warning":0 ,
      "aoc_danger": 0,
      "ana_warning":0 ,
      "ana_danger": 0,
      "aacw_warning":0 ,
      "aacw_danger": 0,
      "ae_warning":5 ,
      "ae_danger": 8,
      "ac_warning":5 ,
      "ac_danger": 10,
      "aht_warning":0 ,
      "aht_danger": 0,
      "asa_warning": 0,
      "asa_danger": 0

    };
  })
}

$scope.getAlerts();


  $scope.getRoutingProfiles = function() {
    ConnectAPI.getRoutingProfiles($scope.connect_instances.instanceid).then(function(response) {
      $scope.routingProfiles = response;

      $scope.routingProfileSelected = $scope.routingProfiles[0].routing_profile;


      if($('#select2-chosen-2')[0] != undefined){

        $('#select2-chosen-2')[0].innerText = $scope.routingProfileSelected;

      }
      if ($('.select2-choice')[0] != undefined) {
        $('.select2-choice')[0].innerText=$scope.routingProfileSelected;
      }
      $scope.refreshRealtime();

    });
  }




  $scope.chargedatepicker = function() {
    setTimeout(function() {
      var start = moment().set({
        'hour': 0,
        'minute': 0,
        'second': 0,
        'milisecond': 0
      });
      var end = moment();

      function cb(start, end) {
        $('#reportrange span').html(start.format('MM/DD/YYYY HH:mm:ss') + ' - ' + end.format('MM/DD/YYYY HH:mm:ss'));

        $scope.date_from_to.datefrom = start.format('x');
        $scope.date_from_to.dateto = end.format('x');
        $scope.changedate($scope.tab);
      }

      $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        "showDropdowns": true,
        "timePicker": true,
        "timePicker24Hour": true,
        "timePickerSeconds": true,
        "opens": "left",
        "alwaysShowCalendars": true,
        ranges: {
          'Today': [moment().set({
            'hour': 0,
            'minute': 0,
            'second': 0,
            'milisecond': 0
          }), moment()],
          'Yesterday': [moment().subtract(1, 'days').set({
            'hour': 0,
            'minute': 0,
            'second': 0,
            'milisecond': 0
          }), moment().subtract(1, 'days').set({
            'hour': 23,
            'minute': 59,
            'second': 59,
            'milisecond': 999
          })],
          'Last 7 Days': [moment().subtract(6, 'days').set({
            'hour': 0,
            'minute': 0,
            'second': 0,
            'milisecond': 0
          }), moment()],
          'Last 30 Days': [moment().subtract(29, 'days').set({
            'hour': 0,
            'minute': 0,
            'second': 0,
            'milisecond': 0
          }), moment()],
          'This Month': [moment().startOf('month').set({
            'hour': 0,
            'minute': 0,
            'second': 0,
            'milisecond': 0
          }), moment().endOf('month').set({
            'hour': 23,
            'minute': 59,
            'second': 59,
            'milisecond': 999
          })],
          'Last Month': [moment().subtract(1, 'month').startOf('month').set({
            'hour': 0,
            'minute': 0,
            'second': 0,
            'milisecond': 0
          }), moment().subtract(1, 'month').endOf('month').set({
            'hour': 23,
            'minute': 59,
            'second': 59,
            'milisecond': 999
          })]
        }
      }, cb);

      cb(start, end)
    }, 100);
  }

  $scope.chargereports = function() {

    ConnectAPI.getListReports($scope.connect_instances.instanceid).then(function(response) {
      $scope.reports = response;

      $log.debug(response);
    });
  }

  $scope.selectreport = function(index, report) {
    Utilities.loading(true);
    $scope.showloading();

    if (index != null) {
      $scope.datareport = [];
      $scope.datacolumns = [];
      $scope.datavales = [];
      $scope.selectedreport = report;
      $scope.selectedreport.index = index;
      $('.report-item').removeClass('selected-li');
      $('#' + $scope.selectedreport.id).addClass('selected-li');
      var datefrom = Math.round($scope.date_from_to.datefrom / 1000);
      var dateto = Math.round($scope.date_from_to.dateto / 1000);

      var request = {
        "instanceid": $scope.connect_instances.instanceid,
        "datefrom": datefrom.toString(),
        "dateto": dateto.toString()
      };
      //  $('#iframereport').attr("src", $scope.selectedreport.url.replace("$date_from", datefrom).replace("$date_to", dateto));
      ConnectAPI.executeReport($scope.selectedreport.id, request).then(function(response) {
        if (response[0] && Object.keys(response[0]).length > 0) {


          $scope.datareport = response;
          $scope.datacolumns = Object.keys($scope.datareport[0]);
          $scope.datavales = Object.values($scope.datareport)

        } else {
          $scope.datacolumns = ["DATA_NOT_FOUND"];
        }
        Utilities.loading(false);
        $scope.hiddenloading();
      }).catch(function(err) {
        Utilities.loading(false);
        $scope.hiddenloading();
        growl.error(err);

      })
    } else {
      Utilities.loading(false);
      $scope.hiddenloading();
      // growl.error("Please select a report");
    }
  }


  $scope.showloading = function() {
    $('.loading-central').removeClass("hidden");
  }

  $scope.hiddenloading = function() {
    $('.loading-central').addClass("hidden");
  }

  $scope.changedate = function(tab) {
    switch (tab) {
      case 0:
        $scope.chargedashboard();
        break;
      case 1:
        $scope.selectreport($scope.selectedreport.index, $scope.selectedreport);
        break;
      case 2:
        $scope.getCalls();
        break;
    }
  }

  $scope.chargeagents = function() {
    ConnectAPI.getListAgents($scope.connect_instances.instanceid).then(function(response) {
      $scope.agents = response;
      $log.debug(response);
    });
  }

  $scope.getCalls = function() {

    $scope.changecolors();
    if ($scope.agentselected.agents.length) {

      Utilities.loading(true);
      $scope.requesreport.agentarn = $scope.agentselected.agents;
      $scope.requesreport.datefrom = $scope.date_from_to.datefrom;
      $scope.requesreport.dateto = $scope.date_from_to.dateto;
      // $scope.requesreport.datefrom = new Date($('#datetimepicker_from').val()).getTime();
      // $scope.requesreport.dateto = new Date($('#datetimepicker_to').val()).getTime();
      $scope.requesreport.instanceid = $scope.connect_instances.instanceid;
      ConnectAPI.getAgentCalls($scope.requesreport).then(function(response) {
        $scope.calls = response;
        $log.debug(response);
      });
      Utilities.loading(false);
    } else {
      $scope.calls = [];
    }
  }

  $scope.changecolors = function() {
    $('input:not(:checked)').parent().parent().removeClass("selected-li");
    $('input:checked').parent().parent().addClass("selected-li");
    $('.report-item').removeClass('selected-li');
    $('#' + $scope.selectedreport.id).addClass('selected-li');
  }

  $scope.playcall = function() {
    var contact_id = this.row.contact_id;
    ConnectAPI.getUrlSigned(contact_id).then(function(response) {
      Utilities.loading(true);
      $('#' + contact_id + '> button').remove()
      $('#' + contact_id).append('<audio controls><source src="' + $scope.trustSrc(response) + '" type="audio/wav"> Your browser does not support the audio element. </audio>')
      $log.debug(response);
      Utilities.loading(false);
    });
  }

  $scope.checkAll = function() {
    $scope.agentselected.agents = $scope.agents.map(function(item) {
      return item.agent_arn;
    });
    $scope.getCalls();
    $('.list-group-item').addClass('selected-li');
  };

  $scope.uncheckAll = function() {
    $scope.agentselected.agents = [];
    $scope.getCalls();
    $('.list-group-item').removeClass('selected-li');
  };

  $scope.chargeastatusagents = function() {
    if ($scope.agentsstatuslist.agents.length < 1) refreshAgents();

    intervals.push($interval(function() {
      ConnectAPI.getLastAgentsStatus($scope.connect_instances.instanceid).then(function(response) {
        ConnectAPI.getAgentsStatus($scope.connect_instances.instanceid).then(function(response) {

          // $scope.agentstatusquantity = response;

          for (var i = 0; i < response.length; i++) {

             $scope.agentstatusquantity[response[i].agentstatus] = response[i].quantity;
          }

          $log.debug(response);
        });

        for (var i = 0; i < $scope.agentsstatuslist.agents.length; i++) {
          var index =  response.findIndex(function (x) {
  return x.Agent_Name === $scope.agentsstatuslist.agents[i].Agent_Name;
});
          if (index != -1) {

            $scope.agentsstatuslist.agents[i].Agent_Status = response[index].Agent_Status;
            $scope.agentsstatuslist.agents[i].maxduration = response[index].maxduration;
            $scope.agentsstatuslist.agents[i].minduration = response[index].minduration;
            $scope.agentsstatuslist.agents[i].callquantity = response[index].callquantity;
            $scope.agentsstatuslist.agents[i].timeoncall = response[index].timeoncall;
            $scope.agentsstatuslist.agents[i].maxtimeonhold = response[index].maxtimeonhold;
            $scope.agentsstatuslist.agents[i].sumtimeonhold = response[index].sumtimeonhold;
          }
        }
        for (var i = 0; i < response.length; i++) {
          var idx = response.findIndex(function (x) {
  return x.Agent_Name === $scope.agentsstatuslist.agents[i].Agent_Name;
});
           // findObjectByKey($scope.agentsstatuslist.agents, response[i].Agent_Name);
          if (idx == -1) {
            $scope.agentsstatuslist.agents.push(response[i])
          }
        }
        $log.debug(response);
      });
    }, 10 * 1000))
  }

  function findObjectByKey(array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].Agent_Name === value) {
        return array[i];
      }
    }
    return null;
  }

  function refreshAgents() {
    ConnectAPI.getAgentsStatus($scope.connect_instances.instanceid).then(function(response) {

      // $scope.agentstatusquantity = response;
      for (var i = 0; i < response.length; i++) {

         $scope.agentstatusquantity[response[i].agentstatus] = response[i].quantity;
      }
      $log.debug(response);
    });
    ConnectAPI.getLastAgentsStatus($scope.connect_instances.instanceid).then(function(response) {

      $scope.agentsstatuslist.agents = response;

      $log.debug(response);
    });
  }

  $scope.showagentdetail = function() {
    $("a[id='" + this.agent.Agent_Name + "']").popover({
      template: '<div class="popover popover-ch-agentdatail"><div class="arrow arrow-ch-agentdetail"></div><div class="popover-inner"><div class="popover-content"></div></div></div>',
      html: true,
      content: '<p class="">MAX CALL DURATION: ' + this.agent.maxduration + '</p><p class="">MIN CALL DURATION: ' + this.agent.minduration + '</p><p class="">CALL QUANTITY: ' + this.agent.callquantity + '</p><p class="">TIME ON CALL: ' + this.agent.timeoncall + '</p><p class="">TIME ON ACW: ' + this.agent.timeonacw + '</p><p class="">MAX TIME ON HOLD: ' + this.agent.maxtimeonhold + '</p><p class="">SUM TIME ON HOLD: ' + this.agent.sumtimeonhold + '</p>'
    });
    $("a[id='" + this.agent.Agent_Name + "']").popover('show')
  }

  $scope.hideagentdetail = function() {
    $("a[id='" + this.agent.Agent_Name + "']").popover('destroy');
  }

  $scope.gettranscribe = function(contact_id) {
    ConnectAPI.getTranscribe(contact_id).then(function(response) {
      $scope.transcribe.transcription = response.transcription;
      $scope.transcribe.items = response.items;
    });
    showmodal();
  }

  function showmodal() {
    document.getElementById('myModal').style.display = "block";
    window.onclick = function(event) {
      if (event.target == document.getElementById('myModal')) {
        $scope.closemodal();
      }
    }
  }

  $scope.closemodal = function() {
    document.getElementById('myModal').style.display = "none";
    $scope.transcribe = {
      transcription: null,
      items: []
    }
  }

  $scope.$on('connect_dashboard:tabChange', function(evt, tab) {
    $scope.tab = tab;
  });

  // INTERVAL -----------------------------------------------------------------------------------------------------------------------------

  $scope.$on('$destroy', function() {
    $scope.changetab();

  });

  var intervals = [];
  $scope.changetab = function() {
    // $('.loading-central').removeClass("hidden");
    while (intervals.length) {
      $interval.cancel(intervals.pop());
    }
  }

  // DASHBOARD -----------------------------------------------------------------------------------------------------------------------------

  const DASHVERSION = 'v0a'
  $scope.dashboard = [];

  function ini_v3(){
    ConnectAPI.getDefaultDashboard($scope.connect_instances.instanceid).then(function(data) {
      if (data == null || data.id == null) {
        empty_v3();

      } else {
        try {
          var config = JSON.parse(data.config)

          if (config.version != null && config.version == DASHVERSION){
            $scope.dashboard = config.dash;
            refreshDash_v3();
            intervals.push($interval(function() {
              refreshDash_v3();
            }, $scope.refreshTime * 1000));
          } else {
            growl.error('The dashboard has bean updated');
            console.log('wrong version', config)
            empty_v3();
          }
        } catch(err){
          growl.error('Fail to parse your default dashboard configuration');
          console.log('getDefaultDashboard', err)

          empty_v3();
        }

      }

    }).catch(function(err) {
      console.log(err);
      empty_v3();
      growl.error('Fail to get your default dashboard');
    })
  }

  $scope.chartoptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          min: 0
        }
      }]
    }
  }

  function empty_v3(){

    $scope.dashboard = [];
    $scope.dashboard.push(

      	{"order":0,"title":"Max queue size","type":"line","config":{"source":{"id":null,"name":"QueueSize---Queue-BasicQueue","api":"CloudWatchSynchronizer","parameters":["name","statistics","startTime","endTime","period"],"type":"cw","object":{"namespace":"AWS/Connect","metricName":"QueueSize","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"Queue"},{"name":"QueueName","value":"BasicQueue"}]}},"statistics":"Maximum","period":"60","color":"#803690"},"dash":{"request":{"namespace":"AWS/Connect","metricName":"QueueSize","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"Queue"},{"name":"QueueName","value":"BasicQueue"}],"statistics":"Maximum","period":"60","id":"chart_0"},"source":"cw","params":["statistics","startTime","endTime","period"]},"id":"chart_0","color":["#803690"],"maximize":0},
      	{"order":1,"type":"line","config":{"color":"#00ADF9","source":{"id":null,"name":"LongestQueueWaitTime---Queue-BasicQueue","api":"CloudWatchSynchronizer","parameters":["name","statistics","startTime","endTime","period"],"type":"cw","object":{"namespace":"AWS/Connect","metricName":"LongestQueueWaitTime","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"Queue"},{"name":"QueueName","value":"BasicQueue"}]}},"statistics":"Maximum","period":"300"},"title":"Longest Queue Wait","dash":{"request":{"namespace":"AWS/Connect","metricName":"LongestQueueWaitTime","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"Queue"},{"name":"QueueName","value":"BasicQueue"}],"statistics":"Maximum","period":"300","id":"chart_1"},"source":"cw","params":["statistics","startTime","endTime","period"]},"id":"chart_1","color":["#00ADF9"],"maximize":0},
      	{"order":2,"type":"pie","config":{"source":{"id":null,"name":"CallsPerInterval---VoiceCalls","api":"CloudWatchSynchronizer","parameters":["name","statistics","startTime","endTime","period"],"type":"cw","object":{"namespace":"AWS/Connect","metricName":"CallsPerInterval","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}]}},"statistics":"Maximum","period":"300","color":"#803690"},"title":"Calls Per Interval","dash":{"request":{"namespace":"AWS/Connect","metricName":"CallsPerInterval","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}],"statistics":"Maximum","period":"300","id":"chart_2"},"source":"cw","params":["statistics","startTime","endTime","period"]},"id":"chart_2","color":["#803690"],"maximize":0},
      	{"order":3,"type":"line","config":{"source":{"id":null,"name":"MissedCalls---VoiceCalls","api":"CloudWatchSynchronizer","parameters":["name","statistics","startTime","endTime","period"],"type":"cw","object":{"namespace":"AWS/Connect","metricName":"MissedCalls","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}]}},"statistics":"SampleCount","period":"300","color":"#FDB45C"},"title":"Missed Calls","dash":{"request":{"namespace":"AWS/Connect","metricName":"MissedCalls","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}],"statistics":"SampleCount","period":"300","id":"chart_3"},"source":"cw","params":["statistics","startTime","endTime","period"]},"id":"chart_3","color":["#FDB45C"],"maximize":0},
      	{"order":4,"type":"line","config":{"source":{"id":null,"name":"ConcurrentCallsPercentage---VoiceCalls","api":"CloudWatchSynchronizer","parameters":["name","statistics","startTime","endTime","period"],"type":"cw","object":{"namespace":"AWS/Connect","metricName":"ConcurrentCallsPercentage","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}]}},"statistics":"Maximum","period":"300","color":"#46BFBD"},"title":"Currents Call %","dash":{"request":{"namespace":"AWS/Connect","metricName":"ConcurrentCallsPercentage","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}],"statistics":"Maximum","period":"300","id":"chart_4"},"source":"cw","params":["statistics","startTime","endTime","period"]},"id":"chart_4","color":["#46BFBD"],"maximize":0},
      	{"order":5,"type":"bar","config":{"source":{"id":null,"name":"ConcurrentCalls---VoiceCalls","api":"CloudWatchSynchronizer","parameters":["name","statistics","startTime","endTime","period"],"type":"cw","object":{"namespace":"AWS/Connect","metricName":"ConcurrentCalls","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}]}},"statistics":"Average","color":"#949FB1","period":"300"},"title":"Concurrent Calls","dash":{"request":{"namespace":"AWS/Connect","metricName":"ConcurrentCalls","dimensions":[{"name":"InstanceId","value":$scope.connect_instances.instanceid},{"name":"MetricGroup","value":"VoiceCalls"}],"statistics":"Average","period":"300","id":"chart_5"},"source":"cw","params":["statistics","startTime","endTime","period"]},"id":"chart_5","color":["#949FB1"],"maximize":0},
      	{"order":6},
      	{"order":7},
      	{"order":8}


);
debugger

  refreshDash_v3();
  intervals.push($interval(function() {
    refreshDash_v3();
  }, $scope.refreshTime * 1000));


  }

  $scope.dashboardtab = function() {
    $('.loading-central').addClass("hidden");
    $scope.dashboard = [];
    //ini();
    //test();
    ini_v3();
  }

  function findIndexObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return i;
      }

    }
    return null;
  }

  function refreshDash_v3() {
    var accountId = $scope.connect_instances.arn.split(':')[4];
    var filtered = $scope.dashboard.filter(function(d) {
      return d.id != null && d.dash.source == 'cw';
    });

    var requests = filtered.map(function(obj, index, array) {
      //obj.dash.request.startTime = new Date(new Date().getTime() - obj.dash.time_range).toISOString();
      //obj.dash.request.endTime = new Date().toISOString();
      return obj.dash.request;
    });

    if (requests.length > 0) {
      ConnectAPI.getAllReportValues(accountId, requests, $scope.connect_instances.region, $scope.rangeTime).then(function(data) {
        data.map(function(d, index, array) {
          var idx = findIndexObjectByKey($scope.dashboard, 'id', d.id);
          var labels = []
          var values = []
          var dataset = []
          if (d.timestamps.length > 0) {
            for (var f = 0; f < d.timestamps.length; f++) {
              labels.push(d.timestamps[f].substring(11,16))
              dataset.push(d.values[f])
            }
            values.push(dataset);
          }
          if (values.length>0 && labels.length>0){
            $scope.dashboard[idx].data = values;
            $scope.dashboard[idx].labels = labels;
          }
        })
      }).catch(function(err) {
        console.log(err);
        growl.error('Fail to get metric data from server');
      })
    }
  }

$scope.maximizeReport = function (repo,i){
repo.maximize=1;
for (var r = 0; r < $scope.dashboard.length ; r++) {
 if(r!=i){
   $('#report'+r).addClass('hidden');

 }

}
$('#report'+i).removeClass('col-md-4');
$('#report'+i).addClass('col-md-12');
$('#panelreport'+i).css('height','74vh');
$('#panelbody'+i).css('height','71vh');

}
$scope.minimizeReport = function (repo,i){
repo.maximize=0;
$('#report'+i).removeClass('col-md-12');
$('#report'+i).addClass('col-md-4');
$('#panelreport'+i).css('height','');
$('#panelbody'+i).css('height','200px');

for (var r = 0; r < $scope.dashboard.length ; r++) {
 if(r!=i){
   $('#report'+r).removeClass('hidden');

 }

}


}



  function saveDashboard() {
    ConnectAPI.saveDashboard({
      dash: $scope.dashboard,
      version: DASHVERSION
    }, $scope.connect_instances.instanceid).then(function(data) {
    }).catch(function(err) {
      console.log(err);
      growl.error('Fail to save your dashboard update');
    })
  }

  $scope.available_metrics = [];


  $scope.configChart = function(chartId){
    var innerScope = $scope.$new();
    if ($scope.dashboard[chartId.order]) {
      innerScope.editdash = $scope.dashboard[chartId.order];

    } else {
      innerScope.editdash = {
        order: chartId
      }
    }
    //console.log('editdash',innerScope.editdash)

    var aside;
    if ($scope.available_metrics.length > 0) {
      aside = $aside({
        scope: innerScope,
        container: 'body',
        placement: 'right',
        template: 'views/connect/aside/chartConfig.html',
        backdrop: 'static'
      });
    } else {
      ConnectAPI.reportListAvailableReports($scope.connect_instances.instanceid).then(function(response) {
        $scope.available_metrics = response;
        aside = $aside({
          scope: innerScope,
          container: 'body',
          placement: 'right',
          template: 'views/connect/aside/chartConfig.html',
          backdrop: 'static'
        });
      }).catch(function(err){
        console.log(err)
        growl.error('Fail to get available metrics');
      })
    }

    innerScope.savedash = function(edit){

      console.log('editdash-tosave', edit)
      var metric = JSON.parse(edit.editdash.config.source);

      $scope.dashboard[edit.editdash.order].dash = {};
      $scope.dashboard[edit.editdash.order].dash.request = JSON.parse(metric.object);
      $scope.dashboard[edit.editdash.order].dash.request.statistics = edit.editdash.config.statistics;
      $scope.dashboard[edit.editdash.order].dash.request.period = edit.editdash.config.period;
      $scope.dashboard[edit.editdash.order].dash.request.id = 'chart_'+edit.editdash.order;

      $scope.dashboard[edit.editdash.order].dash.source = 'cw';
      $scope.dashboard[edit.editdash.order].dash.params = metric.parameters;
      //$scope.dashboard[edit.editdash.order].dash.refresh = edit.editdash.config.refresh;
      //$scope.dashboard[edit.editdash.order].dash.time_range = edit.editdash.config.time_range;

      $scope.dashboard[edit.editdash.order].id = 'chart_' + edit.editdash.order;
      $scope.dashboard[edit.editdash.order].type = edit.editdash.type;
      $scope.dashboard[edit.editdash.order].data = [[0]];
      $scope.dashboard[edit.editdash.order].labels = ["Loading"];
      $scope.dashboard[edit.editdash.order].title = edit.editdash.title;

      $scope.dashboard[edit.editdash.order].color = [edit.editdash.config.color];
      $scope.dashboard[edit.editdash.order].maximize = 0;
       //
      aside.hide();


      saveDashboard()
      console.log('editdash-saved', $scope.dashboard)
      refreshDash_v3()
    }
  }

  // REAL TIME TABLES ----------------------------------------------------------------------------------------------------------------------

  $scope.agentsRealtime = {};
  $scope.queuesRealtime = {};
  $scope.getRoutingProfiles();

  $scope.realtime = function() {
    $scope.refreshRealtime();
    // -- Auto refresh
    intervals.push($interval(function() {
      $scope.refreshRealtime();
    }, $scope.refreshTime * 1000));
    $('.loading-central').addClass("hidden");
  }

  // -- Update realtime
  $scope.refreshRealtime = function() {


    if ($scope.routingProfileSelected && $scope.routingProfileSelected != "") {


      ConnectAPI.reportGetAgentsRealtime($scope.connect_instances.instanceid, $scope.routingProfileSelected).then(function(data) {

        $scope.agentsRealtime = data;
      }).catch(function(err) {
        console.error(err);
      })

      ConnectAPI.reportGetQueuesRealtime($scope.connect_instances.instanceid, $scope.routingProfileSelected).then(function(data) {

        $scope.queuesRealtime = data;
      }).catch(function(err) {
        console.error(err);
      })
    }
  }

  $scope.timeCounter = function(valor) {
    var t = parseInt(valor);
    // var days = parseInt(t / 86400);
    // t = t - (days * 86400);
    var hours = parseInt(t / 3600);
    t = t - (hours * 3600);
    var minutes = parseInt(t / 60);
    t = t - (minutes * 60);
    var content = "";
    // if (days)
    //   content += days + "d ";
    if (hours) {
      content += hours + ":" ;
    }
    if(minutes>9){

      content += minutes + ":"  ;

    }else {
      content += "0"+minutes + ":" ;
    }
    if(t > 9){
        content += t ;
    }else{
      content += "0"+t ;
    }
    return content;
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------



  $scope.setRefreshingTime = function(interval) {
    $scope.refreshTime = interval;
    $scope.changetab();

    switch ($scope.tab) {
      case 0:
        $scope.dashboardtab();
        break;
      case 4:
        $scope.realtime();
        break;
      default:
        break;
    }

  }

  $scope.setRangeTime = function(interval) {
    $scope.rangeTime = interval;
    $scope.changetab();

    switch ($scope.tab) {
      case 0:
        $scope.dashboardtab();
        break;
      case 4:
        $scope.realtime();
        break;
      default:
        break;
    }

  }




  $scope.exportReport = function(typefile) {

    if (typefile == 'pdf') {


      $('#table').tableExport({
        type: 'pdf',
        jspdf: {
          orientation: 'l',
          format: 'a3',
          margins: {
            left: 10,
            right: 10,
            top: 20,
            bottom: 20
          },
          autotable: {
            styles: {
              fillColor: 'inherit',
              textColor: 'inherit'
            },
            tableWidth: 'auto'
          }
        }
      });
    } else {

      $('#table').tableExport({
        type: typefile,
        escape: 'false'
      });
    }

  }





  $scope.Alerts = function() {
  var innerScope = $scope.$new();
innerScope.alerts=JSON.parse(JSON.stringify($scope.configAlerts));



var aside;
      aside = $aside({
        scope: innerScope,
        container: 'body',
        placement: 'right',
        templateUrl: 'views/connect/aside/addAlerts.html',
        backdrop: 'static'
      });

      $scope.saveAlerts = function() {

    $scope.configAlerts=JSON.parse(JSON.stringify(innerScope.alerts));



    ConnectAPI.saveConfigAlerts($scope.configAlerts,$scope.connect_instances.instanceid,$scope.configAlertVersion,$scope.ConfigAlertsID).then(function(response){

  


    }).catch(function() {
      growl.error("Alerts cannot be save");

    })

        aside.hide();

      };



  };



});
