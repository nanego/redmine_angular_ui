'use strict';

var app = angular.module('myApp.services');

app.factory('IssueService',function($http,$q, $rootScope){
  var result;
  function refresh() {
    result = $http.get(window.location.protocol+"//"+window.location.host + '/issues.json').then(function(data) {
      return data.data;
    });
  }

  return {
    getLatestIssues: function () {
      if (!result) {
        refresh();
      }
      return result;
    },
    getIssueFromCache: function(id) {
      return getLatestIssues.then(function (data) {
        // todo
      });
    },
    getIssueDetails: function(id) {
      return $http.get(window.location.protocol+"//"+window.location.host + '/issues/'+id+'.json?include=journals').then(function(data) {
        return data.data.issue;
      });
    },
    refresh: refresh
  };

});
