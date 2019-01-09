'use strict';

var app = angular.module('myApp.searchBox',[]);

app.constant('searchBoxConfig', {
  openClass: 'open',
  activeClass: 'is-hover'
});

app.directive('searchBox', ['$document', '$animate', '$rootScope', 'searchBoxConfig', 'searchBoxService', function($document, $animate, $rootScope, searchBoxConfig, searchBoxService) {
  return {
    scope: {
      disabled: '&searchBoxDisabled',
      opened: '@'
    },
    controller: ['$timeout', '$scope', '$animate', '$rootScope', 'searchBoxConfig', 'searchBoxService', function($timeout, $scope, $animate, $rootScope, searchBoxConfig, searchBoxService){

      var openClass = searchBoxConfig.openClass;
      var setIsOpen = angular.noop;

      this.init = function (element){

        self.$element = element;

        console.log('init');

        /*
         if ( $attrs.isOpen ) {

         console.log('attr is open');

         getIsOpen = $parse($attrs.isOpen);
         setIsOpen = getIsOpen.assign;

         $scope.$watch(getIsOpen, function(value) {
         console.log("watch getIsOpen in init");
         scope.isOpen = !!value;
         });
         }
         */

      };

    }],
    link: function ($scope, iElement, iAttrs, ctrl) {

      var searchBoxField = iElement[0].querySelector('.search-box-field');
      var openClass = searchBoxConfig.openClass;
      var activeClass = searchBoxConfig.activeClass;
      var options;
      var setIsOpen = angular.noop;

      $scope.opened = false;

      ctrl.init(iElement);

      iElement.bind('click', function(e) {
        console.log('click on search box');
        $rootScope.$broadcast("documentClicked", angular.element(e.target));

        var openTarget = angular.element($('#' + iAttrs.searchBoxMenu));

        if (searchBoxService.menuElement != null && openTarget != undefined && searchBoxService.menuElement.attr('id') !== openTarget.attr('id')) {
          close();
        }

        searchBoxService.menuElement = openTarget;
        searchBoxService.element = iElement;

        // e.preventDefault();
        e.stopPropagation();

        if (toggle()) {
          // console.log($('.invisible-input').outerHTML);
          $('input').focus();  // TODO refactor it the Angular way
        }else{
          $('.invisible-input').val(" ");
        }
      });

      /*function toggle(param) {
       scope.isOpen = arguments.length ? !!param : !scope.isOpen;
       return scope.isOpen;
       }; */

      function toggle() {
        if ($scope.opened) {
          close();
        } else {
          open();
        }
        return $scope.opened;
      }

      function open() {
        if (!$scope.opened) {
          $scope.$apply(function() {
            // searchBoxService.menuElement.addClass(openClass);
            searchBoxService.element.addClass(openClass);
            $scope.opened = true;
          });
        }
      }

      function close() {
        $scope.$apply(function() {
          // searchBoxService.menuElement.removeClass(openClass);
          searchBoxService.element.removeClass(openClass);
          $scope.opened = false;
          clearCurrentOption();
        });
      }

      function clearCurrentOption() {
        if ($scope.currentOption) {
          angular.element($scope.currentOption).removeClass(activeClass);
          delete $scope.currentOption;
        }
      }

      angular.element(document.getElementById(iAttrs.searchBoxMenu)).bind('mouseenter', function() {
        clearCurrentOption();
      });

      $document.bind('keydown', function(e) {

        if ( /* !$scope.disabled() && */ ($scope.opened || document.activeElement === searchBoxField) && [9, 27, 40, 38, 13].indexOf(e.keyCode) !== -1)
        {

          if(options){ // Reload options as they may have been filtered
            options = getOptions();
          }

          searchBoxService.element = iElement;
          searchBoxService.menuElement = $('#' + iAttrs.searchBoxMenu);

          if (e.keyCode === 9) { // Tab
            close();
            return;
          } else {
            e.preventDefault();
            e.stopPropagation();
          }

          if (e.keyCode === 27) { // Escape
            close();
          } else if (e.keyCode === 40) { // Down
            nextOption();
          } else if (e.keyCode === 38) { // Up
            previousOption();
          } else if (e.keyCode === 13) { // Enter

            if ($scope.opened && document.activeElement != searchBoxField) {
              if (searchBoxService.menuElement.find('.is-hover:first')[0] !== undefined) {
                $scope.currentOption = searchBoxService.menuElement.find('.is-hover:first')[0];
              }
              if ($scope.currentOption !== undefined){
                $scope.currentOption.click();
              }
            } else if (!$scope.opened && document.activeElement === searchBoxField) {
              open();
            }

          }
        }
      });

      $document.bind('click', function(e) {
        $rootScope.$broadcast("documentClicked", angular.element(e.target));
        if ($scope.opened && e.target !== searchBoxService.menuElement) {
          close();
        }
      });

      function getOptions() {
        return Array.prototype.map.call(searchBoxService.menuElement.find('.menuitem'), function(option) {
          return option;
        });
      }

      function nextOption() {
        open();
        if (!options) {
          options = getOptions();
          if (searchBoxService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = searchBoxService.menuElement.find('.is-hover:first')[0];
          }else{
            $scope.currentOption = options[0];
          }
        } else {
          if (searchBoxService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = searchBoxService.menuElement.find('.is-hover:first')[0];
          }
          var index = options.indexOf($scope.currentOption) + 1;
          clearCurrentOption();
          $scope.currentOption = options.length > index ? options[index] : options[0];
        }
        angular.element($scope.currentOption).addClass(activeClass);

        searchBoxService.menuElement.scrollTop = $scope.currentOption.offsetTop;
      }

      function previousOption() {
        open();
        if (!options) {
          options = getOptions();
          if (searchBoxService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = searchBoxService.menuElement.find('.is-hover:first')[0];
          }else{
            $scope.currentOption = options[0];
          }
        } else {
          if (searchBoxService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = searchBoxService.menuElement.find('.is-hover:first')[0];
          }
          var index = options.indexOf($scope.currentOption) - 1;
          clearCurrentOption();
          $scope.currentOption = index >= 0 ? options[index] : options[options.length - 1];
        }
        angular.element($scope.currentOption).addClass(activeClass);

        searchBoxService.menuElement.scrollTop = $scope.currentOption.offsetTop;
      }

      $('.keep-open').click(function(event){
        $rootScope.$broadcast("documentClicked", angular.element(event.target));
        event.stopPropagation();
      }); // TODO refactor the Angular way

    }
  };
}]);

