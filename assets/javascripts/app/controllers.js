'use strict';

var app = angular.module('myApp.controllers',[]);

app.controller('IssuesController', function($scope, session, issues){
  $scope.user = session.user;
  $scope.issues = issues.issues;
});

app.controller('IssueShowController', function($scope, $routeParams, session, issues, IssueService){
  $scope.user = session.user;
  $scope.issue_id = $routeParams.issue_id;
  $scope.issues = issues.issues;
  var issue = $.grep(issues.issues, function(e){ return e.id.toString() === $scope.issue_id; })[0];
  $scope.issue = issue;
  IssueService.getIssueDetails($scope.issue_id).then(function(data) {
    $scope.issue_complete = data;
  });
});

app.controller('ProjectsController', function($scope, SessionService, ProjectService){
  SessionService.getCurrentUser().then(function(data) {
    $scope.user = data.user;
  });
  ProjectService.getAllProjects().then(function(data) {
    $scope.projects = data.projects;
  })
});

app.controller('AppCtrl', function($scope, $rootScope, $location) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    $scope.alertType = "loading alert-info";
    $scope.alertMessage = "Chargement de la page " + next.originalPath;
    $scope.active = "progress-striped active progress-warning show";
  });
  $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
    $scope.alertType = "alert-success";
    $scope.alertMessage = "Chargement terminé :)";
    $scope.active = "progress-success hide";

    $scope.newLocation = $location.path();
  });
  $rootScope.$on("$routeChangeError", function (event, current, previous, rejection) {
    alert("ROUTE CHANGE ERROR: " + rejection);
    $scope.alertType = "alert-error";
    $scope.alertMessage = "Problème lors du chargement :(";
    $scope.active = "";
  });

  $scope.alertType = "alert-info";
  $scope.alertMessage = "Welcome to the AngularJS Proto";

  $scope.tabs = [
    {
      title:"Demandes",
      url  :"#/issues"
    },
    {
      title:"Projets",
      url  :"#/projects"
    }
  ];

  $scope.checkActive = function (url) {
    if (url == "#" + $scope.newLocation) {
      return "active";
    } else {
      return "";
    }
  };
});
