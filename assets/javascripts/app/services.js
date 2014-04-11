angular.module('myApp.services',['ngResource'])

  .factory('IssueService',function($http,$q){
    var service = {
      getLatestIssues: function() {
      var d = $q.defer();

        $http.get('http://localhost:3000/issues.json').success(function(data) {
            d.resolve(data.issues);
        });

      return d.promise;
      }
    };
    return service;
  })

  .factory('SessionService', function($http, $q) {
    var service = {
      getCurrentUser: function() {
        if (service.isAuthenticated()) {
          return $q.when(service.currentUser);
        }else{
          return $http.get('/users/current.json').then(function(resp) {
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
