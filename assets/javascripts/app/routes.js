angular.module('myApp').config(function($routeProvider){
  $routeProvider.
    when('/issues', {
      templateUrl: '/redmine_angular_ui/templates/issues/issues.html',
      controller: 'IssuesController'
    }).
    when('/issues/filters', {
      templateUrl: '/redmine_angular_ui/templates/issues/issues.html',
      controller: 'IssuesFiltersController'
    }).
    when('/issues/:issue_id', {
      templateUrl: '/redmine_angular_ui/templates/issues/show.html',
      controller: 'IssueShowController'
    }).
    when('/issues/:id/edit', {
      templateUrl : '/redmine_angular_ui/templates/issues/edit.html',
      controller : 'IssueEditController'
    }).
    when('/issues/new', {
      templateUrl : '/redmine_angular_ui/templates/issues/new.html',
      controller : 'IssueCreateController'
    }).
    when('/projects', {
      templateUrl: '/redmine_angular_ui/templates/projects/projects.html',
      controller: 'ProjectsController'
    }).
    when('/projects/:id', {
      templateUrl : '/redmine_angular_ui/templates/issues/issues.html',
      controller : 'ProjectIssuesController'
    }).
    when('/projects/:project_id/issues', {
      templateUrl : '/redmine_angular_ui/templates/issues/issues.html',
      controller : 'ProjectIssuesController'
    }).
    otherwise({
      redirectTo: '/issues'
    });
});
