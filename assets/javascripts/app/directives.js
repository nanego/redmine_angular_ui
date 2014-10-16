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
    template: '<img src="/plugin_assets/redmine_angular_ui/images/spinner.gif" ng-show="loading" />',
    link: function($scope, element, attrs) {
      $scope.loading = true;
      $scope.$watch("scopeVar", function() {
        if ($scope.scopeVar !== undefined && $scope.scopeVar !== false) {
          $scope.loading = false;
        } else {
          $scope.loading = true;
        }
      });
    }
  };
});

app.directive('scroller', function () {
  return {
    restrict: 'A',
    scope: {
      loadingMethod: "&"
    },
    link: function (scope, elem, attrs) {
      var rawElement = elem[0];
      $(document).bind('scroll', function () {
        // Cross-browser infinite scrolling
        var docHeight, winHeight, scrTop;
        if (navigator.userAgent.indexOf("MSIE") !== -1) {
          docHeight = getDocHeight();
          winHeight = document.body.clientHeight;
          scrTop = document.body.scrollTop;
        } else {
          docHeight = $(document).height();
          winHeight = window.innerHeight;
          scrTop = $(window).scrollTop();
        }
        if (scrTop >= (docHeight - winHeight)) {
          scope.$apply(scope.loadingMethod);
        }
      });
    }
  };
});

function getDocHeight() {
  var D = document;
  return Math.max(
    Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
    Math.max(D.body.offsetHeight, D.documentElement.scrollHeight),
    Math.max(D.body.clientHeight, D.documentElement.clientHeight)
  );
}

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
            $scope.loadings[1] = true; //true; if false, do not wait for projects #TODO In prod env., wait for it
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

app.directive('priorityToggle', function($timeout, $http) {
  return {
    scope: {
      val: '=ngModel',
      issueId: '=?'
    },
    restrict: 'E',
    replace: false,
    transclude: true,
    template: '<div class="priority-div unselectable"' +
      'ng-class="{\'is3\': val==ngLowVal,' +
                  '\'is4\': val==ngMediumVal, ' +
                  '\'is6\': val==ngHighVal, ' +
                  '\'is10\': val==ngVeryLowVal}"' +
      'ng-click="toggle()">' +
      '<span class="prior">i</span></div>',
    link: function(scope, element, attrs) {
      if (!angular.isDefined(scope.ngVeryLowVal)) {
        scope.ngVeryLowVal = 10;
      }
      if (!angular.isDefined(scope.ngLowVal)) {
        scope.ngLowVal = 3;
      }
      if (!angular.isDefined(scope.ngMediumVal)) {
        scope.ngMediumVal = 4;
      }
      if (!angular.isDefined(scope.ngHighVal)) {
        scope.ngHighVal = 6;
      }
      if (!angular.isDefined(scope.val)) {
        scope.val = scope.ngLowVal;
      }

      scope.toggle = function() {
        if (scope.val === scope.ngVeryLowVal) {
          scope.val = scope.ngLowVal;
        } else if (scope.val === scope.ngLowVal) {
          scope.val = scope.ngMediumVal;
        } else if (scope.val === scope.ngMediumVal) {
          scope.val = scope.ngHighVal;
        } else {
          scope.val = scope.ngVeryLowVal;
        }
        if (typeof scope.ngChange != 'undefined') {
          $timeout(function() {
            scope.ngChange(scope.val);
          });
        }
      };
    }
  };
});
