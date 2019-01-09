'use strict';

var app = angular.module('myApp.controllers');

var load_next_issues = function ($rootScope, $scope, IssueService, IssueServiceConfig) {
  if ($rootScope.current.issues !== undefined && $rootScope.current.permanent_mode !== true) {
    $scope.next_issue_loaded = false;
    $scope.next_issues_exist = true;
    $rootScope.current.filters['project_id'] = ($rootScope.current.project ? $rootScope.current.project.id : undefined);
    IssueService.getNextLatestIssues($rootScope.current.issues.length, $rootScope.current.filters).then(function (response) {
      if (response.data.issues.length < IssueServiceConfig.default_limit) {
        $scope.next_issues_exist = false;
      }
      if (response.data.issues.length === IssueServiceConfig.default_limit) {
        $scope.next_issue_loaded = true;
      }
      if (response.data.issues){
        add_issues_to_main_array($rootScope, $scope, response.data.issues, IssueService);
      }
    });
  }
};

function init_search_params($rootScope, $scope, TrackerService, PriorityService){

  var selected_filters = {};
  selected_filters['tracker_id'] = $rootScope.current.filters['tracker_id'];
  selected_filters['priority_id'] = $rootScope.current.filters['priority_id'];

  TrackerService.getTrackers().then(function(trackers) {
    var default_value = {id:'', name:'Tous les trackers'};
    if (!containsObject(default_value, trackers, 'name')) {
      trackers.unshift(default_value);
    }
    $rootScope.trackers = trackers;
    if (selected_filters['tracker_id'] !== undefined && selected_filters['tracker_id'] !== ''){
      $rootScope.tracker = getObjectById(trackers, selected_filters['tracker_id']);
    } else {
      $rootScope.tracker = '';
    }
  });

  PriorityService.getPriorities().then(function(priorities) {
    var default_value = {id:'', name:'Toutes les priorités'};
    if (!containsObject(default_value, priorities, 'name')) {
      console.log("001 -  Add Toutes les priorités");
      priorities.unshift(default_value);
    }
    $rootScope.priorities = priorities;
    if (selected_filters['priority_id'] !== undefined && selected_filters['priority_id'] !== ''){
      $rootScope.priority = getObjectById(priorities, selected_filters['priority_id']);
    } else {
      $rootScope.priority = '';
    }
  });
}

app.controller('IssuesController', function($rootScope, $scope, $location, $http, $q, $filter,
                                            $routeParams, SessionService, IssueService, IssueServiceConfig,
                                            ProjectService, NotificationService, toastr, inScopeFilter, UserService,
                                            inUserScopeFilter, project_nameFilter, TrackerService, PriorityService){

  $rootScope.current.project = undefined;
  $rootScope.current.stage = "Demandes"; // TODO Refactor this
  // $rootScope.current.permanent_mode = undefined;
  $rootScope.current.filters = {};
  // $rootScope.current.filters['projects'] = $routeParams.filter;

  var preloadedDataPromise = getPreloadedData(SessionService, $rootScope, $scope, IssueService, IssueServiceConfig, ProjectService, NotificationService, $q, toastr, $location, $filter, inScopeFilter, inUserScopeFilter);

  var unbindWatcher = $scope.$watch('app.issues', function() {
    if ($scope.app.issues != undefined) {
      unbindWatcher(); // When you call the $watch() method, AngularJS returns an unbind function that will kill the $watch() listener when its called.
      $rootScope.current.issues = project_nameFilter($scope.app.issues, $rootScope.current.filters);  // TODO Remove this filter

      if ($rootScope.current.issues.length < IssueServiceConfig.default_limit){
        $scope.next_issues_exist = false;
      }else{
        $scope.next_issues_exist = true;
      }
      IssueService.get_last_note_by_ids($rootScope.current.issues.map(function(x) {return x.id; })).success(function (response){
        update_array_of_issues_with_last_note($rootScope.current.issues, response.issues);
      });
    }
  });

  $scope.load_next_issues = function() {
    load_next_issues($rootScope, $scope, IssueService, IssueServiceConfig);
  };

  init_search_params($rootScope, $scope, TrackerService, PriorityService);

  $scope.$watch('current.permanent_mode', function () {
    if ($rootScope.current.permanent_mode != undefined &&
      (($rootScope.current.filters['assigned_to_id'] === '!*' && $rootScope.current.permanent_mode === false) ||
      ($rootScope.current.filters['assigned_to_id'] !== '!*' && $rootScope.current.permanent_mode === true))
    ){
      if ($rootScope.current.permanent_mode == true) {
        $rootScope.current.filters['assigned_to_id'] = '!*';
      }else {
        $rootScope.current.filters['assigned_to_id'] = '';
      }
      $location.path('issues/filters').search($rootScope.current.filters);
        // ?project_name='+ $rootScope.current.filters['project_name'] +'&assigned_to_id='+ $rootScope.current.filters['assigned_to_id'] );
    }
  });


       /*
      $rootScope.current.issues = not_assignedFilter($scope.app.issues);
      if ($rootScope.current.issues.length < IssueServiceConfig.default_limit) {

        IssueService.getLatestIssuesWithFilters($rootScope.current.filters).success(function (response) {
          if (response.issues !== undefined && $rootScope.current.permanent_mode == true) {
            add_issues_to_main_array($scope, response.issues, IssueService);
            $rootScope.current.issues = not_assignedFilter($rootScope.current.issues);
          }
        });
      }
    } else {
      $rootScope.current.filters['assigned_to_id'] = undefined;
      $rootScope.current.issues = $scope.app.issues;
    }
    if ($rootScope.current.issues !== undefined) {
      if ($rootScope.current.issues.length < IssueServiceConfig.default_limit) {
        $scope.next_issues_exist = false;
      } else {
        $scope.next_issues_exist = true;
      }
      IssueService.get_last_note_by_ids($rootScope.current.issues.map(function (x) {
        return x.id;
      })).success(function (response) {
        update_array_of_issues_with_last_note($rootScope.current.issues, response.issues);
      });
    }
        */

});

