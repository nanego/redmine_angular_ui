angular.module('myApp',['ngRoute'])
  .config(function($routeProvider){
    $routeProvider.when('/', {
      templateUrl: '/templates/index.html',
      controller: 'HomeController'
    })
    .otherwise({redirectTo: '/'});
});
