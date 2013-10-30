// sample use {{ value | currency:"USD" }}
var filters = angular.module('filters', [])
filters.filter('currency', function() {
    return function(number, currencyCode) {
        var currency = {
                USD: "$",
                GBP: "£",
                AUD: "$",
                EUR: "€",
                CAD: "$",
                BRA: "R$",
                MIXED: "~"
            },
            thousand, decimal, format;
        if ($.inArray(currencyCode, ["USD", "AUD", "CAD", "MIXED"]) >= 0) {
            thousand = ",";
            decimal = ".";
            format = "%s%v";
        } else {
            thousand = ".";
            decimal = ",";
            format = "%s%v";
        };
        return accounting.formatMoney(number, currency[currencyCode], 2, thousand, decimal, format);
    };
});

