angular.module('app.money.mask', []).directive('appMoneyMask', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.maskMoney({symbol:"R$",decimal:",",thousands:".",precision:2}).keyup(function(){
                    ngModelCtrl.$setViewValue($(this).val());
                    scope.$apply();
                });
            });
        }
    }
});