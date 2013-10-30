// Voli web
var promise = Kinvey.init({
    'appKey': 'kid_VPR1Vu_-J9',
    'appSecret': '384c4ebeae2f49c7b02c1b1e865c6182'
});


promise.then(function(activeUser) {
    if (activeUser) {
       window.location.href = "/admin";
    }
}, function(error) {
    window.location.href = "/login";
    });



