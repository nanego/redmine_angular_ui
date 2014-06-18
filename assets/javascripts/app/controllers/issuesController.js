var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, SessionService, IssueService, ProjectService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);
});

function getIssueById($scope, issue_id, IssueService) {
  IssueService.getLatestIssues().then(function (data) {
    $scope.issues = data.issues;
    if ($scope.issue === undefined) {
      $scope.issue = $.grep($scope.issues, function (e) {
        return e.id.toString() === issue_id;
      })[0];
    }
    IssueService.getIssueDetails(issue_id).then(function (fullIssue) {
      $scope.issue = fullIssue;
    });
  });
}

app.controller('IssueShowController', function($scope, $routeParams, SessionService, IssueService, ProjectService){
  getIssueById($scope, $routeParams.issue_id, IssueService);
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  // $scope.issue = IssueService.getIssueFromCache($routeParams.issue_id);
  /*
  var issue = new Issue($routeParams.issue_id);
  issue.getDetails().then(function() {
    @scope.issue = issue.details;
  });
  */
});

app.controller('IssueEditController', function($scope, $routeParams, SessionService, IssueService, TrackerService, ProjectService){
  getIssueById($scope, $routeParams.id, IssueService);
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  TrackerService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });

  $scope.saveIssue = function () {
    IssueService.save($scope.issue);
  }
});

function IssueFormController($scope, ProjectService, IssueService, UserService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};
