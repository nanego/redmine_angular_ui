var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, SessionService, IssueService, ProjectService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  new Firehose.Consumer({
    message: function(msg){
      IssueService.refreshLatestIssues().then(function (data) {
        $scope.issues = data.issues;
      });
    },
    connected: function(){
      console.log("Great Scotts!! We're connected!");
    },
    disconnected: function(){
      console.log("Well shucks, we're not connected anymore");
    },
    error: function(){
      console.log("Well then, something went horribly wrong.");
    },
    // Note that we do NOT specify a protocol here because we don't
    // know that yet.
    uri: '//localhost:7474/issues/new'
  }).connect();
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

app.controller('IssueShowController', function($scope, $routeParams, SessionService, IssueService, ProjectService, hotkeys, $location){
  getIssueById($scope, $routeParams.issue_id, IssueService);
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  $scope.$watch('issue', function() {
    if ($scope.issues != undefined) {
      index_of_issue = findWithAttr($scope.issues, 'id', $scope.issue.id);
      if (index_of_issue > 0){
        $scope.previous_issue = $scope.issues[index_of_issue-1]
      }
      if (index_of_issue < $scope.issues.length-1){
        $scope.next_issue = $scope.issues[index_of_issue+1]
      }
    }
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

  // $scope.issue = IssueService.getIssueFromCache($routeParams.issue_id);
  /*
  var issue = new Issue($routeParams.issue_id);
  issue.getDetails().then(function() {
    @scope.issue = issue.details;
  });
  */
});

app.controller('IssueEditController', function($scope, $routeParams, SessionService, IssueService, TrackerService, ProjectService, $location){
  getIssueById($scope, $routeParams.id, IssueService);
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  TrackerService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });

  $scope.saveIssue = function () {
    var responsePromise = IssueService.save($scope.issue);
    responsePromise.success(function(response) {
      var index_of_issue = findWithAttr($scope.issues, 'id', $scope.issue.id);
      $scope.issues[index_of_issue] = $scope.issue;
      $location.path('/issues/'+$scope.issue.id);
    });
  }
});

function IssueFormController($scope, ProjectService, IssueService, UserService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};
