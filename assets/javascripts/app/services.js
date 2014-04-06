angular.module('myApp.services',[])
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
});
