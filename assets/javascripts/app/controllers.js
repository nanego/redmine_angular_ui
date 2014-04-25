'use strict';

var app = angular.module('myApp.controllers',[]);

app.controller('HomeController',
  function($scope, session, issues, SessionService, IssueService){
    $scope.user = session.user;
    $scope.issues = issues.issues;
});

app.controller('ProjectsController',
  function($scope, session, projects, SessionService, IssueService){
    $scope.user = session.user;
    $scope.projects = projects.projects;
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
