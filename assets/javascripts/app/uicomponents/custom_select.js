'use strict';

var app = angular.module('myApp.customSelect',[]);

app.directive("customSelect", ['$rootScope', function($rootScope){

  return {
    restrict: "E",
    templateUrl: "/plugin_assets/redmine_angular_ui/templates/directives/custom_select.html",
    scope: {
      placeholder: "@",
      list: "=",
      selected: "=",
      property: "@",
      identifier: "@"
    },
    link: function(scope){
      scope.listVisible = false;
      scope.isPlaceHolder = true;

      scope.select = function(item) {
        console.log("select item : " + item[scope.property]);
        scope.isPlaceHolder = false;
        scope.selected = item;

        // Set current filters with selected value
        $rootScope.current.filters[scope.identifier] = item['id'];
        console.log(scope.identifier + ' = ' + item['id']);

        scope.hide_list();
      };

      scope.isSelected = function(item) {
        return item[scope.property] === scope.selected[scope.property];
      };

      scope.show = function() {
        scope.listVisible = true;
      };

      scope.hide_list = function() {
        scope.listVisible = false;
      };

      $rootScope.$on("documentClicked", function(inner, target) {

        // console.log("DocumenClicked: " + target[0]);
        // console.log("DocumenClicked: " + inner);

        console.log($(target[0]).is(".select-display.clicked") || $(target[0]).parents(".select-display.clicked").length > 0);
        if (!$(target[0]).is(".select-display.clicked") && !$(target[0]).parents(".select-display.clicked").length > 0)
          scope.hide_list();
      });

      scope.$watch("selected", function(value) {

        console.log("Selected has changed");

        scope.isPlaceholder = (scope.selected === undefined || scope.selected[scope.property] === undefined);
        scope.display = scope.selected[scope.property];
      });

    }
  }

}]);
