'use strict';

var app = angular.module('myApp.services');

app.factory('Issue',function($http,$q) {
  var Issue = function (id) {
    this.id = id;
    this.details = null;
  };
  Issue.prototype.getDetails = function() {
    var self = this;
    return $http.get('/issues/'+id+'.json?include=journals', { headers: headers }).then(function(response) {
      self.details = response.data.issue;
      return response;
    });
  };
  return Issue;
});

app.factory('IssueService',function($http, $q){

  var Issue = function() {}; // constructor

  var result;
  function refresh(offset, limit) {
    offset = offset || 0;
    limit = limit || 25;
    return $http.get('/issues.json?sort=updated_on:desc&limit='+limit +'&offset='+offset, { headers: headers });
  }

  return {
    getLatestIssues: function () {
      if (!result) {
        result = refresh(null, null);
      }
      return result;
    },
    refreshLatestIssues: function (current_nb_of_issues) {
      result = refresh(0, current_nb_of_issues);
      return result;
    },
    getNextLatestIssues: function (offset) {
      return refresh(offset, null);
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
    save: function (issue) {
      var responsePromise;
      if (issue.id == null) {
        // new issue
      } else {
        // existing issue
        responsePromise = $http.put('/issues/'+issue.id+'.json', {"issue": issue}, { headers: headers } );
      }
      return responsePromise;
    },
    refresh: refresh
  };

});
