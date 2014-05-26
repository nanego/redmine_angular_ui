'use strict';

angular.module('myApp.services')
  .factory('SessionService', function($http, $q, $rootScope) {
    var service = {
      getCurrentUser: function() {
        $rootScope.loading = 0;
        if (service.isAuthenticated()) {
          $rootScope.loading += 25;
          return $q.when(service.currentUser);
        }else{
          return $http.get('/users/current.json').then(function(resp) {
            $rootScope.loading += 25;
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
