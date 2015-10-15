'use strict';

angular.module('myApp.services')
  .factory('SessionService', function($http, $q) {

    var service = {
      getCurrentUser: function() {
        if (service.isAuthenticated()) {
          return $q.when(service.currentUser);
        }else{
          return $http.get('/users/current.json?include=memberships', { headers: headers }).then(function(resp) {
            return service.currentUser = resp.data;
          });
        }
      },
      currentUser: null,
      isAuthenticated: function() {
        return !!service.currentUser;
      }
    };
    return service;
  });
