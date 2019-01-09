'use strict';

var app = angular.module('myApp.controllers');

app.controller('AppController', function($scope, $location, $http, $rootScope, $q, SessionService, IssueService, ProjectService, NotificationService, toastr, inScopeFilter, UserService, inUserScopeFilter) {

  $http.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  $http.defaults.headers.common['X-Redmine-API-Key'] = api_key;
  $http.defaults.headers.common['Content-Type'] = 'application/json';

  $rootScope.current = $rootScope.current || {};
  $rootScope.current.user_is_admin = current_user_is_admin;
  $rootScope.current_user_view_mode = current_user_view_mode;

  // getPreloadedData(SessionService, $rootScope, $scope, IssueService, ProjectService, UserService, NotificationService, $q, toastr, $location, inScopeFilter, inUserScopeFilter);

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

function getPreloadedData(SessionService, $rootScope, $scope, IssueService, IssueServiceConfig, ProjectService, NotificationService, $q, toastr, $location, $filter, inScopeFilter, inUserScopeFilter) {
  $scope.app = $scope.app || {};
  $rootScope.current = $rootScope.current || {};
  $rootScope.current.issue = undefined;

  // Get current user and user's memberships
  var sessionPromise = SessionService.getCurrentUser().then(function (data) {
    // console.log("User data : " + JSON.stringify(data.user));
    $scope.app.user = data.user;
  });

  var projectsPromise = ProjectService.getAllProjects().then(function (data) {
    $scope.app.projects = data.projects;

    if ($rootScope.current.filters['project_name']){
      var selectedProjects = $filter('regex')($scope.app.projects, 'name', $rootScope.current.filters['project_name']);
      var projects_ids = selectedProjects.map(function(x) {return x.id;});
      $rootScope.current.filters['projects_ids'] = projects_ids;
      // console.log('projets correspondants :' + JSON.stringify($rootScope.current.filters['projects_ids'], null, 2));
    }

    var issuesPromise = IssueService.getLatestIssuesWithFilters($rootScope.current.filters).then(function (response) {
      $scope.app.issues = response.data.issues;
      $rootScope.current.issues = response.data.issues;
      if ($rootScope.current.issues){
        IssueService.get_last_note_by_ids($rootScope.current.issues.map(function(x) {return x.id; })).success(function (response){
          update_array_of_issues_with_last_note($rootScope.current.issues, response.issues);
        });
        if ($rootScope.current.issues.length < IssueServiceConfig.default_limit){
          $scope.next_issues_exist = false;
        }else{
          $scope.next_issues_exist = true;
        }
      }
    });
  });

  return $q.all([sessionPromise, projectsPromise]).then(function(){
    subscribeToRealtimeUpdates(IssueService, NotificationService, $rootScope, $scope, toastr, $location, inScopeFilter, inUserScopeFilter);
  });
}

function update_array_of_issues_with_last_note(arrayOfIssues, newIssuesData){
  for (var index = 0; index < newIssuesData.length; ++index) {
    if (arrayOfIssues){
      var issue_index = findWithAttr(arrayOfIssues, 'id', newIssuesData[index]['id']);
      if (issue_index >= 0 && arrayOfIssues[issue_index] !== undefined){
        arrayOfIssues[issue_index].notes_count = newIssuesData[index]['count'];
        arrayOfIssues[issue_index].last_note = newIssuesData[index]['last_note'];
      }
    }
  }
}

function arrayMove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function subscribeToRealtimeUpdates(IssueService, NotificationService, $rootScope, $scope, toastr, $location, inScopeFilter, inUserScopeFilter) {

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

    if ($rootScope.current.issues){

      message = JSON.parse(message);

      if (message.user.id != $scope.app.user.id) {
        if (message.issue != undefined) {
          delete message.issue.watched;
        }
      }

      var correct_context = false;
      if ($rootScope.current.project == undefined || $rootScope.current.project.id === message.issue.project.id) {
        correct_context = true;
      }

      if (correct_context && ($rootScope.current.user_is_admin || inUserScopeFilter(message.issue, $scope.app.user.memberships))) {
        // IssueService.getLatestIssues().then(function () {
        switch (message.action) {
          case 'create':
            $scope.app.issues.unshift(message.issue);
            if (inScopeFilter(message.issue, $rootScope.current.filters)){
              // Add the new issue on the top of the list, only if the issue must be displayed according to current filters
              $rootScope.current.issues.unshift(message.issue);
              showNotification(NotificationService, toastr, message.issue, 'Une nouvelle demande a été ajoutée.');
            }
            break;
          case 'destroy':
            var index = findWithAttr($rootScope.current.issues, 'id', message.issue.id);
            $rootScope.current.issues.splice(index, 1);
            if (inScopeFilter(message.issue, $rootScope.current.filters)){
              if (message.issue.status.is_closed == '1') {
                showNotification(NotificationService, toastr, message.issue, "La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été fermée.");
              } else {
                showNotification(toastr, message.issue, "La demande #" + message.issue.id + " a été supprimée.");
              }
            }
            break;
          case 'update':
            var index = findWithAttr($rootScope.current.issues, 'id', message.issue.id);
            if (inScopeFilter(message.issue, $rootScope.current.filters)){
              // Move issue to top of the list
              if (index >= 0) {
                jQuery.extend($rootScope.current.issues[index], message.issue);
                arrayMove($rootScope.current.issues, index, 0);
              } else {
                $rootScope.current.issues.unshift(message.issue);
              }
              showNotification(NotificationService, toastr, message.issue, "La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été mise à jour.");
            }else{
              if (index >= 0) {
                // Remove from the list
                $rootScope.current.issues.splice(index, 1);
                showNotification(NotificationService, toastr, message.issue, "La demande <a href='/issues/" + message.issue.id + "' target='_blank'>#" + message.issue.id + "<\/a> a été mise à jour.");
              }
            }

            if ($rootScope.current.issue !== undefined) {
              if ($rootScope.current.issue.id === message.issue.id) {
                jQuery.extend($rootScope.current.issue, message.issue);
                // Reload updated journal
                IssueService.getIssueDetails($rootScope.current.issue.id).then(function (fullIssue) {
                  $rootScope.current.issue = fullIssue;
                  // Then, update main array of issues
                  var index = findWithAttr($rootScope.current.issues, 'id', $rootScope.current.issue.id);
                  $rootScope.current.issues[index] = $rootScope.current.issue;
                });
              }
            }
            break;
          default:
            IssueService.refreshLatestIssues($rootScope.current.issues.length).then(function (response) {
              $rootScope.current.issues = response.data.issues;
              showNotification(NotificationService, toastr, message.issue, "Les demandes ont été mises à jour.");
            });
            break;
        }
      }
    }
  });

  var watched_prod_channel = '/watched/' + $scope.app.user.id;
  var watched_channels = (channel_type.length>0) ? [watched_prod_channel, '/watched'+  channel_type + '/' + $scope.app.user.id] : watched_prod_channel;
  console.log("Subscribed to " + watched_channels);
  client.subscribe(watched_channels, function (message) {

    if ($rootScope.current.issues) {

      message = JSON.parse(message);

      // IssueService.getLatestIssues().then(function () {
        switch (message.action) {

          case 'update':

            var index = findWithAttr($rootScope.current.issues, 'id', message.issue.id);
            jQuery.extend($rootScope.current.issues[index], message.issue);
            if ($rootScope.current.issue !== undefined) {
              if ($rootScope.current.issue.id === message.issue.id) {
                $rootScope.current.issue = message.issue;
                // Reload updated journal
                IssueService.getIssueDetails($rootScope.current.issue.id).then(function (fullIssue) {
                  $rootScope.current.issue = fullIssue;
                  // Then, update main array of issues
                  var index = findWithAttr($rootScope.current.issues, 'id', $rootScope.current.issue.id);
                  $rootScope.current.issues[index] = $rootScope.current.issue;
                });
              }
            }

            break;
          default:
            break;
        }
      // });
    }
  });

  // Check connection status and give a feedback to the user
  client.on('transport:down', function offlineClient() {
    console.log('the client is offline');
    $rootScope.current.faye_client_status = "offline";
  });
  client.on('transport:up', function onlineClient() {
    console.log('the client is online');
    $rootScope.current.faye_client_status = "online";
  });
}

function getProjectById($rootScope, $scope, project_id) {
  var project;
  // $scope.$watch('app.projects', function() {
    if ($scope.app.projects && ($rootScope.current.project == undefined || $rootScope.current.project.id != project_id)) {
      console.log("getProjectById");
      project = $.grep($scope.app.projects, function (e) {
        return e.id.toString() === project_id;
      })[0];
    }
  // });
  return project;
}

function getObjectById(collection, object_id){
  var object;
  object = $.grep(collection, function (e) {
    return e.id.toString() === object_id.toString();
  })[0];
  return object;
}

// Test presence of an object based on a given attribute
function containsObject(obj, list, attribute) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i][attribute] === obj[attribute]) {
      return true;
    }
  }
  return false;
}

function showNotification(NotificationService, toastr, issue, message){
  switch (issue.priority.id) {
    case 4:
      toastr.warning(message, {allowHtml: true});
      break;
    case 6:
      toastr.error(message, {allowHtml: true});
      break;
    default:
      toastr.info(message, {allowHtml: true});
      break;
  }

  if (issue != undefined){
    NotificationService.add(message, null, 10, "issue-" + issue.id);
  } else {
    NotificationService.add(message, null, 10);
  }
}
