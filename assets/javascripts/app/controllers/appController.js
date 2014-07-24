'use strict';

var app = angular.module('myApp.controllers');

app.controller('AppController', function($scope, $location, SessionService, IssueService, ProjectService, NotificationService) {

  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  // var client = new Faye.Client('http://faye-redis.herokuapp.com/faye');
  // var client = new Faye.Client('http://localhost:3001/faye');
  var client = new Faye.Client('http://faye.application.ac.centre-serveur.i2/faye');
  client.disable('websocket');
  client.subscribe('/issues', function(message) {

    message = JSON.parse(message);
    IssueService.getLatestIssues().then(function (data) {
      // NotificationService.add(JSON.stringify(message), null, 500);
      switch (message.action) {
        case 'create':
          NotificationService.add("Une nouvelle demande a été ajoutée.", null, 10, "issue-"+message.issue.id);
          $scope.app.issues.unshift(message.issue);
          break;
        case 'destroy':
          NotificationService.add("La demande #"+message.issue.id+" a été supprimée.", null, 10);
          var index = findWithAttr($scope.app.issues, 'id', message.issue.id);
          $scope.app.issues.splice(index, 1);
          break;
        case 'update':
          NotificationService.add("La demande #"+message.issue.id+" a été mise à jour.", null, 10, "issue-"+message.issue.id);
          var index = findWithAttr($scope.app.issues, 'id', message.issue.id);
          $scope.app.issues[index] = message.issue;
          if ($scope.issue != undefined){
            if($scope.issue.id === message.issue.id){
              $scope.issue = message.issue;
            }
          }
          break;
        default:
          IssueService.refreshLatestIssues($scope.app.issues.length).then(function (data) {
            $scope.app.issues = data.issues;
            NotificationService.add("Les demandes ont été mises à jour.", null, 5);
          });
          break;
      }
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
  $scope.app = $scope.app || {};
  SessionService.getCurrentUser().then(function (data) {
    $scope.app.user = data.user;
  });
  IssueService.getLatestIssues().then(function (data) {
    $scope.app.issues = data.issues;
  });
  ProjectService.getAllProjects().then(function (data) {
    $scope.app.projects = data.projects;
  });
}
