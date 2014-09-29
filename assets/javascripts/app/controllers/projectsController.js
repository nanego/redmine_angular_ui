var app = angular.module('myApp.controllers');

app.controller('ProjectsController', function($scope){

});

function getProjectById($scope, project_id) {
  $scope.$watch('app.projects', function() {
    if ($scope.app.projects !== undefined && ($scope.current.project === undefined || $scope.current.project.id !== project_id)) {
      console.log("getAllProjects -> now grep project is app.projects");
      $scope.current.project = $.grep($scope.app.projects, function (e) {
        return e.id.toString() === project_id;
      })[0];
    };
  });
}

app.controller('ProjectIssuesController', function($scope, $routeParams, IssueService, IssueServiceConfig){
  $scope.current.issues = undefined;
  getProjectById($scope, $routeParams.project_id);
  var watcher = $scope.$watch('current.project', function() {
    if ($scope.current.project !== undefined){
      watcher();
      $scope.next_issues_exist = true; // Show loader
      IssueService.getLatestIssuesByProject($routeParams.project_id).then(function (response) {
        $scope.current.issues = response.data.issues;
        IssueService.get_last_note_by_ids($scope.current.issues.map(function(x) {return x.id; })).success(function (response){
          update_array_of_issues_with_last_note($scope.current.issues, response.issues);
        });
        if ($scope.current.issues.length < IssueServiceConfig.default_limit){
          $scope.next_issues_exist = false;
        }else{
          $scope.next_issues_exist = true;
        }
      });
    }
  });
});
