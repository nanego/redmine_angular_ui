var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, SessionService, IssueService, ProjectService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);
});

app.controller('IssueShowController', function($scope, $routeParams, SessionService, IssueService, ProjectService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);
  IssueService.getLatestIssues().then(function(data) {
    $scope.issue = $.grep($scope.issues, function(e){ return e.id.toString() === $routeParams.issue_id; })[0];
  });
  IssueService.getIssueDetails($routeParams.issue_id).then(function (fullIssue) {
    $scope.issue = fullIssue;
  });

  // $scope.issue = IssueService.getIssueFromCache($routeParams.issue_id);
  /*
  var issue = new Issue($routeParams.issue_id);
  issue.getDetails().then(function() {
    @scope.issue = issue.details;
  });
  */
});

app.controller('IssueEditController', function($scope, $routeParams, SessionService, IssueService, TrackerService, ProjectService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);
  if ($scope.issues != undefined) {
    $scope.issue = $.grep($scope.issues, function (e) {
      return e.id.toString() === $routeParams.id;
    })[0];
  }else{
    IssueService.getIssueDetails($routeParams.id).then(function (fullIssue) {
      $scope.issue = fullIssue;
    });
  };

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
