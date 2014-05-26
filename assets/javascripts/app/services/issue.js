'use strict';

var app = angular.module('myApp.services');

app.factory('IssueService',function($http,$q, $rootScope){
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
});
