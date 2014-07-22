var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope){

});

function getIssueById($scope, issue_id, IssueService, $timeout) {
  IssueService.getLatestIssues().then(function (data) {
    $scope.issues = data.issues;
    if ($scope.issue === undefined) {
      $scope.issue = $.grep($scope.issues, function (e) {
        return e.id.toString() === issue_id;
      })[0];
    }
    $scope.delayedRequest = $timeout(function(){
      IssueService.getIssueDetails(issue_id).then(function (fullIssue) {
        $scope.issue = fullIssue;
        // Then, update main array of issues
        var index = findWithAttr($scope.issues, 'id', $scope.issue.id);
        $scope.issues[index] = $scope.issue;
      });
    },500);
  });
}

app.controller('IssueShowController', function($scope, $routeParams, IssueService, hotkeys, $location, $timeout){
  getIssueById($scope, $routeParams.issue_id, IssueService, $timeout);

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

  // $scope.issue = IssueService.getIssueFromCache($routeParams.issue_id);
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
    var responsePromise = IssueService.save($scope.issue);
    responsePromise.success(function(response) {
      var index_of_issue = findWithAttr($scope.issues, 'id', $scope.issue.id);
      $scope.issues[index_of_issue] = $scope.issue;
      $location.path('/issues/'+$scope.issue.id);
    });
  }
});

function IssueFormController($scope, ProjectService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};
