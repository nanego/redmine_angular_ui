'use strict';

var app = angular.module('myApp.directives',[]);

app.directive('mainTabs', function () {
  return {
    restrict: 'E',
    templateUrl: '/plugin_assets/redmine_angular_ui/templates/directives/main_tabs.html'
  };
});

app.directive('spinner', function() {
  return {
    scope: {
      scopeVar: "=spinner"
    },
    restrict: 'A',
    replace: false,
    template: '<img src="/plugin_assets/redmine_angular_ui/images/spinner.gif" ng-show="loading"/>',
    link: function($scope, element, attrs) {
      $scope.loading = true;
      $scope.$watch("scopeVar", function() {
        if ($scope.scopeVar !== undefined) {
          $scope.loading = false;
        } else {
          $scope.loading = true;
        }
      });
    }
  };
});
