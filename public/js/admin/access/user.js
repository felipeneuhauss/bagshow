// Voli web
var promise = Kinvey.init({
    'appKey': 'kid_VPR1Vu_-J9',
    'appSecret': '384c4ebeae2f49c7b02c1b1e865c6182'
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