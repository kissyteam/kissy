/**
 * aria support for slide
 * @author:yiminghe@gmail.com
 */
KISSY.add("switchable/slide/aria", function(S, DOM, Event, Aria, Slide) {

    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;


    var FORWARD = 'forward', BACKWARD = 'backward';
    S.mix(Slide.Config, {
        aria:true
    });

    var setTabIndex = Aria.setTabIndex;
    Slide.Plugins.push({
        name:"aria",
        init:function(self) {
            if (!self.config.aria) return;
            var triggers = self.triggers;
            var panels = self.panels;
            S.each(triggers, function(t) {
                setTabIndex(t, -1);
            });
            S.each(panels, function(p) {
                setTabIndex(p, -1);
                DOM.attr(p, "role", "option");
            });

            var content = self.content;

            DOM.attr(content, "role", "listbox");

            Event.on(content, "keydown", _contentKeydown, self);

            Event.on(content, "focusin", _contentFocusin, self);

            Event.on(content, "focusout", _contentFocusout, self);

            setTabIndex(panels[0], 0);
            self.__slideIndex = 0;
        }
    });

    function _contentFocusin() {
        this.stop && this.stop();
        /**
         * !TODO
         * tab 到时滚动到当前
         */
    }

    function _contentFocusout() {
        this.start && this.start();
    }


    function _contentKeydownProcess(e) {
        var self = this,
            key = e.keyCode,
            panels = self.panels,
            __slideIndex = self.__slideIndex,
            dest = __slideIndex;
        switch (key) {

            case KEY_DOWN:
            case KEY_RIGHT:

                if (self.stop) {
                    self.stop();
                }

                dest++;
                if (dest == panels.length) {
                    dest = 0;
                }
                self.__slideIndex = dest;
                S.log("keydown switchTo : " + dest);
                self.switchTo(dest, FORWARD, undefined, function() {
                    setTabIndex(panels[__slideIndex], -1);
                    setTabIndex(panels[dest], 0);
                    S.log(dest + ": focus");
                    panels[dest].focus();
                });
                e.halt();
                break;

            case KEY_UP:
            case KEY_LEFT:

                if (self.stop) {
                    self.stop();
                }

                dest--;
                if (dest == -1) {
                    dest = panels.length - 1;
                }
                self.__slideIndex = dest;

                self.switchTo(dest, BACKWARD, undefined, function() {
                    setTabIndex(panels[__slideIndex], -1);
                    setTabIndex(panels[dest], 0);
                    panels[dest].focus();
                });
                e.halt();
                break;
        }
    }

    var keyDownTimer;

    function _contentKeydown(e) {
        var self = this,
            t = e.target,
            panels = self.panels;
        if (!S.inArray(t, panels)) return;

        if (keyDownTimer) {
            clearTimeout(keyDownTimer);
            keyDownTimer = undefined;
            S.log("cancel keydown");
        }
        switch (e.keyCode) {
            case KEY_DOWN:
            case KEY_UP:
            case KEY_LEFT:
            case KEY_RIGHT:
                e.halt();
                break;
        }

        keyDownTimer = setTimeout(function() {
            _contentKeydownProcess.call(self, e);
            keyDownTimer = undefined;
        }, 200);
    }

}, {
    requires:["dom","event","../aria",'./base']
});