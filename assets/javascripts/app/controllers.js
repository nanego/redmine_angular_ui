angular.module('myApp.controllers',[])
.controller('HomeController',
  function($scope, IssueService){
    IssueService.getLatestIssues()
      .then(function(data) {
        $scope.issues = data;
      })
});
