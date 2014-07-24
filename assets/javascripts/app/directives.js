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

app.directive('mainLoader', ['$timeout', '$rootScope', function($timeout, $rootScope) {
  return {
    restrict: 'A',
    replace: false,
    templateUrl: '/plugin_assets/redmine_angular_ui/templates/directives/main_loader.html',
    link: function($scope) {

      function checkCurrentLoad() {
        var check = false;
        for (var i = 0; i < $scope.loadings.length; i++) {
          if ($scope.loadings[i] === true) {
            check = true;
          }
        }
        $timeout(function(){
          $rootScope.mainLoading = check;
        },500);
      };

      if ($rootScope.mainLoading != false ){
        $rootScope.mainLoading = true;
        $scope.vars = ['app.issues', 'app.projects', 'app.user'];
        $scope.loadings = new Array($scope.vars.length);

        $scope.$watch('app.issues', function() {
          if ($scope.app.issues !== undefined) {
            $scope.loadings[0] = false;
            checkCurrentLoad();
          } else {
            $scope.loadings[0] = true;
          }
        });

        $scope.$watch('app.projects', function() {
          if ($scope.app.projects !== undefined) {
            $scope.loadings[1] = false;
            checkCurrentLoad();
          } else {
            $scope.loadings[1] = true;
          }
        });

        $scope.$watch('app.user', function() {
          if ($scope.app.user !== undefined) {
            $scope.loadings[2] = false;
            checkCurrentLoad();
          } else {
            $scope.loadings[2] = true;
          }
        });
      }
    }
  };
}]);
