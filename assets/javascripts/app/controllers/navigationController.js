var app = angular.module('myApp.controllers');

app.controller('navigationController', function NavigationCtrl($scope) {

  $scope.$watch('current.project', function() {
    $scope.project = {
      name: ($scope.current.project !== undefined ? $scope.current.project.name : "Tous les projets" )
    };
  } );

  $scope.stages = ["Aperçu", "Activité", "Demandes", "Wiki", "Fichiers", "Roadmap", "Planning"]

  $scope.frequent_projects = [{name:"Le plus fréquenté 1"}, {name:"Le plus fréquenté 2"}, {name:"Le plus fréquenté 3"}];

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    console.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };
});
