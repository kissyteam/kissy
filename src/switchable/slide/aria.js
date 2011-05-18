/**
 * aria support for slide
 * @author:yiminghe@gmail.com
 */
KISSY.add("switchable/slide/aria", function(S, DOM, Event, Aria, Slide) {

    var Switchable = S.Switchable;
    DOM = S.DOM;
    Event = S.Event;
    Aria = Switchable.Aria;
    Slide = S.Slide;
//    var KEY_PAGEUP = 33;
//    var KEY_PAGEDOWN = 34;
//    var KEY_END = 35;
//    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    // var KEY_TAB = 9;

    // var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    // var KEY_ENTER = 13;
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
                var i = 0;
                var activeIndex = self.activeIndex;
                S.each(triggers, function(t) {
                    setTabIndex(t, -1);
                });
                S.each(panels, function(p) {
                    setTabIndex(p, activeIndex == i ? "0" : "-1");
                    DOM.attr(p, "role", "option");
                });

                var content = self.content;

                DOM.attr(content, "role", "listbox");

                Event.on(content, "keydown", _contentKeydown, self);

                setTabIndex(panels[0], 0);
                if (activeIndex > -1) {
                    self.__slideIndex = activeIndex;
                }

                self.on("switch", function(ev) {
                    var index = ev.currentIndex,
                        last = self.activeIndex;

                    // 其实只有第一次有用
                    self.__slideIndex = index;

                    if (last != -1) {
                        setTabIndex(panels[last], -1);
                    }
                    setTabIndex(panels[index], 0);
                });
            }
        });

    function _contentKeydownProcess(e) {
        var self = this,
            key = e.keyCode,
            panels = self.panels,
            __slideIndex = self.__slideIndex,
            dest = __slideIndex;
        switch (key) {

            case KEY_DOWN:
            case KEY_RIGHT:

                dest++;
                if (dest == panels.length) {
                    dest = 0;
                }
                self.__slideIndex = dest;

                self.switchTo(dest, FORWARD, undefined, function() {
                    panels[dest].focus();
                });
                e.halt();
                break;

            case KEY_UP:
            case KEY_LEFT:

                dest--;
                if (dest == -1) {
                    dest = panels.length - 1;
                }
                self.__slideIndex = dest;

                self.switchTo(dest, BACKWARD, undefined, function() {
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

});
/**
 2011-05-12 承玉：add support for aria & keydown

 <h2>键盘操作</h2>
 <ul class="list">
 <li>tab 进入卡盘时，停止自动播放</li>
 <li>上/左键：当焦点位于卡盘时，切换到上一个 slide 面板</li>
 <li>下/右键：当焦点位于卡盘时，切换到下一个 slide 面板</li>
 <li>tab 离开卡盘时，开始自动播放</li>
 </ul>
 **/