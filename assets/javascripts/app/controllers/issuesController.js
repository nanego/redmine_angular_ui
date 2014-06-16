var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, SessionService, IssueService, ProjectService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);
});

app.controller('IssueShowController', function($scope, $routeParams, SessionService, IssueService, Issue){
  SessionService.getCurrentUser().then(function(data) {
    $scope.user = data.user;
  });
  IssueService.getLatestIssues().then(function(data) {
    $scope.issues = data.issues;
    $scope.issue = $.grep($scope.issues, function(e){ return e.id.toString() === $routeParams.issue_id; })[0];
  });

  // $scope.issue = IssueService.getIssueFromCache($routeParams.issue_id);

  /*
  var issue = new Issue($routeParams.issue_id);
  issue.getDetails().then(function() {
    @scope.issue = issue.details;
  });
  */

  IssueService.getIssueDetails($routeParams.issue_id).then(function (fullIssue) {
    $scope.issue = fullIssue;
  });

});

app.controller('IssueEditController', function($scope, $routeParams, SessionService, IssueService, TrackerService){
  SessionService.getCurrentUser().then(function(data) {
    $scope.user = data.user;
  });
  IssueService.getLatestIssues().then(function(data) {
    $scope.issues = data.issues;
  });
  var issue = $.grep($scope.issues, function(e){ return e.id.toString() === $routeParams.id; })[0];
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
