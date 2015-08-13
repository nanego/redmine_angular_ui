var app = angular.module('myApp.controllers');

var load_next_issues = function ($scope, IssueService, IssueServiceConfig) {
  if ($scope.current.issues !== undefined && $scope.current.permanent_mode !== true) {
    $scope.next_issue_loaded = false;
    $scope.next_issues_exist = true;
    $scope.current.filters['project_id'] = ($scope.current.project !== undefined ? $scope.current.project.id : undefined);
    IssueService.getNextLatestIssues($scope.current.issues.length, $scope.current.filters).then(function (response) {
      if (response.data.issues.length < IssueServiceConfig.default_limit) {
        $scope.next_issues_exist = false;
      }
      if (response.data.issues.length === IssueServiceConfig.default_limit) {
        $scope.next_issue_loaded = true;
      }
      add_issues_to_main_array($scope, response.data.issues, IssueService);
    });
  }
};

app.controller('IssuesController', function($scope, $location, $routeParams, IssueService, IssueServiceConfig, not_assignedFilter, project_nameFilter){

  $scope.current.project = undefined;
  $scope.current.stage = "Demandes"; // TODO Refactor this
  // $scope.current.permanent_mode = undefined;
  $scope.current.filters = {};
  // $scope.current.filters['projects'] = $routeParams.filter;

  var unbindWatcher = $scope.$watch('app.issues', function() {
    if ($scope.app.issues != undefined) {
      unbindWatcher(); // When you call the $watch() method, AngularJS returns an unbind function that will kill the $watch() listener when its called.
      $scope.current.issues = project_nameFilter($scope.app.issues, $scope.current.filters);

      if ($scope.current.issues.length < IssueServiceConfig.default_limit){
        $scope.next_issues_exist = false;
      }else{
        $scope.next_issues_exist = true;
      }
      IssueService.get_last_note_by_ids($scope.current.issues.map(function(x) {return x.id; })).success(function (response){
        update_array_of_issues_with_last_note($scope.current.issues, response.issues);
      });
    }
  });

  $scope.load_next_issues = function() {
    load_next_issues($scope, IssueService, IssueServiceConfig);
  };

  $scope.$watch('current.permanent_mode', function () {
    if ($scope.current.permanent_mode != undefined &&
      (($scope.current.filters['assigned_to_id'] === '!*' && $scope.current.permanent_mode === false) ||
      ($scope.current.filters['assigned_to_id'] !== '!*' && $scope.current.permanent_mode === true))
    ){
      if ($scope.current.permanent_mode == true) {
        $scope.current.filters['assigned_to_id'] = '!*';
      }else {
        $scope.current.filters['assigned_to_id'] = '';
      }
      $location.path('issues/filters').search($scope.current.filters);
        // ?project_name='+ $scope.current.filters['project_name'] +'&assigned_to_id='+ $scope.current.filters['assigned_to_id'] );
    }
  });


       /*
      $scope.current.issues = not_assignedFilter($scope.app.issues);
      if ($scope.current.issues.length < IssueServiceConfig.default_limit) {

        IssueService.getLatestIssuesWithFilters($scope.current.filters).success(function (response) {
          if (response.issues !== undefined && $scope.current.permanent_mode == true) {
            add_issues_to_main_array($scope, response.issues, IssueService);
            $scope.current.issues = not_assignedFilter($scope.current.issues);
          }
        });
      }
    } else {
      $scope.current.filters['assigned_to_id'] = undefined;
      $scope.current.issues = $scope.app.issues;
    }
    if ($scope.current.issues !== undefined) {
      if ($scope.current.issues.length < IssueServiceConfig.default_limit) {
        $scope.next_issues_exist = false;
      } else {
        $scope.next_issues_exist = true;
      }
      IssueService.get_last_note_by_ids($scope.current.issues.map(function (x) {
        return x.id;
      })).success(function (response) {
        update_array_of_issues_with_last_note($scope.current.issues, response.issues);
      });
    }
        */

});

