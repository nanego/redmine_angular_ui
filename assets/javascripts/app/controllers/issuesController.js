var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, IssueService, IssueServiceConfig){

  $scope.current.project = undefined;
  $scope.app.stage = "Demandes"; // TODO Refactor this

  var unbindWatcher = $scope.$watch('app.issues', function() {
    if ($scope.app.issues != undefined) {
      unbindWatcher(); // When you call the $watch() method, AngularJS returns an unbind function that will kill the $watch() listener when its called.
      $scope.current.issues = $scope.app.issues;

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
    $scope.next_issue_loaded = false;
    $scope.next_issues_exist = true;
    IssueService.getNextLatestIssues($scope.current.issues.length, $scope.current.project.id).then(function (response) {
      if(response.data.issues.length < IssueServiceConfig.default_limit){
        $scope.next_issues_exist = false;
      }
      if(response.data.issues.length === IssueServiceConfig.default_limit) {
        $scope.next_issue_loaded = true;
      }
      add_issues_to_main_array($scope, response.data.issues, IssueService);
    });
  }
});

function getIssueById($scope, issue_id, IssueService, $timeout) {
  if ($scope.app.issue === undefined || $scope.app.issue.id!==issue_id) {
    $scope.app.issue = $.grep($scope.current.issues, function (e) {
      return e.id.toString() === issue_id;
    })[0];
  }

  $scope.delayedRequest = $timeout(function(){
    IssueService.getIssueDetails(issue_id).then(function (fullIssue) {
      $scope.app.issue = fullIssue;
      // Then, update main array of issues
      if ($scope.current !== undefined) {
        var index = findWithAttr($scope.current.issues, 'id', $scope.app.issue.id);
        $scope.current.issues[index] = $scope.app.issue;
      };
    });
  },500);
}

app.controller('IssueShowController', function($scope, $routeParams, IssueService, hotkeys, $location, $timeout){
  getIssueById($scope, $routeParams.issue_id, IssueService, $timeout);

  $scope.$watch('app.issue', function() {
    if ($scope.current.issues != undefined) {
      index_of_issue = findWithAttr($scope.current.issues, 'id', $scope.app.issue.id);
      if (index_of_issue > 0){
        $scope.previous_issue = $scope.current.issues[index_of_issue-1]
      }
      if (index_of_issue < $scope.current.issues.length-1){
        $scope.next_issue = $scope.current.issues[index_of_issue+1]
      }else{
        if(index_of_issue === $scope.current.issues.length-1){
          $scope.loading_next_issue = true;
          IssueService.getNextLatestIssues($scope.current.issues.length, $scope.current.project.id).then(function (response) {
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

  // $scope.app.issue = IssueService.getIssueFromCache($routeParams.issue_id);
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
    var responsePromise = IssueService.save($scope.app.issue);
    responsePromise.success(function(response) {
      var index_of_issue = findWithAttr($scope.current.issues, 'id', $scope.app.issue.id);
      $scope.current.issues[index_of_issue] = $scope.app.issue;
      $location.path('/issues/'+$scope.app.issue.id);
    });
  }
});

function IssueFormController($scope, ProjectService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};

function add_issues_to_main_array($scope, new_issues, IssueService) {
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
}
