/**
 * Provides a simple swf based audio implementation,for complex see swfaudio.js and audio.html
 *@author yiminghe@gmail.com(chengyu)
 */
KISSY.add("swfAudioLite", function(S) {

    function SWFAudioLite(swfUrl, container) {
        var params = {
            version: 9.115,
            useExpressInstall: false
        },self = this;
        // ���û�д��룬���Զ����
        if (!container) {
            // ע��container �� style ������ visibility:hidden or display: none, �����쳣
            container = document.body.appendChild(S.DOM.create('<div style="height:0;width:0;overflow:hidden"></div>'));
        }
        self.embeddedSWF = new S.SWF(container, swfUrl || 'niftyplayer.swf', params);
        this._waits = [];

        var timer = setInterval(function() {
            if (self._loaded()) {
                clearInterval(timer);
                timer = null;
                for (var i = 0; i < self._waits.length; i++) {
                    self._waits[i].call(self);
                }
                self._waits = null;
            }
        }, 100);
    }

    // methods
    S.augment(SWFAudioLite, {


        loadUrl : function (url) {
            this.embeddedSWF.callSWF("SetVariable", ["currentSong",url]);
            this.load();
        },

        loadAndPlay : function (url) {
            this.loadUrl(url);
            this.play();
        },

        getState : function () {
            var ps = this.embeddedSWF.callSWF("GetVariable", ["playingState"]);
            var ls = this.embeddedSWF.callSWF("GetVariable", ["loadingState"]);

            // returns
            //   'empty' if no file is loaded
            //   'loading' if file is loading
            //   'playing' if user has pressed play AND file has loaded
            //   'stopped' if not empty and file is stopped
            //   'paused' if file is paused
            //   'finished' if file has finished playing
            //   'error' if an error occurred
            if (ps == 'playing')
                if (ls == 'loaded') return ps;
                else return ls;

            if (ps == 'stopped')
                if (ls == 'empty') return ls;
            if (ls == 'error') return ls;
            else return ps;

            return ps;

        },

        _loaded:function() {
            return this.embeddedSWF.callSWF("PercentLoaded") == 100;
        },
        _ready:function(func) {
            if (this._loaded()) {
                func();
            } else {
                this._waits.push(func);
            }
        },
        on:function(eventName, func) {
            if (eventName == "ready") {
                this._ready(func);
            } else {

                // eventName is a string with one of the following values: onPlay, onStop, onPause, onError, onSongOver, onBufferingComplete, onBufferingStarted
                // action is a string with the javascript code to run.
                //
                // example: niftyplayer('niftyPlayer1').registerEvent('onPlay', 'alert("playing!")');
                try {
                    return this.embeddedSWF.callSWF("SetVariable", arguments);
                }
                catch(e) { // �� swf �쳣ʱ����һ��������Ϣ

                }
            }
        }
    });


    S.each([
        "play"
        ,"load"
        ,"stop"
        ,"pause"
        ,"playToggle"
        ,"reset"
    ], function(methodName) {
        SWFAudioLite.prototype[methodName] = function() {
            try {
                return this.embeddedSWF.callSWF("TCallLabel", ["/",methodName]);
            }
            catch(e) { // �� swf �쳣ʱ����һ��������Ϣ

            }
        }
    });


    S.each([
        "getPlayingState"        // returns 'playing', 'paused', 'stopped' or 'finished'
        ,"getLoadingState"       // returns 'empty', 'loading', 'loaded' or 'error'

    ], function(methodName) {
        SWFAudioLite.prototype[methodName] = function() {
            try {
                return this.embeddedSWF.callSWF("GetVariable", [methodName]);
            }
            catch(e) { // �� swf �쳣ʱ����һ��������Ϣ
                this.fire('error', { message: e });
            }
        }
    });

    S.SWFAudioLite = SWFAudioLite;

});