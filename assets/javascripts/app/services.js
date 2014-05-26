'use strict';

angular.module('myApp.services',['ngResource'])

  .factory('IssueService',function($http,$q, $rootScope){
    var service = {
      getLatestIssues: function() {
        if (service.latestIssuesHaveBeenLoaded()) {
          $rootScope.loading += 50;
          return $q.when(service.latestIssues);
        }else{
          return $http.get(window.location.protocol+"//"+window.location.host + '/issues.json').then(function(data) {
            $rootScope.loading += 50;
            return service.latestIssues = data.data;
          });
        }
      },
      getIssueDetails: function(id) {
        return $http.get(window.location.protocol+"//"+window.location.host + '/issues/'+id+'.json?include=journals').then(function(data) {
          return data.data.issue;
        });
      },
      latestIssues: null,
      latestIssuesHaveBeenLoaded: function() {
        return !!service.latestIssues;
      }
    };
    return service;
  })

  .factory('ProjectService',function($http, $q, $rootScope){
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
  })

  .factory('TrackerService',function($http,$q, $rootScope){
    var service = {
      getTrackers: function() {
        if (service.trackersHaveBeenLoaded()) {
          $rootScope.loading += 10;
          return $q.when(service.trackers);
        }else{
          return $http.get(window.location.protocol+"//"+window.location.host + '/trackers.json').then(function(data) {
            $rootScope.loading += 10;
            return service.trackers = data.data.trackers;
          });
        }
      },
      trackers: null,
      trackersHaveBeenLoaded: function() {
        return !!service.trackers;
      }
    };
    return service;
  })

  .factory('SessionService', function($http, $q, $rootScope) {
    var service = {
      getCurrentUser: function() {
        $rootScope.loading = 0;
        if (service.isAuthenticated()) {
          $rootScope.loading += 25;
          return $q.when(service.currentUser);
        }else{
          return $http.get('/users/current.json').then(function(resp) {
            $rootScope.loading += 25;
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
