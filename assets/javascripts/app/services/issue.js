'use strict';

var app = angular.module('myApp.services');

app.factory('Issue',function($http,$q, $rootScope) {
  var Issue = function (id) {
    this.id = id;
    this.details = null;
  };
  Issue.prototype.getDetails = function() {
    var self = this;
    return $http.get('/issues/'+id+'.json?include=journals', { headers: headers }).then(function(response) {
      self.details = response.data.issue
      return response;
    });
  };
  return Issue;
});

app.factory('IssueService',function($http,$q, $rootScope){

  var Issue = function() {}; // constructor

  var result;
  function refresh() {
    result = $http.get('/issues.json', { headers: headers }).then(function(response) {
      return response.data;
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
      return getLatestIssues.then(function (response) {
        // todo
      });
    },
    getIssueDetails: function(id) {
      return $http.get('/issues/'+id+'.json?include=journals', { headers: headers }).then(function(response) {
        return response.data.issue;
      });
    },
    refresh: refresh
  };

});
