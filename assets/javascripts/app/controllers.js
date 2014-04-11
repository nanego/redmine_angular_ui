angular.module('myApp.controllers',[])
.controller('HomeController',
  function($scope, session, SessionService, IssueService, Share){
    $scope.user = session.user;
    IssueService.getLatestIssues()
      .then(function(data) {
        $scope.issues = data;
      })
});
