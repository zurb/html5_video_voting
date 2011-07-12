(function($) {

    $.fn.poptastic = function(options) {

        var settings = {
            'video_id': null,
            'autoplay': false,
            'keycode': 32,
            'width': 640,
            'height': 340
        };

        return this.each(function() {

            var $this = $(this),
            autoplay = 0,
            dblclick = false,
			ifrID = $(this).attr('id') + 'Window';
            $(window).focus();
            if (options) {
                $.extend(settings, options);
            }
            (settings.autoplay == false) ? autoplay = 0: autoplay = 1;
			thisIfr = document.getElementById(ifrID);
            if (thisIfr.src == "about:blank") {
                thisIfr.contentWindow.document.body.innerHTML = 'Set a video ID.';
            }
            $(window).keypress(function(e) {
                if (e.which == settings.keycode) {
                    e.preventDefault();
                }
            });
            $(this).width(thisIfr.style.width);
            $(this).height(thisIfr.style.height);
			$(this).children('iframe')[0].focus();
            $(this).mouseenter(function(e) {
                $(this).children('iframe')[0].contentWindow.postMessage(0, '*');
                $(this).children('iframe')[0].focus();
                $(this).css('border-color', 'rgba(202,110,210, 0.3)').fadeIn(300);
            });
            $(this).mouseleave(function() {
                $(this).children('iframe')[0].contentWindow.postMessage(1, '*');
                $(this).css('border-color', 'rgba(255,255,255, 0.3)').fadeIn(300);
            });
			$(window).click(function (e) {
				$this.children('iframe')[0].contentWindow.postMessage(2, '*');
			});
        });

    };
})(jQuery);