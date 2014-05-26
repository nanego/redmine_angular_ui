'use strict';

var app = angular.module('myApp',['ngRoute',
                        'ngResource',
                        'myApp.controllers',
                        'myApp.services',
                        'myApp.directives',
                        'myApp.filters']);

app.config(function($routeProvider){
  $routeProvider.
    when('/issues', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/issues.html',
      controller: 'IssuesController',
      resolve: {
        session: function(SessionService) {return SessionService.getCurrentUser();},
        issues: function(IssueService) {return IssueService.getLatestIssues();}
        // projects: function(ProjectService) {return ProjectService.getAllProjects();}
        }
      }).
    when('/issues/:issue_id', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/issue-show.html',
      controller: 'IssueShowController',
      resolve: {
        session: function (SessionService) {return SessionService.getCurrentUser();},
        issues: function(IssueService) {return IssueService.getLatestIssues();}
        }
      }).
    when('/projects', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/projects.html',
      controller: 'ProjectsController'
      }).
    otherwise({
      redirectTo: '/issues'
    });
});

app.run(function($rootScope) {
  $rootScope.loading = 0;
});
