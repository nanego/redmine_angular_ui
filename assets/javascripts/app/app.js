angular.module('myApp',['ngRoute', 'myApp.controllers', 'myApp.services'])
  .config(function($routeProvider){
    $routeProvider.when('/', {
      templateUrl: '/plugin_assets/redmine_angular_ui/templates/index.html',
      controller: 'HomeController'
    })
      .otherwise({redirectTo: '/'});
  });
