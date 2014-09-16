var app = angular.module('myApp.controllers');

app.controller('ProjectsController', function($scope){

});

function getProjectById($scope, project_id, ProjectService) {
  ProjectService.getAllProjects().then(function (response) {
    if ($scope.app.project === undefined || $scope.app.project.id!==project_id) {
      $scope.app.project = $.grep($scope.app.projects, function (e) {
        return e.id.toString() === project_id;
      })[0];
    }
  });
}

app.controller('ProjectIssuesController', function($scope, $routeParams, IssueService, ProjectService, hotkeys, $location, $timeout){
  getProjectById($scope, $routeParams.project_id, ProjectService, $timeout);
  $scope.$watch('app.project', function() {
    IssueService.getLatestIssuesByProject($routeParams.project_id).then(function (response) {
      $scope.issues = response.data.issues;
    });
  });
});
