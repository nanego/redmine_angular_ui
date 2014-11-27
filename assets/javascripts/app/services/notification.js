'use strict';

var app = angular.module('myApp.services');

app.factory('NotificationService',function($timeout) {
  var service = {
    list: {},
    notified_lines: [],
    recently_notified_lines: [],
    add: function (text, undo, delay, line) {
      var timestamp = (new Date()).getTime();
      service.list[timestamp] = {
        text: text,
        canUndo: function () {
          return angular.isFunction(undo);
        },
        undo: function () {
          if (angular.isFunction(undo)) {
            delete service.list[timestamp];
            undo();
          }
        }
      };
      service.notified_lines.push(line);
      service.recently_notified_lines.push(line);
      $timeout(function () {
        delete service.list[timestamp];
        service.notified_lines.splice( service.notified_lines.indexOf(line), 1 );
      }, (delay || 5) * 1000); // custom delay or 5 seconds
      $timeout(function () {
        service.recently_notified_lines.splice( service.recently_notified_lines.indexOf(line), 1 );
      }, 3600 * 1000); // 1 hour
    }
  };
  return service;
});
