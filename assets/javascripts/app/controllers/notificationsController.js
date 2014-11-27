'use strict';

var app = angular.module('myApp.controllers');

app.controller('NotificationsController', function($scope, NotificationService) {
  $scope.notifications = NotificationService.list;
  $scope.notified_lines = NotificationService.notified_lines;
  $scope.recently_notified_lines = NotificationService.recently_notified_lines;
});
