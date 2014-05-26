'use strict';

var app = angular.module('myApp.services');

app.factory('ProjectService',function($http, $q, $rootScope){
  var service = {
    getAllProjects: function() {
      if (service.hasBeenLoaded()) {
        $rootScope.loading += 50;
        return $q.when(service.projects);
      }else{
        return $http.get(window.location.protocol+"//"+window.location.host + '/projects.json').then(function(data) {
          $rootScope.loading += 50;
          return service.projects = data.data;
        });
      }
    },
    projects: null,
    hasBeenLoaded: function() {
      return !!service.projects;
    }
  };
  return service;
});
