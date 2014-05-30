var app = angular.module('myApp.controllers');

app.controller('ProjectsController', function($scope, SessionService, ProjectService){
  SessionService.getCurrentUser().then(function(data) {
    $scope.user = data.user;
  });
  ProjectService.getAllProjects().then(function(data) {
    $scope.projects = data.projects;
  })
});
