angular.module('myApp').config(function($routeProvider){
  $routeProvider.
    when('/issues', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/issues/issues.html',
      controller: 'IssuesController',
      resolve: {
        session: function(SessionService) {return SessionService.getCurrentUser();},
        issues: function(IssueService) {return IssueService.getLatestIssues();}
        // projects: function(ProjectService) {return ProjectService.getAllProjects();}
      }
    }).
    when('/issues/:issue_id', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/issues/show.html',
      controller: 'IssueShowController',
      resolve: {
        session: function (SessionService) {return SessionService.getCurrentUser();},
        issues: function(IssueService) {return IssueService.getLatestIssues();}
      }
    }).
    when('/issues/:id/edit', {
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/issues/edit.html',
      controller : 'IssueEditController',
      resolve: {
        session: function(SessionService) {return SessionService.getCurrentUser();},
        issues: function(IssueService) {return IssueService.getLatestIssues();}
      }
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
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/projects/issues.html',
      controller : 'ProjectIssuesController'
    }).
    when('/projects/:id/issues', {
      templateUrl : '/plugin_assets/redmine_angular_ui/templates/projects/issues.html',
      controller : 'ProjectIssuesController'
    }).
    otherwise({
      redirectTo: '/issues'
    });
});
