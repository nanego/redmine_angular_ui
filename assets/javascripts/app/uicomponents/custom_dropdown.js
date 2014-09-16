'use strict';

var app = angular.module('myApp.customdropdown',[]);

app.constant('customDropdownConfig', {
  openClass: 'open'
});

app.directive('customDropdown', function() {

  return {
    controller: 'customDropdownController',
    link: function (scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init(element);
    }
  };

});

app.service('customDropdownService', ['$document', function($document) {

  var openScope = null;

  this.open = function( dropdownScope ) {
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
      scope = $scope.$new(); // create a child scope so we are not polluting original one;

  this.init = function (element){

    self.$element = element;

    if ( $attrs.isOpen ) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }

  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.$watch('isOpen', function( isOpen, wasOpen ) {
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

}] );

