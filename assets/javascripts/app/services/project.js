'use strict';

var app = angular.module('myApp.services');

app.factory('ProjectService',function($http, $q){
  var service = {
    getAllProjects: function() {
      if (service.hasBeenLoaded()) {
        return $q.when(service.projects);
      }else{
        console.log("fetch projects on server...");
        return $http.get('/custom_api/projects/minimal_index.json', { headers: headers }).then(function(data) {
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
