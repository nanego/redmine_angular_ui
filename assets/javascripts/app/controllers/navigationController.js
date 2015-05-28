var app = angular.module('myApp.controllers');

app.controller('navigationController', function NavigationCtrl($scope, $routeParams, ProjectService, hotkeys) {

  ProjectService.getAllProjects().then(function (data) {
    $scope.app.projects = data.projects;
  });

  $scope.$watch('current.project', function() {
    var name = "";
    if ($scope.current.project !== undefined){
      name = $scope.current.project.name;
    }else{
     if ($routeParams.project_name !== undefined && $routeParams.project_name.length>0){
       name = '*'+$routeParams.project_name+'*';
       $scope.search = $scope.search || {};
       $scope.search.name = $routeParams.project_name;
     } else{
       name = "Tous les projets";
     }
    }
    $scope.project = {name: name};
  } );

  $scope.stages = ["Aperçu", "Activité", "Demandes", "Wiki", "Fichiers", "Roadmap", "Planning"]

  // $scope.frequent_projects = [{name:"Le plus fréquenté 1"}, {name:"Le plus fréquenté 2"}, {name:"Le plus fréquenté 3"}];

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    console.log(angular.element($(".has-dropdown:first")));
    console.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  hotkeys.bindTo($scope)
    .add({
      combo: 'shift',
      description: 'Choix du projet',
      callback: function() {
        $scope.toggled(true);
      }
    });
});
