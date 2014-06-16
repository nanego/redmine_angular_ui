'use strict';

var app = angular.module('myApp.services');

app.factory('TrackerService',function($http, $q){
  var service = {
    getTrackers: function() {
      if (service.trackersHaveBeenLoaded()) {
        return $q.when(service.trackers);
      }else{
        return $http.get('/trackers.json', { headers: headers }).then(function(data) {
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
});
