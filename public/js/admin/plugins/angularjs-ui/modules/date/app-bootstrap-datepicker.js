angular.module('app.bootstrap.datepicker', []).directive('appBootstrapDatepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.datepicker({
                    format:'dd/mm/yyyy',
                    language: 'pt-BR',
                    changeYear: true,
                    changeMonth: true
                }).on('changeDate', function(ev){
                        ngModelCtrl.$setViewValue(moment(ev.date).add('days',1).format('DD/MM/YYYY'));
                        scope.$apply();
                    });
            });
        }
    }
});