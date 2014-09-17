'use strict';

var app = angular.module('myApp.customdropdown',[]);

app.constant('customDropdownConfig', {
  openClass: 'open'
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

    console.log($('.invisible-input').outerHTML);
    $('.invisible-input').focus();  // TODO refactor it the Angular way

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

app.directive('customDropdown', function() {
  return {
    controller: 'customDropdownController',
    link: function (scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init(element);
    }
  };
});

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
