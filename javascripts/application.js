var poptastic = $(function() {

    /* DEFINES */

    var vid = $('.video'),
    v = vid[0],
    chart = $('#chart'),
    sliderContainer = $('#bar-wrapper'),
	sliderContainerWidth = v.width - 76;
    slider = $('#bar'),
    paddle = $('#paddle'),
    bufferBar = $('#buffer'),
    volume = $('#volume'),
    bars = vid.attr('data-bars') || 96,
    ip = vid.attr('data-ip') || null,
    play = $('#play'),
    keycode = parseInt(vid.attr('data-keycode')) || 32,
    vidObj = null,
    paddleWidth = 12,
    votable = true,
    r = Raphael("chart"),
    fin = function() {
        this.flag = r.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
        this.bar.attr({
            fill: "#ffd90f"
        });
    },
    fout = function() {
        this.flag.animate({
            opacity: 0
        },
        300,
        function() {
            this.remove();
        });
        this.bar.attr({
            fill: "#0f75ff"
        });
    };
	
	
	/* INITIAL STATE */
	
    function setDefaultState(width, height) {
		chart.width(width);
        v.volume = 1;
		sliderContainer.width(sliderContainerWidth);
        slider.css('maxWidth', sliderContainer.width() - paddleWidth);
        v.addEventListener("timeupdate", updatePlayhead, false);
        updateVotes();
        if (typeof window.addEventListener != 'undefined') {
            window.addEventListener('message', receiver, false);
        } else if (typeof window.attachEvent != 'undefined') {
            window.attachEvent('message', receiver);
        }
		setPlayhead(paddle, 20);
    }

    function receiver(e) {
        if (e.data == 0) {
            chart.fadeIn(300);
        } else if (e.data == 2) {
			v.pause();
            play.css('background', 'url(../images/134.png) top left no-repeat');
		} else {
            chart.fadeOut(300);
        }
    }

    /* VOTE FUNCTIONS */

    function record(time, type) {
        vidObj = {
            "vote": {
                "duration": v.duration,
                "time": time,
                "keycode": type,
                "video_id": v.id,
                "ip_address": ip,
            }
        };
        return vidObj;
    }
    function setPlayhead(playhead, x) {
        v.currentTime = ((x * v.duration) / (sliderContainer.width() - paddleWidth));
        playhead.css('left', '0');
    }
    function updatePlayhead() {
        var seek = (sliderContainer.width() - paddleWidth) * (v.currentTime / v.duration);
        slider.width(seek);
        updateBuffer(sliderContainer.width());
    }
    function updateBuffer(s) {
        var lastBuffered = v.buffered.end(v.buffered.length - 1),
        buffer = s - (s * (lastBuffered / v.duration));
        bufferBar.width(buffer);
    }
    function go() {
        setPlayhead(paddle, this.bar.x - paddleWidth);
    }
    function updateVotes() {
		$.ajax({
			url: 'http://videofeedback.zurb.com/pullvotes/' + v.id + '/' + bars + ".json?callback=?",
			type: "GET",
			dataType: "jsonp",
			success: function(data) {
				var obj = $.parseJSON(data),
	            raphaelData = obj;
	            r.clear();
	            r.g.barchart(0, 0, sliderContainer.width(), 100, [raphaelData]).hover(fin, fout).click(go).attr({
	                fill: "#0f75ff"
	            });
				$('#chart svg').css('width', sliderContainer.width())
			}
		});
    }

    /* TIMELINE NAVIGATION */

    paddle.draggable({
        axis: "x",
        containment: "parent",
        opacity: 0.75,
        drag: function(event, ui) {
            v.removeEventListener('timeupdate', updatePlayhead, false);
        },
        stop: function(event, ui) {
            var paddle = $(this).position(),
            x = paddle.left;
            setPlayhead($(this), x);
            v.addEventListener("timeupdate", updatePlayhead, false);
        }
    });
    sliderContainer.click(function(e) {
        var x = e.pageX - this.offsetLeft - 30;
        setPlayhead($(this), x);
    });


    /* VOLUME CONTROLS */

    function setVolume(x) {
        var volumePercent = (x / 22),
        volumeWidth = (22 * volumePercent);
        if (volumePercent > 0.9) {
            volumePercent = 1.0;
            volumeWidth = 22;
        } else if (volumePercent < 0.1) {
            volumePercent = 0.0;
            volumeWidth = 0;
        }
        v.volume = volumePercent;
        volume.children('span').css('width', volumeWidth);
    }
    volume.click(function(e) {
        var x = e.pageX - this.offsetLeft;
        setVolume(x);
    });

    /* KEY EVENTS */

    $(window).keypress(function(e) {
        e.preventDefault();
        if (e.which === keycode && !v.ended && !v.paused && votable) {
            var data = record(v.currentTime, e.which);
			$.ajax({
			  url: "http://videofeedback.zurb.com/votes/create/?callback=?",
			  type: "GET",
			  data: { _method: 'POST', data: data },
			  dataType: "jsonp",
			  success: function() { 
				$('<span class="marker"></span>').css({
			            left: paddle.position().left + 1
			        }).appendTo(sliderContainer);
				updateVotes();
			  },
			  error: function() {
                $('#error').fadeIn(100).delay(1000).fadeOut(100);
			  }
			});
        }
    });

    /* CONTROLS */

    if (v.autoplay) {
        play.css('background', 'url(../images/138.png) top left no-repeat');
    }
    play.click(function(e) {
        e.preventDefault();
        if (v.paused) {
            v.play();
            $(this).css('background', 'url(../images/138.png) top left no-repeat');
        } else {
            v.pause();
            $(this).css('background', 'url(../images/134.png) top left no-repeat');
        }
    });

    /* INIT */
    setDefaultState(v.width, v.height);
});

poptastic;