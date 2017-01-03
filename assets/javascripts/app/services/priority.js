'use strict';

var app = angular.module('myApp.services');

app.factory('PriorityService',function($http, $q){
  var service = {
    getPriorities: function() {
      if (service.prioritiesHaveBeenLoaded()) {
        return $q.when(service.priorities);
      }else{
        return $http.get('/enumerations/issue_priorities.json', { headers: headers }).then(function(data) {
          return service.priorities = data.data.issue_priorities;
        });
      }
    },
    priorities: null,
    prioritiesHaveBeenLoaded: function() {
      return !!service.priorities;
    }
  };

  return service;
});
