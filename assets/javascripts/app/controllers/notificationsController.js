'use strict';

var app = angular.module('myApp.controllers');

app.controller('NotificationsController', function($scope, NotificationService) {
  $scope.notifications = NotificationService.list;
  $scope.notified_lines = NotificationService.notified_lines;
  $scope.recently_notified_lines = NotificationService.recently_notified_lines;

  $scope.click_on_issue = function(id) {
    if ($scope.recently_notified_lines.indexOf(id)>=0) {
      $scope.recently_notified_lines.splice($scope.recently_notified_lines.indexOf(id), 1);
    }
  };
});
