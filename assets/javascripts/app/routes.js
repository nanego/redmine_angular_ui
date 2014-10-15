angular.module('myApp').config(function($routeProvider){
  $routeProvider.
    when('/issues', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/issues/issues.html',
      controller: 'IssuesController'
    }).
    when('/issues/:issue_id', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/issues/show.html',
      controller: 'IssueShowController'
    }).
    when('/issues/:id/edit', {
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/issues/edit.html',
      controller : 'IssueEditController'
    }).
    when('/issues/new', {
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/issues/new.html',
      controller : 'IssueCreateController'
    }).
    when('/projects', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/projects/projects.html',
      controller: 'ProjectsController'
    }).
    when('/projects/:id', {
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/issues/issues.html',
      controller : 'ProjectIssuesController'
    }).
    when('/projects/:project_id/issues', {
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/issues/issues.html',
      controller : 'ProjectIssuesController'
    }).
    otherwise({
      redirectTo: '/issues'
    });
});
