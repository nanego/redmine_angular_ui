'use strict';

var app = angular.module('myApp.services');

app.constant('IssueServiceConfig', {
  default_limit: 50
});

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

app.factory('IssueService', function($http){

  var Issue = function() {}; // constructor
  var default_limit = 50; // TODO Should be fetched from IssueServiceConfig.default_limit;

  var result;
  function refresh(offset, limit, project_id) {
    offset = offset || 0;
    limit = limit || default_limit;
    if (project_id === undefined) {
      return $http.get('/issues.json?sort=updated_on:desc&limit=' + limit + '&offset=' + offset, { headers: headers });
    }else{
      return $http.get('/issues.json?sort=updated_on:desc&limit='+limit +'&offset='+offset+'&project_id='+project_id, { headers: headers });
    }
  }

  return {
    getLatestIssues: function () {
      if (!result) {
        result = refresh(null, null);
      }
      return result;
    },
    getLatestIssuesByProject: function (project_id) {
      result = refresh(null, null, project_id);
      return result;
    },
    refreshLatestIssues: function (current_nb_of_issues) {
      result = refresh(0, current_nb_of_issues);
      return result;
    },
    getNextLatestIssues: function (offset, project) {
      var project_id = (project !== undefined ? project.id : undefined)
      return refresh(offset, null, project_id);
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
    get_last_note_by_ids: function(ids) {
      return $http({
        method: 'POST',
        url: '/custom_api/issues/get_last_note.json',
        data: {"issue_ids": ids},
        headers: headers
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