app.controller('IssuesFiltersController', ['$rootScope', '$scope', '$location', '$http', '$q', '$filter', '$routeParams', 'SessionService', 'IssueService', 'IssueServiceConfig', 'ProjectService', 'NotificationService', 'toastr', 'inScopeFilter', 'UserService', 'inUserScopeFilter', 'TrackerService', 'PriorityService',
  function($rootScope, $scope, $location, $http, $q, $filter, $routeParams, SessionService, IssueService, IssueServiceConfig, ProjectService, NotificationService, toastr, inScopeFilter, UserService, inUserScopeFilter, TrackerService, PriorityService){

  $rootScope.current.issues = undefined;
  $rootScope.current.stage = "Demandes"; // TODO Refactor this

  $rootScope.current.filters = $rootScope.current.filters || {};
  $rootScope.current.filters['project_name'] = $routeParams.project_name || "";
  $rootScope.current.filters['assigned_to_id'] = $routeParams.assigned_to_id;
  $rootScope.current.filters['project_id'] = $routeParams.project_id;
  $rootScope.current.filters['tracker_id'] = $routeParams.tracker_id;
  $rootScope.current.filters['priority_id'] = $routeParams.priority_id;

  if ($rootScope.current.filters['assigned_to_id'] != undefined && $rootScope.current.filters['assigned_to_id'].length>0){
    $rootScope.current.permanent_mode = true;
  }

  var preloadedDataPromise = getPreloadedData(SessionService, $rootScope, $scope, IssueService, IssueServiceConfig, ProjectService, NotificationService, $q, toastr, $location, $filter, inScopeFilter, inUserScopeFilter);
  $rootScope.current.project = getProjectById($rootScope, $scope, $rootScope.current.filters['project_id']);

  init_search_params($rootScope, $scope, TrackerService, PriorityService);

  $scope.$watch('current.filters', function() {
    $scope.next_issues_exist = true; // Show loader

    preloadedDataPromise.then(function () {

      if ($rootScope.current.filters['project_id']){
        // console.log('Set current project from id in params');
        $rootScope.current.project = getProjectById($rootScope, $scope, $rootScope.current.filters['project_id']);
      }

    });

  });

  $scope.load_next_issues = function() {
    load_next_issues($rootScope, $scope, IssueService, IssueServiceConfig);
  };

  $scope.$watch('current.permanent_mode', function () {
    if ($rootScope.current.permanent_mode != undefined &&
      (($rootScope.current.filters['assigned_to_id'] === '!*' && $rootScope.current.permanent_mode === false) ||
      ($rootScope.current.filters['assigned_to_id'] !== '!*' && $rootScope.current.permanent_mode === true))
    ){
      if ($rootScope.current.permanent_mode == true) {
        $rootScope.current.filters['assigned_to_id'] = '!*';
      }else {
        $rootScope.current.filters['assigned_to_id'] = '';
      }
      $location.path('issues/filters').search($rootScope.current.filters);
      // ?project_name='+ $rootScope.current.filters['project_name'] +'&assigned_to_id='+ $rootScope.current.filters['assigned_to_id'] );
    }
  });

}]);

