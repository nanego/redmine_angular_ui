var app = angular.module('myApp.controllers');

app.controller('IssuesController', function($scope, IssueService){
  $scope.load_next_issues = function() {
    $scope.next_issue_loaded = false;
    IssueService.getNextLatestIssues($scope.app.issues.length).then(function (response) {
      add_issues_to_main_array($scope, response.data.issues);
      $scope.next_issue_loaded = true;
    });
  }
});

function getIssueById($scope, issue_id, IssueService, $timeout) {
  IssueService.getLatestIssues().then(function (response) {
    // $scope.app.issues = data.issues;
    if ($scope.app.issue === undefined || $scope.app.issue.id!==issue_id) {
      $scope.app.issue = $.grep($scope.app.issues, function (e) {
        return e.id.toString() === issue_id;
      })[0];
    }
    $scope.delayedRequest = $timeout(function(){
      IssueService.getIssueDetails(issue_id).then(function (fullIssue) {
        $scope.app.issue = fullIssue;
        // Then, update main array of issues
        var index = findWithAttr($scope.app.issues, 'id', $scope.app.issue.id);
        $scope.app.issues[index] = $scope.app.issue;
      });
    },500);
  });
}

app.controller('IssueShowController', function($scope, $routeParams, IssueService, hotkeys, $location, $timeout){
  getIssueById($scope, $routeParams.issue_id, IssueService, $timeout);

  $scope.$watch('app.issue', function() {
    if ($scope.app.issues != undefined) {
      index_of_issue = findWithAttr($scope.app.issues, 'id', $scope.app.issue.id);
      if (index_of_issue > 0){
        $scope.previous_issue = $scope.app.issues[index_of_issue-1]
      }
      if (index_of_issue < $scope.app.issues.length-1){
        $scope.next_issue = $scope.app.issues[index_of_issue+1]
      }else{
        if(index_of_issue === $scope.app.issues.length-1){
          $scope.loading_next_issue = true;
          IssueService.getNextLatestIssues($scope.app.issues.length).then(function (response) {
            add_issues_to_main_array($scope, response.data.issues);
            if (index_of_issue < $scope.app.issues.length-1){
              $scope.next_issue = $scope.app.issues[index_of_issue+1]
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
      var index_of_issue = findWithAttr($scope.app.issues, 'id', $scope.app.issue.id);
      $scope.app.issues[index_of_issue] = $scope.app.issue;
      $location.path('/issues/'+$scope.app.issue.id);
    });
  }
});

function IssueFormController($scope, ProjectService) {
  ProjectService.getTrackers().then(function(trackers) {
    $scope.trackers = trackers;
  });
};

function add_issues_to_main_array($scope, new_issues) {
  for (var i = 0; i < new_issues.length; ++i) {
    var issue_in_scope_index = findWithAttr($scope.app.issues, 'id', new_issues[i].id);
    if (issue_in_scope_index >= 0) {
      $scope.app.issues[issue_in_scope_index] = new_issues[i];
    } else {
      $scope.app.issues.push(new_issues[i]);
    }
  }
}
