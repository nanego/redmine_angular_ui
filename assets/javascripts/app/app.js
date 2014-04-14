'use strict';

angular.module('myApp',['ngRoute',
                        'ngResource',
                        'myApp.controllers',
                        'myApp.services',
                        'myApp.directives' ])
  .config(function($routeProvider){
    $routeProvider.when('/', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/index.html',
      controller: 'HomeController',
      resolve: {
        session: function(SessionService) {
          return SessionService.getCurrentUser();
        }
      }
    })
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  });
