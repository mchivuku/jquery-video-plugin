/**
 * Created by mchivuku on 11/3/14.
 */


;(function ($, window, document, undefined) {

    var defaults = {
        reloadFrame: 1,
        eventsTrack: ['Playing', 'Ended', 'Buffering', 'Cued'],
        showTitle: true,
        debug: true
    };

    var  options;

    $.iet_track_youtube_video = function (element, options) {

        element = element;
        options = $.extend({}, defaults, options);

        /* Plugin Properties */
        var videoArray = [];
        var playerArray = [];
        var videoTitle = [];
        var pauseFlagArray = [];
        var i = 0;


        this.init = function () {
            debug('Init Function');
            // initialize the parameters for the video
            initialize($(element));

        };

        function initialize(element){
            var newOrigin;

            if ((element).attr('src')) {

                var video = $(element);
                var vidSrc = video.attr('src');

                if (options.reloadFrame) {

                    var regex1 = /(?:https?:)?\/\/www\.youtube\.com\/embed\/([\w-]{11})(\?)?/;
                    var SourceCheckA = vidSrc.match(regex1);
                    if (SourceCheckA[2] == "?") {
                        regex2 = /enablejsapi=1/;
                        var SourceCheckB = vidSrc.match(regex2);

                        // if the enablejsapi is not set - set it
                        if (!SourceCheckB) {
                            vidSrc = vidSrc + "&enablejsapi=1";
                        }

                        var regex2 = /origin=.*/;
                        var SourceCheckC = vidSrc.match(regex2);
                        if (SourceCheckC) {
                            for (j = 0; j < SourceCheckC.length; j++) {
                                newOrigin = "origin=" + window.location.hostname;
                                vidSrc = vidSrc.replace(regex2, newOrigin);
                            }
                        } else {
                            vidSrc = vidSrc + "&origin=" + window.location.hostname;
                        }
                    } else {
                        vidSrc = vidSrc + "?enablejsapi=1&origin=" + window.location.hostname;
                    }

                    video.attr('src', vidSrc);
                    debug('initialized src' + vidSrc);
                }


                var regex = /(?:https?:)?\/\/www\.youtube\.com\/embed\/([\w-]{11})(?:\?.*)?/;
                var matches = vidSrc.match(regex);
                if (matches && matches.length > 1) {

                    videoArray[i] = matches[1];
                    video.attr('id', matches[1]);

                    $.getJSON('http://gdata.youtube.com/feeds/api/videos/' + videoArray[i] + '?v=2&alt=json', function (data, status, xhr) {
                        videoTitle[i] = data.entry.title.$t;
                    });

                    initializePlayer(i);

                }
            }
        }


        function initializePlayer(i){

            playerArray[i] = new YT.Player(videoArray[i], {
                videoId: videoArray[i],
                events:{
                    'onStateChange':function(event){
                        var videoURL = event.target.getVideoUrl();
                        var regex = /v=(.+)$/;
                        var matches = videoURL.match(regex);

                        videoID = matches[1];
                        thisVideoTitle = '';
                        for (j = 0; j < videoArray.length; j++) {

                            if (videoArray[i] == videoID) {

                                thisVideoTitle = videoTitle[i] || "";

                                if (thisVideoTitle.length > 0) {
                                    thisVideoTitle = thisVideoTitle + " | " + videoID;
                                } else {
                                    thisVideoTitle = videoID;
                                }
                                if (event.data == YT.PlayerState.PLAYING
                                    && $.inArray('Playing',options.eventsTrack)>=0) {
                                    _gaq.push(['_trackEvent', 'Videos', 'Play', thisVideoTitle]);
                                    pauseFlagArray[i] = false;
                                    debug('Sending Playing event');
                                }

                                if (event.data == YT.PlayerState.ENDED && $.inArray('Ended',options.eventsTrack)>=0) {

                                    _gaq.push(['_trackEvent', 'Videos', 'Watch to End', thisVideoTitle]);
                                    debug('Sending ended event');

                                }

                                if (event.data == YT.PlayerState.PAUSED && this.pauseFlagArray[i] !== true &&
                                    $.inArray('Paused',options.eventsTrack)>=0) {

                                    _gaq.push(['_trackEvent', 'Videos', 'Pause', thisVideoTitle]);
                                    pauseFlagArray[i] = true;
                                    debug('Sending paused event');
                                }

                                if (event.data == YT.PlayerState.BUFFERING &&
                                    $.inArray('Buffering',options.eventsTrack)>=0) {

                                    _gaq.push(['_trackEvent', 'Videos', 'Buffering', thisVideoTitle]);
                                    debug('Sending buffering event');


                                }

                                if (event.data == YT.PlayerState.CUED &&
                                    $.inArray('Cued',options.eventsTrack)>=0) {
                                    _gaq.push(['_trackEvent', 'Videos', 'Cueing', thisVideoTitle]);
                                    debug('Sending cued event');

                                }

                            }
                        }

                    }
                }

            });

        }

        this.init();


        function debug(logInfo){

            if(options.debug==true){
                console.log(logInfo);
            }

        }


    };

    // plugin wrapper to avoid multiple instantiations of plugin
    $.fn.iet_track_youtube_video = function (options) {
        return this.each(function () {

            // if plugin has not already been attached to the element
            if (undefined === $(this).data('iet_track_youtube_video')) {

                var plugin = new $.iet_track_youtube_video(this,options);
                $(this).data('pluginName', plugin);

            }

        });
    };


})(jQuery, window, document);
