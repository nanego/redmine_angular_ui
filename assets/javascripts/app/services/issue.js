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

  // var Issue = function() {}; // constructor
  var default_limit = 50; // TODO Should be fetched from IssueServiceConfig.default_limit;

  var result;
  var flag_getNextLatestIssues_already_running;

  function refresh(offset, limit, filters, base_url) {
    offset = offset || 0;
    limit = limit || default_limit;
    base_url = base_url || "issues";
    filters = filters || {};

    var param_filters = "";
    if (filters["status_id"] === undefined) {
      param_filters += '&f[]=status_id&op[status_id]=o';
    }
    if (filters["project_id"] !== undefined) {
      param_filters += '&project_id='+filters["project_id"];
    }
    if(filters["projects_ids"] !== undefined && filters["projects_ids"].length>0){
      param_filters += '&f[]=project_id&op[project_id]=%3D&f[]=&c[]=project';
      for(var i=0,l=filters["projects_ids"].length; i<l; i++) param_filters += '&v[project_id][]='+filters["projects_ids"][i];
    }
    if(filters["assigned_to_id"] !== undefined && filters["assigned_to_id"] !== ""){
      param_filters += '&f[]=assigned_to_id&op[assigned_to_id]='+filters["assigned_to_id"];
    }

    return $http.get('/'+base_url+'.json?sort=updated_on:desc&limit=' + limit + '&offset=' + offset + param_filters, { headers: headers });
  }

  var getNextIssuesSingleton = (function () {
    var promise;
    var current_call_nb = 0;

    function createPromise(offset, filters) {
      var uniq_call = refresh(offset, null, filters);
      return uniq_call;
    }

    return {
      getPromise: function (offset, filters) {
        if (!promise || current_call_nb==0) {
          promise = createPromise(offset, filters);
          current_call_nb = 1;
        }
        promise.then(function(){
          current_call_nb = 0;
        });
        return promise;
      }
    };
  })();

  return {
    getLatestIssues: function () {
      console.log("getLatestIssues");
      if (!result) {
        result = refresh(null, null);
      }
      return result;
    },
    /*
    get_not_assigned_issues: function (project_id) {
      console.log("getNotAssignedIssues");
      var filters = {};
      filters['project_id'] = project_id;
      result = refresh(null, null, filters, "custom_api/issues/not_assigned_issues");
      return result;
    },
    */
    getLatestIssuesWithFilters: function (filters) {
      console.log("getLatestIssuesWithFilters : " + JSON.stringify(filters, null, 2) );
      result = refresh(null, null, filters);
      return result;
    },
    getLatestIssuesByProject: function (project_id) {
      console.log("getLatestIssuesByProject");
      var filters = {};
      filters['project_id'] = project_id;
      result = refresh(null, null, filters);
      return result;
    },
    refreshLatestIssues: function (current_nb_of_issues) {
      console.log("refreshLatestIssues");
      result = refresh(0, current_nb_of_issues);
      return result;
    },
    getNextLatestIssues: function (offset, filters) {
      console.log("getNextLatestIssues" + JSON.stringify(filters, null, 2));
      return getNextIssuesSingleton.getPromise(offset, filters);
    },
    getIssueFromCache: function(id) {
      console.log("getIssueFromCache");
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
