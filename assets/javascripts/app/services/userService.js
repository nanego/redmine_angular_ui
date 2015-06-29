'use strict';

var app = angular.module('myApp.services');

app.factory('UserService',function($http, $q){
  var service = {
    getUserMemberships: function(user_id) {
      if (service.membershipsHaveBeenLoaded()) {
        return $q.when(service.memberships);
      }else{
        return $http.get('/users/'+user_id+'.json?include=memberships', { headers: headers }).then(function(data) {
          return service.memberships = data.data.user.memberships;
        });
      }
    },
    memberships: null,
    membershipsHaveBeenLoaded: function() {
      return !!service.memberships;
    }
  };
  return service;
});
