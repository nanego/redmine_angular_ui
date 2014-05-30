var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, session, issues){
  $scope.user = session.user;
  $scope.issues = issues.issues;
});

app.controller('IssueShowController', function($scope, $routeParams, session, issues, IssueService){
  $scope.user = session.user;

  // $scope.issue = IssueService.getIssueFromCache($routeParams.issue_id);
  $scope.issue = $.grep(issues.issues, function(e){ return e.id.toString() === $routeParams.issue_id; })[0];

  IssueService.getIssueDetails($routeParams.issue_id).then(function (fullIssue) {
    $scope.issue = fullIssue;
  });

  /*
   $scope.issues = issues.issues;
   var issue = $.grep(issues.issues, function(e){ return e.id.toString() === $routeParams.issue_id; })[0];
   $scope.issue = issue;
   IssueService.getIssueDetails($routeParams.issue_id).then(function(data) {
   $scope.issue_complete = data;
   });
   */
});

app.controller('IssueEditController', function($scope, $routeParams, session, issues, TrackerService){
  $scope.user = session.user;
  $scope.issues = issues.issues;
  var issue = $.grep(issues.issues, function(e){ return e.id.toString() === $routeParams.id; })[0];
  $scope.issue = issue;

  TrackerService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });

  $scope.setTracker = function(tracker) {
    $scope.issue.tracker = tracker;
  };
});

function IssueFormController($scope, ProjectService, IssueService, UserService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};
