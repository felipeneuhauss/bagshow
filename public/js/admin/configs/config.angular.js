/**
 * Solve the problem with twig
 */
var angularApp = angular.module('app', ['ui.utils']).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

var angularApp = angular.module('angularApp', ['app'] );
