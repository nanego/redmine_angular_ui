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

app.filter('dateFormat', function($filter)
{
  return function(input)
  {
    if(input == null){ return ""; }

    var date = new Date(input);
    var now = new Date();
    if( date.setHours(0,0,0,0) == now.setHours(0,0,0,0) ) {
      var _date = $filter('date')(new Date(input), 'HH:mm');
    } else {
      var _date = $filter('date')(date, 'd MMM') + '.';
    }

    return _date.toLowerCase();

  };
});
