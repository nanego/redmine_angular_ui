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

app.filter('not_assigned', function() {
  return function (items) {
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item['assigned_to'] == undefined) {
        filtered.push(item);
      }
    }
    return filtered;
  };
});

app.filter('project_name', function() {
  return function (issues, filters) {
    var filtered = [];
    var reg = new RegExp(filters['projects'],"gi");
    // console.log("filter = " + filters['projects']);
    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i];
      if ( reg.test(issue.project.name) ) {
        filtered.push(issue);
      }
    }
    return filtered;
  };
});

app.filter('regex', function() {
  return function(input, field, regex) {

    // console.log("input : " + JSON.stringify(input, null, 2) );
    // console.log("field : " + JSON.stringify(field, null, 2) );
    // console.log("regex : " + JSON.stringify(regex, null, 2) );

    var patt = new RegExp(regex, 'i');
    var out = [];
    for (var i = 0; i < input.length; i++){
      if(patt.test(input[i][field]))
        out.push(input[i]);
    }
    return out;
  };
});

app.filter('inScope', function() {
  return function (issue, filters) {
    var currently_in_scope = true;

    console.log("issue : " + JSON.stringify(issue));

    if (filters["status_id"] !== undefined) {
      //TODO
    }

    if (filters["project_id"] !== undefined) {
      //TODO
    }

    if (filters["projects_ids"] !== undefined && filters["projects_ids"].length>0){
      //TODO
    }

    if (filters["assigned_to_id"] !== undefined && filters["assigned_to_id"] !== ""){
      if(issue.assigned_to == null && filters["assigned_to_id"] !== "!*"){
        currently_in_scope = false;
      }
      if(issue.assigned_to != null && filters["assigned_to_id"] === "!*"){
        currently_in_scope = false;
      }
    }

    if (filters["project_name"] !== undefined && filters["project_name"] !== ""){

      var rule = new RegExp(filters["project_name"], 'i');

      if(issue.project.name.match(rule)){
        // console.log('Issue IS in current project name filter')
      }else{
        currently_in_scope = false;
        // console.log('Issue IS NOT in current project name filter')
      }
    }

    // console.log("Is issue " + issue.id + " in current scope ? " + currently_in_scope);
    return currently_in_scope;
  };
});
