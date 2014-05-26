'use strict';

var app = angular.module('myApp.services');

app.factory('TrackerService',function($http, $q, $rootScope){
  var service = {
    getTrackers: function() {
      if (service.trackersHaveBeenLoaded()) {
        $rootScope.loading += 10;
        return $q.when(service.trackers);
      }else{
        return $http.get(window.location.protocol+"//"+window.location.host + '/trackers.json').then(function(data) {
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