function getIssueById($rootScope, $scope, issue_id, IssueService, $timeout) {
  if ($rootScope.current !== undefined && $rootScope.current.issues !== undefined && ($rootScope.current.issue === undefined || $rootScope.current.issue.id!==issue_id)) {
    $rootScope.current.issue = $.grep($rootScope.current.issues, function (e) {
      return e.id.toString() === issue_id;
    })[0];
  }

  $scope.delayedRequest = $timeout(function(){
    IssueService.getIssueDetails(issue_id).then(function (fullIssue) {
      $rootScope.current.issue = fullIssue;
      // Then, update main array of issues
      if ($rootScope.current !== undefined && $rootScope.current.issues !== undefined) {
        var index = findWithAttr($rootScope.current.issues, 'id', $rootScope.current.issue.id);
        $rootScope.current.issues[index] = $rootScope.current.issue;
      }
    });
  },500);
}

app.controller('IssueShowController', function($rootScope, $scope, $routeParams, IssueService, hotkeys, $location, $timeout){
  getIssueById($scope, $routeParams.issue_id, IssueService, $timeout);

  $scope.$watch('current.issue', function() {
    if ($rootScope.current.issues != undefined) {
      var index_of_issue = findWithAttr($rootScope.current.issues, 'id', $rootScope.current.issue.id);
      if (index_of_issue > 0){
        $scope.previous_issue = $rootScope.current.issues[index_of_issue-1]
      }
      if (index_of_issue < $rootScope.current.issues.length-1){
        $scope.next_issue = $rootScope.current.issues[index_of_issue+1]
      }else{
        if(index_of_issue === $rootScope.current.issues.length-1){
          $scope.loading_next_issue = true;
          $rootScope.current.filters = $rootScope.current.filters || {};
          $rootScope.current.filters['project_id'] = ($rootScope.current.project ? $rootScope.current.project.id : undefined);
          IssueService.getNextLatestIssues($rootScope.current.issues.length, $rootScope.current.filters).then(function (response) {
            add_issues_to_main_array($scope, response.data.issues, IssueService);
            if (index_of_issue < $rootScope.current.issues.length-1){
              $scope.next_issue = $rootScope.current.issues[index_of_issue+1]
            }
            $scope.loading_next_issue = false;
          });
        }
      }
    }
  });

  $scope.$on("$destroy", function handler() {
    $timeout.cancel($scope.delayedRequest);
  });

  hotkeys.bindTo($scope)
    .add({
      combo: 'right',
      description: 'Demande suivante',
      callback: function() {
        if($scope.next_issue!=undefined) {
          $location.path('/issues/'+$scope.next_issue.id)
        }
      }
    })
    .add({
      combo: 'left',
      description: 'Demande précédente',
      callback: function() {
        if($scope.previous_issue!=undefined) {
          $location.path('/issues/' + $scope.previous_issue.id)
        }
      }
    });

  // $rootScope.current.issue = IssueService.getIssueFromCache($routeParams.issue_id);
  /*
  var issue = new Issue($routeParams.issue_id);
  issue.getDetails().then(function() {
    @scope.issue = issue.details;
  });
  */
});

app.controller('IssueEditController', function($rootScope, $scope, $routeParams, IssueService, TrackerService,
                                               PriorityService, $location, $timeout){
  getIssueById($scope, $routeParams.id, IssueService, $timeout);

  TrackerService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });

  $scope.saveIssue = function () {
    var responsePromise = IssueService.save($rootScope.current.issue);
    responsePromise.success(function(response) {
      var index_of_issue = findWithAttr($rootScope.current.issues, 'id', $rootScope.current.issue.id);
      $rootScope.current.issues[index_of_issue] = $rootScope.current.issue;
      $location.path('/issues/'+$rootScope.current.issue.id);
    });
  }
});

function IssueFormController($scope, ProjectService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
}
function add_issues_to_main_array($rootScope, $scope, new_issues, IssueService) {
  // Current array
  for (var i = 0; i < new_issues.length; ++i) {
    var issue_in_scope_index = findWithAttr($rootScope.current.issues, 'id', new_issues[i].id);
    if (issue_in_scope_index >= 0) {
      $rootScope.current.issues[issue_in_scope_index] = new_issues[i];
    } else {
      $rootScope.current.issues.push(new_issues[i]);
    }
  }
  if(new_issues){
    IssueService.get_last_note_by_ids(new_issues.map(function(x) {return x.id; })).success(function (response){
      update_array_of_issues_with_last_note($rootScope.current.issues, response.issues);
    });
  }
  // Global array
  for (var i = 0; i < new_issues.length; ++i) {
    var issue_in_scope_index = findWithAttr($scope.app.issues, 'id', new_issues[i].id);
    if (issue_in_scope_index >= 0) {
      $scope.app.issues[issue_in_scope_index] = new_issues[i];
    } else {
      $scope.app.issues.push(new_issues[i]);
    }
  }
}
