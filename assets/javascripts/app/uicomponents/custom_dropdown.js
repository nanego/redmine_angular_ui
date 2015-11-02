'use strict';

var app = angular.module('myApp.customdropdown',[]);

app.constant('customDropdownConfig', {
  openClass: 'open',
  activeClass: 'is-hover'
});

app.factory('DropdownService', function() {
  return {
    element: null,
    menuElement: null
  };
});

app.service('customDropdownService', ['$document', function($document) {

  var openScope = null;

  this.open = function( dropdownScope ) {

    console.log("service: open");

    if ( !openScope ) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if ( openScope && openScope !== dropdownScope ) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function( dropdownScope ) {
    if ( openScope === dropdownScope ) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeDropdown = function( evt ) {
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
      closeDropdown();
    }
  };

}]);

app.controller('customDropdownController', ['$scope', '$attrs', '$parse', 'customDropdownConfig', 'customDropdownService', '$animate', function($scope, $attrs, $parse, customDropdownConfig, customDropdownService, $animate) {

  var self = this,
      openClass = customDropdownConfig.openClass,
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
      customDropdownService.open( scope );
    } else {
      customDropdownService.close( scope );
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

app.directive('customDropdown', ['$document', '$animate', 'customDropdownConfig', 'DropdownService', 'customDropdownService', function($document, $animate, customDropdownConfig, DropdownService, customDropdownService) {
  return {
    scope: {
      disabled: '&dropdownDisabled',
      opened: '@'
    },
    controller: ['$timeout', '$scope', '$animate', 'customDropdownConfig', 'customDropdownService', function($timeout, $scope, $animate, customDropdownConfig, customDropdownService){

      var openClass = customDropdownConfig.openClass;
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

      var dropdownField = iElement[0].querySelector('.dropdown-field');
      var openClass = customDropdownConfig.openClass;
      var activeClass = customDropdownConfig.activeClass;
      var options;
      var setIsOpen = angular.noop;

      $scope.opened = false;

      ctrl.init(iElement);

      // Ugly exception with a bunch of JQuery in it... TODO: refactor
      /* changement de compacité pour la vue : gestion du menu */
      if (iAttrs.dropdownMenu == "dropdown-display-types"){
        $('.has-dropdown').on('click', '#view-normal', function(e) {
          $(".table-issues").addClass("normal-table").removeClass("comfortable-table").addClass("compact-table");
          if (!$(this).hasClass("selected-item")) {
            $("div[data-group='view-density']").removeClass("selected-item");
            $(this).addClass("selected-item");
          }
          e.stopPropagation();
        });
        $('.has-dropdown').on('click', "#view-compact", function(e) {
          $(".table-issues").addClass("compact-table").removeClass("normal-table comfortable-table");
          if (!$(this).hasClass("selected-item")) {
            $("div[data-group='view-density']").removeClass("selected-item");
            $(this).addClass("selected-item");
          }
          e.stopPropagation();
        });
        $('.has-dropdown').on('click', "#view-comfortable", function(e) {
          $(".table-issues").addClass("comfortable-table").removeClass("normal-table compact-table");
          if (!$(this).hasClass("selected-item")) {
            $("div[data-group='view-density']").removeClass("selected-item");
            $(this).addClass("selected-item");
          }
          e.stopPropagation();
        });
      }

      iElement.bind('click', function(e) {
        console.log('click on dropdown menu');

        var openTarget = angular.element($('#' + iAttrs.dropdownMenu));
        DropdownService.menuElement = openTarget;
        DropdownService.element = iElement;

        if (DropdownService.menuElement != null && openTarget != undefined && DropdownService.menuElement.attr('id') !== openTarget.attr('id')) {
          close();
        }

        // e.preventDefault();
        e.stopPropagation();

        if (toggle()) {
          // console.log($('.invisible-input').outerHTML);
          $('.custom-dropdown-menu input').focus();  // TODO refactor it the Angular way
        }else{
          $('.invisible-input').val(" ");
        };

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
            // DropdownService.menuElement.addClass(openClass);
            DropdownService.element.addClass(openClass);
            $scope.opened = true;
          });
        }
      }

      function close() {
        $scope.$apply(function() {
          // DropdownService.menuElement.removeClass(openClass);
          DropdownService.element.removeClass(openClass);
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

      angular.element(document.getElementById(iAttrs.dropdownMenu)).bind('mouseenter', function() {
        clearCurrentOption();
      });

      $document.bind('keydown', function(e) {

        if ( /* !$scope.disabled() && */ ($scope.opened || document.activeElement === dropdownField) && [9, 27, 40, 38, 13].indexOf(e.keyCode) !== -1)
        {

          if(options){ // Reload options as they may have been filtered
            options = getOptions();
          }

          DropdownService.element = iElement;
          DropdownService.menuElement = $('#' + iAttrs.dropdownMenu);

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

            if ($scope.opened && document.activeElement != dropdownField) {
              if (DropdownService.menuElement.find('.is-hover:first')[0] !== undefined) {
                $scope.currentOption = DropdownService.menuElement.find('.is-hover:first')[0];
              }
              if ($scope.currentOption !== undefined){
                $scope.currentOption.click();
              }
            } else if (!$scope.opened && document.activeElement === dropdownField) {
              open();
            }

          }
        }
      });

      $document.bind('click', function(e) {
        if ($scope.opened && e.target !== DropdownService.menuElement) {
          close();
        }
      });

      function getOptions() {
        return Array.prototype.map.call(DropdownService.menuElement.find('.menuitem'), function(option) {
          return option;
        });
      }

      function nextOption() {
        open();
        if (!options) {
          options = getOptions();
          if (DropdownService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = DropdownService.menuElement.find('.is-hover:first')[0];
          }else{
            $scope.currentOption = options[0];
          }
        } else {
          if (DropdownService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = DropdownService.menuElement.find('.is-hover:first')[0];
          }
          var index = options.indexOf($scope.currentOption) + 1;
          clearCurrentOption();
          $scope.currentOption = options.length > index ? options[index] : options[0];
        }
        angular.element($scope.currentOption).addClass(activeClass);

        DropdownService.menuElement.scrollTop = $scope.currentOption.offsetTop;
      }

      function previousOption() {
        open();
        if (!options) {
          options = getOptions();
          if (DropdownService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = DropdownService.menuElement.find('.is-hover:first')[0];
          }else{
            $scope.currentOption = options[0];
          }
        } else {
          if (DropdownService.menuElement.find('.is-hover:first')[0] !== undefined) {
            $scope.currentOption = DropdownService.menuElement.find('.is-hover:first')[0];
          }
          var index = options.indexOf($scope.currentOption) - 1;
          clearCurrentOption();
          $scope.currentOption = index >= 0 ? options[index] : options[options.length - 1];
        }
        angular.element($scope.currentOption).addClass(activeClass);

        DropdownService.menuElement.scrollTop = $scope.currentOption.offsetTop;
      }

      $('.keep-open').click(function(event){
        event.stopPropagation();
      }); // TODO refactor the Angular way

    }
  };
}]);

app.directive('dropdownToggle', function() {
  return {
    require: '?^dropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if ( !dropdownCtrl ) {
        return;
      }

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if ( !element.hasClass('disabled') && !attrs.disabled ) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});
