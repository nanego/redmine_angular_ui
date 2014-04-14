'use strict';

angular.module('myApp.controllers',[])
.controller('HomeController',
  function($scope, session, SessionService, IssueService){
    $scope.user = session.user;
    IssueService.getLatestIssues()
      .then(function(data) {
        $scope.issues = data;
      })
});
