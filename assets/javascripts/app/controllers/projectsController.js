var app = angular.module('myApp.controllers');

app.controller('ProjectsController', function($scope, SessionService, ProjectService, IssueService){
  getPreloadedData(SessionService, $scope, IssueService, ProjectService);
});
