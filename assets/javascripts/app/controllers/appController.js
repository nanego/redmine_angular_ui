'use strict';

var app = angular.module('myApp.controllers');

app.controller('AppController', function($scope, $location, $http, $q, SessionService, IssueService, ProjectService, NotificationService, toastr, inScopeFilter, UserService, inUserScopeFilter) {

  $http.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  $http.defaults.headers.common['X-Redmine-API-Key'] = api_key;
  $http.defaults.headers.common['Content-Type'] = 'application/json';

  getPreloadedData(SessionService, $scope, IssueService, ProjectService, UserService, NotificationService, $q, toastr, $location, inScopeFilter, inUserScopeFilter);

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

function getPreloadedData(SessionService, $scope, IssueService, ProjectService, UserService, NotificationService, $q, toastr, $location, inScopeFilter, inUserScopeFilter) {
  $scope.app = $scope.app || {};
  $scope.current = $scope.current || {};
  $scope.current.issue = undefined;
  var sessionPromise = SessionService.getCurrentUser().then(function (data) {

    console.log("User data : " + JSON.stringify(data.user));

    $scope.app.user = data.user;

    UserService.getUserMemberships($scope.app.user.id).then(function (data) {

      console.log("User memberships data : " + JSON.stringify(data));

      $scope.app.user.memberships = data;
    });


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
    subscribeToRealtimeUpdates(IssueService, NotificationService, $scope, toastr, $location, inScopeFilter, inUserScopeFilter);
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

function subscribeToRealtimeUpdates(IssueService, NotificationService, $scope, toastr, $location, inScopeFilter, inUserScopeFilter) {

  var client = new Faye.Client(faye_url);
  // client.setHeader('Access-Control-Allow-Origin', '*');
  client.disable('websocket');

  // Select which channels to listen: prod or preprod
  var channel_type = '';
  if (!$location.host().match(/portail/g)){
    channel_type = '-preprod';
  }

  var issues_channels = (channel_type.length>0) ? ['/issues', '/issues' + channel_type] : '/issues';
  console.log("Subscribed to " + issues_channels);
  client.subscribe(issues_channels, function (message) {
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

    if (correct_context && inUserScopeFilter(message.issue, $scope.app.user.memberships)) {
      IssueService.getLatestIssues().then(function () {
        // NotificationService.add(JSON.stringify(message), null, 500);
        switch (message.action) {
          case 'create':
            NotificationService.add("Une nouvelle demande a été ajoutée.", null, 10, "issue-" + message.issue.id);
            toastr.warning('Une nouvelle demande a été ajoutée.');
            $scope.app.issues.unshift(message.issue);
            if (inScopeFilter(message.issue, $scope.current.filters)){
              // Add the new issue on the top of the list, only if the issue must be displayed according to current filters
              $scope.current.issues.unshift(message.issue);
            }
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
            toastr.info("La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été mise à jour.", {allowHtml: true});

            var index = findWithAttr($scope.current.issues, 'id', message.issue.id);
            if (inScopeFilter(message.issue, $scope.current.filters)){
              // Move issue to top of the list
              if (index >= 0) {
                jQuery.extend($scope.current.issues[index], message.issue);
                arrayMove($scope.current.issues, index, 0);
              } else {
                $scope.current.issues.unshift(message.issue);
              }
            }else{
              // Remove from the list
              $scope.current.issues.splice(index, 1);
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

  var watched_prod_channel = '/watched/' + $scope.app.user.id;
  var watched_channels = (channel_type.length>0) ? [watched_prod_channel, '/watched'+  channel_type + '/' + $scope.app.user.id] : watched_prod_channel;
  console.log("Subscribed to " + watched_channels);
  client.subscribe(watched_channels, function (message) {

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
