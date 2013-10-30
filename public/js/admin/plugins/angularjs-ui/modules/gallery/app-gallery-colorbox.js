angular.module('app.gallery.colorbox', []).directive('colorbox', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs) {
            $(function(){
                console.log(attrs)
                element.colorbox(attrs);
            });
        }
    }
});