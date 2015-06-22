'use strict';

var app = angular.module('myApp.controllers');

app.controller('AppController', function($scope, $location, $http, $q, SessionService, IssueService, ProjectService, NotificationService, toastr) {

  $http.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  $http.defaults.headers.common['X-Redmine-API-Key'] = api_key;
  $http.defaults.headers.common['Content-Type'] = 'application/json';

  getPreloadedData(SessionService, $scope, IssueService, ProjectService, NotificationService, $q, toastr);

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

  $scope.hover = function(issue, value) {
    // Shows/hides the fav star button on hover
    return issue.show_watched_toggle = value;
  };

});

function getPreloadedData(SessionService, $scope, IssueService, ProjectService, NotificationService, $q, toastr) {
  $scope.app = $scope.app || {};
  $scope.current = $scope.current || {};
  $scope.current.issue = undefined;
  var sessionPromise = SessionService.getCurrentUser().then(function (data) {
    $scope.app.user = data.user;
  });
  var issuesPromise = IssueService.getLatestIssues().then(function (response) {
    $scope.app.issues = response.data.issues;
    $scope.current.issues = response.data.issues;
  });
  /*
  ProjectService.getAllProjects().then(function (data) {
    $scope.app.projects = data.projects;
  });
  */
  $q.all([sessionPromise, issuesPromise]).then(function(){
    subscribeToRealtimeUpdates(IssueService, NotificationService, $scope, toastr);
  });
}

function update_array_of_issues_with_last_note(arrayOfIssues, newIssuesData){
  for (var index = 0; index < newIssuesData.length; ++index) {
    var issue_index = findWithAttr(arrayOfIssues, 'id', newIssuesData[index]['id']);
    if (issue_index >= 0 && arrayOfIssues[issue_index] !== undefined){
      arrayOfIssues[issue_index].notes_count = newIssuesData[index]['count'];
      arrayOfIssues[issue_index].last_note = newIssuesData[index]['last_note'];
    }
  }
}

function arrayMove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex]
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function subscribeToRealtimeUpdates(IssueService, NotificationService, $scope, toastr) {

  // Dev
  // var faye_server_url = 'http://faye-redis.herokuapp.com/faye'; // or 'http://localhost:3001/faye'
  // Prod / Preprod
  // var faye_server_url = 'http://faye.application.ac.centre-serveur.i2/faye';

  var client = new Faye.Client(faye_url);
  // client.setHeader('Access-Control-Allow-Origin', '*');
  client.disable('websocket');

  client.subscribe('/issues', function (message) {

    message = JSON.parse(message);

    if (message.user.id != $scope.app.user.id) {
      if (message.issue != undefined) {
        delete message.issue.watched;
      }
    }

    var correct_context = false;
    if ($scope.current.project == undefined || $scope.current.project.id === message.issue.project.id) {
      correct_context = true;
    }

    if (correct_context) {
      IssueService.getLatestIssues().then(function () {
        // NotificationService.add(JSON.stringify(message), null, 500);
        switch (message.action) {
          case 'create':
            NotificationService.add("Une nouvelle demande a été ajoutée.", null, 10, "issue-" + message.issue.id);
            toastr.info('Une nouvelle demande a été ajoutée.');
            $scope.current.issues.unshift(message.issue);
            break;
          case 'destroy':
            if (message.issue.status.is_closed == '1') {
              NotificationService.add("La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été fermée.", null, 10);
              toastr.success("La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été fermée.", {allowHtml: true});
            } else {
              NotificationService.add("La demande #" + message.issue.id + " a été supprimée.", null, 10);
              toastr.error("La demande #" + message.issue.id + " a été supprimée.");
            }
            var index = findWithAttr($scope.current.issues, 'id', message.issue.id);
            $scope.current.issues.splice(index, 1);
            break;
          case 'update':
            NotificationService.add("La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été mise à jour.", null, 10, "issue-" + message.issue.id);
            toastr.warning("La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été mise à jour.", {allowHtml: true});
            var index = findWithAttr($scope.current.issues, 'id', message.issue.id);
            if (index >= 0) {
              jQuery.extend($scope.current.issues[index], message.issue);
              arrayMove($scope.current.issues, index, 0);
            } else {
              $scope.current.issues.unshift(message.issue);
            }
            if ($scope.current.issue !== undefined) {
              if ($scope.current.issue.id === message.issue.id) {
                jQuery.extend($scope.current.issue, message.issue);
                // Reload updated journal
                IssueService.getIssueDetails($scope.current.issue.id).then(function (fullIssue) {
                  $scope.current.issue = fullIssue;
                  // Then, update main array of issues
                  var index = findWithAttr($scope.current.issues, 'id', $scope.current.issue.id);
                  $scope.current.issues[index] = $scope.current.issue;
                });
              }
            }
            break;
          default:
            IssueService.refreshLatestIssues($scope.current.issues.length).then(function (response) {
              $scope.current.issues = response.data.issues;
              NotificationService.add("Les demandes ont été mises à jour.", null, 5);
              toastr.warning("Les demandes ont été mises à jour.");
            });
            break;
        }
      });
    }
  });

  client.subscribe('/watched/' + $scope.app.user.id, function (message) {

    if ($scope.current.issues) {

      message = JSON.parse(message);

      IssueService.getLatestIssues().then(function () {
        switch (message.action) {

          case 'update':

            var index = findWithAttr($scope.current.issues, 'id', message.issue.id);
            jQuery.extend($scope.current.issues[index], message.issue);
            if ($scope.current.issue !== undefined) {
              if ($scope.current.issue.id === message.issue.id) {
                $scope.current.issue = message.issue;
                // Reload updated journal
                IssueService.getIssueDetails($scope.current.issue.id).then(function (fullIssue) {
                  $scope.current.issue = fullIssue;
                  // Then, update main array of issues
                  var index = findWithAttr($scope.current.issues, 'id', $scope.current.issue.id);
                  $scope.current.issues[index] = $scope.current.issue;
                });
              }
            }

            break;
          default:
            break;
        }
      });
    }
  });
}
