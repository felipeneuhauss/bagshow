izieGallery = {
    small: function() {
        //* small gallery grid
        $('#small_grid ul').imagesLoaded(function() {
            // Prepare layout options.
            var options = {
                autoResize: true, // This will auto-update the layout when the browser window is resized.
                container: $('#small_grid'), // Optional, used for some extra CSS styling
                offset: 6, // Optional, the distance between grid items
                itemWidth: 120, // Optional, the width of a grid item (li)
                flexibleItemWidth: false
            };

            // Get a reference to your grid items.
            var handler = $('#small_grid ul li');

            // Call the layout function.
            handler.wookmark(options);

            $('#small_grid ul li > a').attr('rel', 'gallery').colorbox({
                maxWidth	: '80%',
                maxHeight	: '80%',
                opacity		: '0.2',
                loop		: false,
                fixed		: true
            });
        });
    }
};