app.controller('IssuesFiltersController', function($scope, $location, $filter, $routeParams, IssueService, IssueServiceConfig, ProjectService){

  $scope.current.issues = undefined;
  $scope.current.stage = "Demandes"; // TODO Refactor this

  $scope.current.filters = $scope.current.filters || {};
  $scope.current.filters['project_name'] = $routeParams.project_name || "";
  $scope.current.filters['assigned_to_id'] = $routeParams.assigned_to_id;
  $scope.current.filters['project_id'] = $routeParams.project_id;

  if ($scope.current.filters['assigned_to_id'] != undefined && $scope.current.filters['assigned_to_id'].length>0){
    $scope.current.permanent_mode = true;
  }

  $scope.$watch('current.filters', function() {
    $scope.next_issues_exist = true; // Show loader

    ProjectService.getAllProjects().then(function (data) {

      if ($scope.current.filters['project_name'].length > 0){
        var selectedProjects = $filter('regex')(data.projects, 'name', $scope.current.filters['project_name']);
        var projects_ids = selectedProjects.map(function(x) {return x.id;});
        $scope.current.filters['projects_ids'] = projects_ids;
        // console.log('projets correspondants :' + JSON.stringify($scope.current.filters['projects_ids'], null, 2));
      }

      if ($scope.current.filters['project_id'] != undefined && $scope.current.filters['project_id'].length>0){
        $scope.current.project = getProjectById($scope, $scope.current.filters['project_id'])
      }

      IssueService.getLatestIssuesWithFilters($scope.current.filters).then(function (response) {
        $scope.current.issues = response.data.issues;
        IssueService.get_last_note_by_ids($scope.current.issues.map(function(x) {return x.id; })).success(function (response){
          update_array_of_issues_with_last_note($scope.current.issues, response.issues);
        });
        if ($scope.current.issues.length < IssueServiceConfig.default_limit){
          $scope.next_issues_exist = false;
        }else{
          $scope.next_issues_exist = true;
        }
      });

    });

  });

  $scope.load_next_issues = function() {
    load_next_issues($scope, IssueService, IssueServiceConfig);
  };

  $scope.$watch('current.permanent_mode', function () {
    if ($scope.current.permanent_mode != undefined &&
      (($scope.current.filters['assigned_to_id'] === '!*' && $scope.current.permanent_mode === false) ||
      ($scope.current.filters['assigned_to_id'] !== '!*' && $scope.current.permanent_mode === true))
    ){
      if ($scope.current.permanent_mode == true) {
        $scope.current.filters['assigned_to_id'] = '!*';
      }else {
        $scope.current.filters['assigned_to_id'] = '';
      }
      $location.path('issues/filters').search($scope.current.filters);
      // ?project_name='+ $scope.current.filters['project_name'] +'&assigned_to_id='+ $scope.current.filters['assigned_to_id'] );
    }
  });

});

function getIssueById($scope, issue_id, IssueService, $timeout) {
  if ($scope.current !== undefined && $scope.current.issues !== undefined && ($scope.current.issue === undefined || $scope.current.issue.id!==issue_id)) {
    $scope.current.issue = $.grep($scope.current.issues, function (e) {
      return e.id.toString() === issue_id;
    })[0];
  }

  $scope.delayedRequest = $timeout(function(){
    IssueService.getIssueDetails(issue_id).then(function (fullIssue) {
      $scope.current.issue = fullIssue;
      // Then, update main array of issues
      if ($scope.current !== undefined && $scope.current.issues !== undefined) {
        var index = findWithAttr($scope.current.issues, 'id', $scope.current.issue.id);
        $scope.current.issues[index] = $scope.current.issue;
      };
    });
  },500);
}

app.controller('IssueShowController', function($scope, $routeParams, IssueService, hotkeys, $location, $timeout){
  getIssueById($scope, $routeParams.issue_id, IssueService, $timeout);

  $scope.$watch('current.issue', function() {
    if ($scope.current.issues != undefined) {
      index_of_issue = findWithAttr($scope.current.issues, 'id', $scope.current.issue.id);
      if (index_of_issue > 0){
        $scope.previous_issue = $scope.current.issues[index_of_issue-1]
      }
      if (index_of_issue < $scope.current.issues.length-1){
        $scope.next_issue = $scope.current.issues[index_of_issue+1]
      }else{
        if(index_of_issue === $scope.current.issues.length-1){
          $scope.loading_next_issue = true;
          $scope.current.filters = $scope.current.filters || {};
          $scope.current.filters['project_id'] = ($scope.current.project !== undefined ? $scope.current.project.id : undefined);
          IssueService.getNextLatestIssues($scope.current.issues.length, $scope.current.filters).then(function (response) {
            add_issues_to_main_array($scope, response.data.issues, IssueService);
            if (index_of_issue < $scope.current.issues.length-1){
              $scope.next_issue = $scope.current.issues[index_of_issue+1]
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

  // $scope.current.issue = IssueService.getIssueFromCache($routeParams.issue_id);
  /*
  var issue = new Issue($routeParams.issue_id);
  issue.getDetails().then(function() {
    @scope.issue = issue.details;
  });
  */
});

app.controller('IssueEditController', function($scope, $routeParams, IssueService, TrackerService, $location, $timeout){
  getIssueById($scope, $routeParams.id, IssueService, $timeout);

  TrackerService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });

  $scope.saveIssue = function () {
    var responsePromise = IssueService.save($scope.current.issue);
    responsePromise.success(function(response) {
      var index_of_issue = findWithAttr($scope.current.issues, 'id', $scope.current.issue.id);
      $scope.current.issues[index_of_issue] = $scope.current.issue;
      $location.path('/issues/'+$scope.current.issue.id);
    });
  }
});

function IssueFormController($scope, ProjectService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};

function add_issues_to_main_array($scope, new_issues, IssueService) {
  // Current array
  for (var i = 0; i < new_issues.length; ++i) {
    var issue_in_scope_index = findWithAttr($scope.current.issues, 'id', new_issues[i].id);
    if (issue_in_scope_index >= 0) {
      $scope.current.issues[issue_in_scope_index] = new_issues[i];
    } else {
      $scope.current.issues.push(new_issues[i]);
    }
  }
  IssueService.get_last_note_by_ids(new_issues.map(function(x) {return x.id; })).success(function (response){
    update_array_of_issues_with_last_note($scope.current.issues, response.issues);
  });
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
