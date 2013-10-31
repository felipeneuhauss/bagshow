// Voli web
var promise = Kinvey.init({
    'appKey': 'YOUR-APP-KEY',
    'appSecret': 'YOUR-APP-SECRET'
});


promise.then(function(activeUser) {
    if (activeUser) {
       window.location.href = "/admin";
    }
}, function(error) {
    window.location.href = "/login";
    });



