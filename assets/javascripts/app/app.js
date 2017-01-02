'use strict';

// register all modules
var app = angular.module('myApp',['ngRoute',
                        'ngResource',
                        'myApp.controllers',
                        'myApp.services',
                        'myApp.directives',
                        'myApp.filters',
                        'ngSanitize',
                        'cfp.hotkeys',
                        'myApp.customdropdown',
                        'myApp.customSelect',
                        'myApp.searchBox',
                        'uiSwitch',
                        'ui.bootstrap',
                        'ngAnimate',
                        'toastr'
]);

angular.module('myApp.services',['ngResource']);
angular.module('myApp.controllers',[]);

function findWithAttr(array, attr, value) {
  if(array != undefined){
    for(var i = 0; i < array.length; i += 1) {
      if(array[i][attr] === value) {
        return i;
      }
    }
  }else{
    return null;
  }
}

/* ombrage sous le bandeau d'action lors d'un scroll down */   // TODO make it the angular way
$(window).scroll(function() {
  var scroll = $(window).scrollTop();
  if (scroll > 0) {
    $(".actions-menu").addClass("sticky");
  }
  else { $(".actions-menu").removeClass("sticky"); }
});

/* Toastr real-time notifications */
app.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    positionClass: 'toast-bottom-right',
    closeButton: true,
    timeOut: 9500,
    maxOpened: 6,
    iconClasses: {
      error: 'toast-error',
      info: 'toast-info',
      success: 'toast-success',
      warning: 'toast-warning'
    }
  });
});

/* custom_select directive wants to know when main document is clicked */
app.run(function($rootScope) {
  angular.element(document).on("click", function(e) {
    console.log('Broadcast documentClicked !');
    $rootScope.$broadcast("documentClicked", angular.element(e.target));
  });
});
