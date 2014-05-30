'use strict';

var app = angular.module('myApp.services');

app.factory('TrackerService',function($http, $q, $rootScope){
  var service = {
    getTrackers: function() {
      if (service.trackersHaveBeenLoaded()) {
        $rootScope.loading += 10;
        return $q.when(service.trackers);
      }else{
        return $http.get('/trackers.json', { headers: headers }).then(function(data) {
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
});
