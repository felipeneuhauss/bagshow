(function($){
"use strict";
/* Sticky Menu */
var BoxmeStickyMenu = function(){
	var winwidth = $(window).width();
	if(winwidth > 960){
	$('#inside-header, #head-box').data('size','big');
	$(window).scroll(function(){
	    if($(document).scrollTop() > 0)
	    {
	        if($('#inside-header, #head-box').data('size') == 'big')
	        {
	            $('#inside-header, #head-box').data('size','small');
	            $('.head-social-box').stop().fadeOut({
	            },600);
	            $('#inside-header, #head-box').stop().animate({
	                height:'50px'
	            },600);
	            $('#inside-header .logo img').stop().animate({
	            	marginTop:'-8px',
	                width:'100px'
	            },600);
	            $('#head-box .logo img').stop().animate({
	            	marginTop:'3px',
	                width:'100px'
	            },600);
	            $('#inside-header .menu').stop().animate({
	               	top:'-25px'
	            },600);
	            $('#head-box .menu').stop().animate({
	                top:'-15px'
	            },600);
	        }
	    }
	    else
	    {
	        if($('#inside-header, #head-box').data('size') == 'small')
	        {
	            $('#inside-header, #head-box').data('size','big');
	            $('.head-social-box').stop().fadeIn({
	            },600);
	            $('#inside-header, #head-box').stop().animate({
	                height:'100px'
	            },600);
	            $('#inside-header .logo img').stop().animate({
	            	marginTop:'0',
	                width:'100%'
	            },600);
	            $('#head-box .logo img').stop().animate({
	            	marginTop:'0px',
	                width:'100%'
	            },600);
	            $('#inside-header .menu').stop().animate({
	                top:'0px'
	            },600);
	            $('#head-box .menu').stop().animate({
	                top:'0px'
	            },600);
	        
	        }  
	    }
	});
	}
}
/* Sticky Menu */
/* Chart Skills */
var BoxmePieChart = function(){
$('.percentage').easyPieChart({
    animate: 1000,
    barColor: "#f2836b",
    trackColor: "#F3F3F3",
    scaleColor: false,
    lineCap: 'butt',
    lineWidth: 25,
    size: 165
});
}
/* Chart Skills */
/* Scroll to top button */
var BoxmeScrollTop = function(){
	$(window).scroll(function(){
	if ($(this).scrollTop() > 500) {
	$('.scrollup').fadeIn();
	} else {
	$('.scrollup').fadeOut();
	}
	});
	$('.scrollup').click(function(){
	$("html, body").animate({ scrollTop: 0 }, 600);
	return false;
	});
}
/* Scroll to top button */
/* Smooth scroll for anchor links */
var BoxmeScrollForAnchor = function(){
	$('.smooth').bind('click.smoothscroll',function (e) {
	    e.preventDefault();
	    var target = this.hash,
	    $target = $(target);
	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 1000, 'swing');
	});
}
/* Smooth scroll for anchor links */
/* Search Start */
var BoxmeSearch = function(){
	$('#wrapper').click(function() {
	    $('.search-box input').animate({width: 0}, 200, function(){
	    	$('.search-box input').css('display', 'none');
	    });
	});
	$('.search').click(function(event){
		$('.search-box input').css('display', 'block').animate({width: 150}, 200);
		$('.search-box input').focus();
		event.preventDefault();
		event.stopPropagation();
	});
}
/* Search Finish */
/* Menu Start */
var BoxmeMenu = function(){
	$('#site-menu').superfish({
		delay:       100,                              // one second delay on mouseout
		animation:   {opacity:'show',height:'show'},   // fade-in and slide-down animation
		speed:       100,                              // animation speed
		speedOut:    50,                                // out animation speed
	});
}
/* Menu Finish */
/* Animation Start */
var BoxmeAnimation = function(){
	$(window).scroll(function() {
		$(".animated-area").each(function() {
			if($(window).height() + $(window).scrollTop() - $(this).offset().top > 0) {
				$(this).trigger("animate-it");
			}
		});
	});
	$(".animated-area").on("animate-it", function() {
		var cf = $(this);
		cf.find(".animated").each(function() {
			$(this).css("-webkit-animation-duration","0.6s");
			$(this).css("-moz-animation-duration","0.6s");
			$(this).css("-ms-animation-duration","0.6s");
			$(this).css("animation-duration","0.6s");
			$(this).css("-webkit-animation-delay",$(this).attr("data-animation-delay"));
			$(this).css("-moz-animation-delay",$(this).attr("data-animation-delay"));
			$(this).css("-ms-animation-delay",$(this).attr("data-animation-delay"));
			$(this).css("animation-delay",$(this).attr("data-animation-delay"));
			$(this).addClass($(this).attr("data-animation"));
		});
		
		cf.find(".animated-skills").each(function() {
			$(this).css("width",$(this).attr("data-skills-width"));
		});
		
		BoxmePieChart();
	});
}
/* Animation Finish */
/* Tab Start */
var BoxmeTabs = function(){
	$('.tabbed-area a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	})
	$('.panel-style1').click(function(){
		$('.panel-boxme').find('.panel-style1').removeClass('active');	
		$('.panel-boxme').find('.plus-box').html('+');		
		$(this).addClass('active');
		$(this).find('.plus-box').html('-');
	});
}
/* Tab Finish */
/* prettyPhoto Start */
var BoxmeLightbox = function(){
	$("a[class^='prettyPhoto']").prettyPhoto({social_tools:false,deeplinking:false});
}
/* prettyPhoto Finish */
/* Parallax */
var BoxmeParallax = function(){
	$('.parallax-area').parallax("50%", 0.4);
}
/* Parallax */
/* Google map */
var BoxmeGmap = function(){

    var map = new GMaps({
        el: '#map',
        lat: -15.863172,
        lng: -48.076444
    });
    map.addMarker({
        lat: -15.863172,
        lng: -48.076444,
        title: 'Marker with InfoWindow',
        infoWindow: {
            content: '<p>Central Park</p>'
        }
    });

    var minimap = new GMaps({
        el: '#mini-map',
        lat: -15.863172,
        lng: -48.076444
    });
    minimap.addMarker({
        lat: -15.863172,
        lng: -48.076444,
        title: 'Marker with InfoWindow',
        infoWindow: {
            content: '<p>Central Park</p>'
        }
    });
}
/* Google map */
/* Ajax Contact Form */
var BoxmeContact = function(){
	$(function(){
	$('#ajax-contact-form').submit(function(e){
	e.preventDefault();
	  jQuery.ajax({
	  type: 'POST',
	  url: 'mail.php',
	  data: $('#ajax-contact-form').serialize(),
	  error:function(){ $('.contact-input-area').html("Bir hata algılandı."); }, //Hata veri
	  success: function(veri) { $('.contact-input-area').html(veri);} //Başarılı 
	  });
	});
	});
}
/* Ajax Contact Form */

$(document).ready(function() {
BoxmeStickyMenu();
BoxmeScrollTop();
BoxmeScrollForAnchor();
BoxmeSearch();
BoxmeMenu();
BoxmeAnimation();
BoxmeTabs();
BoxmeLightbox();
BoxmeParallax();
BoxmeGmap();
BoxmeContact();
});
})(jQuery);
$(window).load(function(){
/* Carousels Start */
$(".bqarea").carouFredSel({
	responsive: true,
	auto: false,
	pagination: {
		container: '#cust-lists, #cust-lists2',
		event: 'click',
		anchorBuilder : false
	}
});
$("#prtfl-list").carouFredSel({
	responsive: true,
	scroll: 1,
	auto: true,
	items: {
		width: 340,
		visible: {
			min: 1,
			max: 15
		}
	},
	prev: '#prev',
	next: '#next',
	swipe: {
		onTouch: true
	}
});

$("#prtfl-cv-list").carouFredSel({
    responsive: true,
    scroll: 1,
    auto: true,
    items: {
        width: 340,
        visible: {
            min: 1,
            max: 15
        }
    },
    prev: '#prev',
    next: '#next',
    swipe: {
        onTouch: true
    }
});

$("#about-carousel").carouFredSel({
	responsive: true,
	items: 1,
	scroll: {
        fx: "crossfade"
    },
	auto: true,
	prev: '.prev',
	next: '.next',
	swipe: {
		onTouch: true
	},
	pagination: "#bullets"
});
var crsldelay = 0;
$("#carousel-style1").carouFredSel({
	responsive: true,
	items: 1,
	scroll: {
		fx: "crossfade"
	},
	auto:true,
	pagination:{
		container: "#carousel-style1-thumb",
		anchorBuilder: function( nr ) {
		crsldelay = crsldelay+0.3;	
			var src = $("img", this).attr( "src" );
			return '<img class="animated" src="' + src + '" data-animation="fadeInUp" data-animation-delay="'+ crsldelay +'s" />';
		}
	}
});
$(".bqarea-style2").carouFredSel({
	responsive: true,
	auto: true,
	scroll:{
		fx: "crossfade"
	}
});
/* Carousels Finish */
});
/* Responsive Menu Start */
var navigation = responsiveNav("#responsive-menu", {
	animate: true,        // Boolean: Use CSS3 transitions, true or false
	transition: 400,      // Integer: Speed of the transition, in milliseconds
	label: "",        // String: Label for the navigation toggle
	insert: "after",      // String: Insert the toggle before or after the navigation
	customToggle: "",     // Selector: Specify the ID of a custom toggle
	openPos: "relative",  // String: Position of the opened nav, relative or static
	jsClass: "js",        // String: 'JS enabled' class which is added to <html> el
	init: function(){},   // Function: Init callback
	open: function(){},   // Function: Open callback
	close: function(){}   // Function: Close callback
});
/* Responsive Menu Finish */
/* Isotope */
var $container = $('.portfolio-box');
var $filter = $('.portfolio-filters');
$container.isotope({
    filter : '*',
    layoutMode : 'sloppyMasonry',
    animationOptions : {duration: 400}
});
$filter.find('a').click(function() {
    var selector = $(this).attr('data-filter');
    $filter.find('a').removeClass('active');
    $(this).addClass('active');
    $container.isotope({ 
        filter: selector,
        animationOptions:{
        	animationDuration: 400,
        	queue: false
        }
    });
    return false;
});
/* Isotope */