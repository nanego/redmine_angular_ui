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

app.factory('IssueService',function($http, $q, $location){

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
    save: function (issue) {
      if (issue.id == null) {
        // new issue
      } else {
        // existing issue
        $http.put('/issues/'+issue.id+'.json', {"issue": issue}, { headers: headers } ).then(function(response) {
          return response.data.issue;
        });
        var index_of_issue = findWithAttr($scope.issues, 'id', issue.id);
        $scope.issues[index_of_issue] = issue;
      }
      $location.path('/issues/'+issue.id);
    },
    refresh: refresh
  };

});
