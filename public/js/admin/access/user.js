// Voli web
var promise = Kinvey.init({
    'appKey': 'YOUR-APP-KEY',
    'appSecret': 'YOUR-APP-SECRET'
});


promise.then(function(activeUser) {
    if (!activeUser) {
        window.location.href = "/login";
    } else {
        $('.username').html(activeUser.email);
        $('.userImageURL').src(activeUser.imageURL);
    }
}, function(error) {
    //window.location.href = "/login";

});
$(document).ready(function(){
    $('.logout').click(function(){
        var user = Kinvey.getActiveUser();
        if(null !== user) {
            var promise = Kinvey.User.logout({
                success: function() {
                    window.location.href = "/login";
                }
            });
        }
    });
});