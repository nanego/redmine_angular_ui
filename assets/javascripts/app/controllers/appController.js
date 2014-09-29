'use strict';

var app = angular.module('myApp.controllers');

app.controller('AppController', function($scope, $location, SessionService, IssueService, ProjectService, NotificationService) {

  getPreloadedData(SessionService, $scope, IssueService, ProjectService);

  // Dev
  // var faye_server_url = 'http://faye-redis.herokuapp.com/faye'; // or 'http://localhost:3001/faye'
  // Preprod
  var faye_server_url = 'http://faye.application.ac.centre-serveur.i2/faye';

  var client = new Faye.Client(faye_server_url);
  // client.setHeader('Access-Control-Allow-Origin', '*');
  client.disable('websocket');
  client.subscribe('/issues', function(message) {

    message = JSON.parse(message);
    IssueService.getLatestIssues().then(function () {
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
          if ($scope.app.issue !== undefined){
            if($scope.app.issue.id === message.issue.id){
              $scope.app.issue = message.issue;
              // Reload updated journal
              IssueService.getIssueDetails($scope.app.issue.id).then(function (fullIssue) {
                $scope.app.issue = fullIssue;
                // Then, update main array of issues
                var index = findWithAttr($scope.app.issues, 'id', $scope.app.issue.id);
                $scope.app.issues[index] = $scope.app.issue;
              });
            }
          }
          break;
        default:
          IssueService.refreshLatestIssues($scope.app.issues.length).then(function (response) {
            $scope.app.issues = response.data.issues;
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
  $scope.current = $scope.current || {};
  $scope.app.issue = undefined;
  SessionService.getCurrentUser().then(function (data) {
    $scope.app.user = data.user;
  });
  IssueService.getLatestIssues().then(function (response) {
    $scope.app.issues = response.data.issues;
  });
  ProjectService.getAllProjects().then(function (data) {
    $scope.app.projects = data.projects;
  });
}

function update_array_of_issues_with_last_note(arrayOfIssues, newIssuesData){
  for (var index = 0; index < newIssuesData.length; ++index) {
    var issue_index = findWithAttr(arrayOfIssues, 'id', newIssuesData[index]['id']);
    arrayOfIssues[issue_index].notes_count = newIssuesData[index]['count'];
    arrayOfIssues[issue_index].last_note = newIssuesData[index]['last_note'];
  }
}
