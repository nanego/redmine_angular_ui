var app = angular.module('myApp.controllers');

app.controller('sidebarController', function NavigationCtrl($scope, $mdSidenav) {

  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
  };
  $scope.close = function() {
    $mdSidenav('left').close();
  };

});
