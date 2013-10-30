
/**
 * Created with JetBrains PhpStorm.
 * User: felipeneuhauss
 * Date: 19/06/13
 * Time: 10:11
 * To change this template use File | Settings | File Templates.
 */

var urlManipulator = {
    getUrlParam : function(sParam){
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return decodeURIComponent(sParameterName[1]);
            }
        }
    }
};
