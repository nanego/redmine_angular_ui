'use strict';

var app = angular.module('myApp.controllers');

app.controller('AppController', function($scope, $location, SessionService, IssueService, ProjectService) {

  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  var client = new Faye.Client('http://faye-redis.herokuapp.com/faye');
  client.disable('websocket');
  client.subscribe('/issues', function(message) {
    IssueService.refreshLatestIssues().then(function (data) {
      $scope.issues = data.issues;
    });
  });

  /*
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
  */

  $scope.alertType = "";
  $scope.alertMessage = "Welcome to the AngularJS Redmine Client";
  $scope.active = "progress-success hide";

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
    if (url == "#" + $location.path()) {
      return "active";
    } else {
      return "";
    }
  };
});

function getPreloadedData(SessionService, $scope, IssueService, ProjectService) {
  SessionService.getCurrentUser().then(function (data) {
    $scope.user = data.user;
  });
  IssueService.getLatestIssues().then(function (data) {
    $scope.issues = data.issues;
  });
  ProjectService.getAllProjects().then(function (data) {
    $scope.projects = data.projects;
  });
}
