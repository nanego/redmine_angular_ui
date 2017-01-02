'use strict';

var app = angular.module('myApp.controllers');

app.controller('ProjectsController', function($scope){

});

app.controller('ProjectIssuesController', function($rootScope, $scope, $routeParams, IssueService, IssueServiceConfig){

  $rootScope.current.issues = undefined;
  $rootScope.current.stage = "Demandes"; // TODO Refactor this

  getProjectById($rootScope, $scope, $routeParams.project_id);
  var watcher = $scope.$watch('current.project', function() {
    if ($rootScope.current.project){
      watcher();
      $scope.next_issues_exist = true; // Show loader
      IssueService.getLatestIssuesByProject($routeParams.project_id).then(function (response) {
        $rootScope.current.issues = response.data.issues;
        IssueService.get_last_note_by_ids($rootScope.current.issues.map(function(x) {return x.id; })).success(function (response){
          update_array_of_issues_with_last_note($rootScope.current.issues, response.issues);
        });
        if ($rootScope.current.issues.length < IssueServiceConfig.default_limit){
          $scope.next_issues_exist = false;
        }else{
          $scope.next_issues_exist = true;
        }
      });
    }
  });
});