app.service('searchBoxService', ['$document', function($document) {

  var openScope = null;

  this.open = function( searchBoxScope ) {

    console.log("service: open");

    if ( !openScope ) {
      $document.bind('click', closeSearchBox);
      $document.bind('keydown', escapeKeyBind);
    }

    if ( openScope && openScope !== searchBoxScope ) {
      openScope.isOpen = false;
    }

    openScope = searchBoxScope;
  };

  this.close = function( searchBoxScope ) {
    if ( openScope === searchBoxScope ) {
      openScope = null;
      $document.unbind('click', closeSearchBox);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeSearchBox = function( evt ) {
    var toggleElement = openScope.getToggleElement();
    if ( evt && toggleElement && toggleElement[0].contains(evt.target) ) {
      return;
    }

    openScope.$apply(function() {
      openScope.isOpen = false;
    });
  };

  var escapeKeyBind = function( evt ) {
    console.log(evt.which);
    if ( evt.which === 27 ) {
      openScope.focusToggleElement();
      closeSearchBox();
    }
  };

}]);

app.directive('searchBoxToggle', ['$rootScope', '$location', function($rootScope, $location) {
  return {
    require: '?^searchBox',
    link: function(scope, element, attrs, searchBoxCtrl) {
      if ( !searchBoxCtrl ) {
        return;
      }

      searchBoxCtrl.toggleElement = element;

      var toggleSearchBox = function(event) {
        $rootScope.$broadcast("documentClicked", angular.element(event.target));
        event.preventDefault();

        if ( !element.hasClass('disabled') && !attrs.disabled ) {
          scope.$apply(function openSubMenu() {
            var $parent = $(this).parent();
            console.log("click on arrow");
            if ($('.sfield-2.has-dropdown').hasClass("open") == true) {
              console.log("Had open class");
              closeAllSubMenus();
              return false;
            } else {
              closeAllSubMenus();
              $parent.addClass('open');
              console.log("ouverture du menu");
              $('.sfield-2.has-dropdown').addClass('open');
              $(this).find('div.filter-fieldset').click(function(e) { stopPropagation(element, e);});
              $(".unclickable, .formarea, .action-item").click(function(e) { stopPropagation(element, e); }); // je ne ferme pas les menus sur click sur les items qui sont unclickable ou les formarea
              $("button.search-button").click(function (e) {
                apply_filters($location, scope);
              });
              $(document).one('click', {button: $(this)}, function() { closeAllSubMenus(); }); // fermeture sur n'importe quel autre click
              // $parent.find("input.invisible-input").focus();
              return false;
            }
          });
        }
      };

      function stopPropagation(element, event){
        // console.log("Broadcast");
        // $rootScope.$broadcast("documentClicked", angular.element(event.target));
        console.log("Clic sur "+element);
        event.stopPropagation();
      }

      function apply_filters(location, scope){
        location.path('issues/filters').search(scope.current.filters);
      }

      function closeAllSubMenus() {
        // $(".search-fieldset .has-dropdown").find("input").val("");
        $(".search-fieldset .has-dropdown").removeClass('open');
        $(".search-fieldset .has-dropdown").find(".menuitem").removeClass("is-hover");
        console.log("fermeture des menus");
        // closeAllOptionsMenus()
      }

      element.bind('click', toggleSearchBox);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(searchBoxCtrl.isOpen, function( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleSearchBox);
      });
    }
  };
}]);

app.controller('searchBoxController', ['$scope', '$rootScope', '$attrs', '$parse', 'searchBoxConfig', 'searchBoxService', '$animate', function($scope, $rootScope, $attrs, $parse, searchBoxConfig, searchBoxService, $animate) {

  var self = this,
    openClass = searchBoxConfig.openClass,
    getIsOpen,
    setIsOpen = angular.noop,
    scope = $scope.$new(),  // create a child scope so we are not polluting original one;
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

  this.init = function (element){

    self.$element = element;

    console.log('init');

    if ( $attrs.isOpen ) {

      console.log('attr is open');

      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        console.log("watch getIsOpen in init");
        scope.isOpen = !!value;
      });
    }

  };

  $('.keep-open').click(function(event){
    $rootScope.$broadcast("documentClicked", angular.element(event.target));
    event.stopPropagation();
  }); // TODO refactor the Angular way


  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  this.toggle = function( open ) {

    console.log("toggle isOpen");

    return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
  };

  scope.getToggleElement = function() {
    console.log("get toggle element");
    return self.toggleElement;
  };

  scope.focusToggleElement = function() {
    if ( self.toggleElement ) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function( isOpen, wasOpen ) {

    console.log("isOpen has changed");

    $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

    if ( isOpen ) {
      scope.focusToggleElement();
      searchBoxService.open( scope );
    } else {
      searchBoxService.close( scope );
    }

    setIsOpen($scope, isOpen);
    if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
      toggleInvoker($scope, { open: !!isOpen });
    }
  });

  $scope.$on('$locationChangeSuccess', function() {

    console.log("$locationChangeSuccess");

    scope.isOpen = false;
  });

  $scope.$on('$destroy', function() {
    scope.$destroy();
  });

}]);
