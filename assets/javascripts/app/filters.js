'use strict';

var app = angular.module('myApp.filters', []);

app.filter('userName', function() {
  return function(input) {

    if (input !== undefined) {

      var retString = "";

      if (input.name) {
        retString += input.name;
      } else {
        retString += input.firstname + " " + input.lastname;
      }

      if (input.login) {
        retString += " (" + input.login + ")";
      }

      return retString;
    }

    return "";
  };
});

app.filter('unsafe', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  };
});
