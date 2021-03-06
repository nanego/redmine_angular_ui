'use strict';

var app = angular.module('myApp.controllers');

app.controller('navigationController', function NavigationCtrl($scope, $routeParams, ProjectService, hotkeys, $rootScope) {

  ProjectService.getAllProjects().then(function (data) {
    $scope.app.projects = data.projects;
  });

  $scope.$watch('current.project', function() {
    var name = "";
    if ($rootScope.current.project){
      name = $rootScope.current.project.name;
      if (!name){
        name = 'Projet ' + $rootScope.current.project.id;
      }
    }else{
     if ($routeParams.project_name){
       name = '*'+$routeParams.project_name+'*';
       $scope.search = $scope.search || {};
       $scope.search.name = $routeParams.project_name;
     }else{
       name = "Tous les projets";
     }
    }
    $scope.project = {name: name};
  } );

  $scope.stages = ["Aperçu", "Activité", "Demandes", "Wiki", "Fichiers", "Roadmap", "Planning"];

  // $scope.frequent_projects = [{name:"Le plus fréquenté 1"}, {name:"Le plus fréquenté 2"}, {name:"Le plus fréquenté 3"}];

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    console.log(angular.element($(".has-dropdown:first")));
    console.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $rootScope.$broadcast("documentClicked", angular.element(e.target));
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

  var assignation = $rootScope.current.filters['assigned_to_id'] == '!*' ? ' non assignées' : '';
  var admin_view = $rootScope.current.user_is_admin ? ' (vue admin)' : '';
  $scope.current_notif = "Demandes ouvertes" + assignation + admin_view;

});
