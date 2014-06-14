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

app.directive('mainLoader', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    replace: false,
    templateUrl: '/plugin_assets/redmine_angular_ui/templates/directives/main_loader.html',
    link: function($scope, element, attrs) {

      $scope.loading = true;
      $scope.vars = ['issues', 'projects', 'user'];
      $scope.loadings = new Array($scope.vars.length);

      function checkCurrentLoad() {
        var check = false;
        for (var i = 0; i < $scope.loadings.length; i++) {
          if ($scope.loadings[i] === true) {
            check = true;
          }
        }
        $timeout(function(){
          $scope.loading = check;
        },500);
      }

      $scope.$watch('issues', function() {
        if ($scope.issues !== undefined) {
          $scope.loadings[0] = false;
          checkCurrentLoad();
        } else {
          $scope.loadings[0] = true;
        }
      });

      $scope.$watch('projects', function() {
        if ($scope.projects !== undefined) {
          $scope.loadings[1] = false;
          checkCurrentLoad();
        } else {
          $scope.loadings[1] = true;
        }
      });

      $scope.$watch('user', function() {
        if ($scope.user !== undefined) {
          $scope.loadings[2] = false;
          checkCurrentLoad();
        } else {
          $scope.loadings[2] = true;
        }
      });
    }
  };
}]);
