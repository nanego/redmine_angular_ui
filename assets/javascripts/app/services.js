'use strict';

angular.module('myApp.services',['ngResource'])

  .factory('IssueService',function($http,$q){
    var service = {
      getLatestIssues: function() {
        if (service.hasBeenLoaded()) {
          return $q.when(service.latestIssues);
        }else{
          return $http.get(window.location.protocol+"//"+window.location.host + '/issues.json').then(function(data) {
            return service.latestIssues = data.data;
          });
        }
      },
      latestIssues: null,
      hasBeenLoaded: function() {
        return !!service.latestIssues;
      }
    };
    return service;
  })

  .factory('ProjectService',function($http,$q){
    var service = {
      getAllProjects: function() {
        if (service.hasBeenLoaded()) {
          return $q.when(service.projects);
        }else{
          return $http.get(window.location.protocol+"//"+window.location.host + '/projects.json').then(function(data) {
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
  })

  .factory('SessionService', function($http, $q) {
    var service = {
      getCurrentUser: function() {
        if (service.isAuthenticated()) {
          return $q.when(service.currentUser);
        }else{
          return $http.get('/users/current.json').then(function(resp) {
            return service.currentUser = resp.data;
          });
        }
      },
      currentUser: null,
      isAuthenticated: function() {
        return !!service.currentUser;
      }
    };
    return service;
  });
