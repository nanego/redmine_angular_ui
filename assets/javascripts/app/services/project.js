'use strict';

var app = angular.module('myApp.services');

app.factory('ProjectService',function($http, $q){
  var service = {
    getAllProjects: function() {
      if (service.hasBeenLoaded()) {
        return $q.when(service.projects);
      }else{
        return $http.get('/projects.json', { headers: headers }).then(function(data) {
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
