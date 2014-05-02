'use strict';

var app = angular.module('myApp',['ngRoute',
                        'ngResource',
                        'myApp.controllers',
                        'myApp.services',
                        'myApp.directives' ]);

app.config(function($routeProvider){
  $routeProvider.when('/issues', {
    templateUrl: '/plugin_assets/redmine_angular_ui/templates/issues.html',
    controller: 'HomeController',
    resolve: {
      session: function(SessionService) {
        return SessionService.getCurrentUser();
      },
      issues: function(IssueService) {
        return IssueService.getLatestIssues();
      },
      projects: function(ProjectService) {
        return ProjectService.getAllProjects();
      }
    }
  });
  $routeProvider.when('/projects', {
    templateUrl: '/plugin_assets/redmine_angular_ui/templates/projects.html',
    controller: 'ProjectsController',
    resolve: {
      session: function(SessionService) {
        return SessionService.getCurrentUser();
      },
      issues: function(IssueService) {
        return IssueService.getLatestIssues();
      },
      projects: function(ProjectService) {
        return ProjectService.getAllProjects();
      }
    }
  });
  $routeProvider.otherwise({
    redirectTo: '/issues'
  });
});

app.run(function($rootScope) {
  $rootScope.loading = 0;
});

