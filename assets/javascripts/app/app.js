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
                        'uiSwitch'
]);

angular.module('myApp.services',['ngResource']);
angular.module('myApp.controllers',[]);

function findWithAttr(array, attr, value) {
  for(var i = 0; i < array.length; i += 1) {
    if(array[i][attr] === value) {
      return i;
    }
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

/* selection d'une ligne d'un tableau */        // TODO make it the angular way
$(".issue-listing .check").click(function(){
  console.log("check");
  $(this).closest("li").toggleClass("selected");
  $(this).toggleClass("is-checked");
  // actionMenu();
});
