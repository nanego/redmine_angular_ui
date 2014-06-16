// register all modules
var app = angular.module('myApp',['ngRoute',
                        'ngResource',
                        'myApp.controllers',
                        'myApp.services',
                        'myApp.directives',
                        'myApp.filters']);

angular.module('myApp.services',['ngResource']);
angular.module('myApp.controllers',[]);
