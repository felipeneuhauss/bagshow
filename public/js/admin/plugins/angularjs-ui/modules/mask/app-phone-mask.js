angular.module('app.phone.mask', []).directive('appPhoneMask', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.mask("(99) 9999-9999?").keyup(function(){
                    ngModelCtrl.$setViewValue($(this).val());
                    scope.$apply();
                });
            });
        }
    }
});