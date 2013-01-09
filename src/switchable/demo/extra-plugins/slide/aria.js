/**
 *  aria support for slide
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable-ext/slide/aria", function (S, DOM, Event, Switchable) {

    // var KEY_PAGEUP = 33;
    // var KEY_PAGEDOWN = 34;
    // var KEY_END = 35;
    // var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

    // var KEY_TAB = 9;
    // var KEY_SPACE = 32;
    // var KEY_BACKSPACE = 8;
    // var KEY_DELETE = 46;
    // var KEY_ENTER = 13;
    // var KEY_INSERT = 45;
    // var KEY_ESCAPE = 27;

    var Aria = Switchable.Aria;
    var Slide = Switchable.Slide;

    S.mix(Slide.Config, {
        aria:false
    });

    var DOM_EVENT = {originalEvent:{target:1}};

    var setTabIndex = Aria.setTabIndex;
    Slide.Plugins.push({
        name:"aria",
        init:function (self) {
            if (!self.config.aria) {
                return;
            }
            var triggers = self.triggers;
            var panels = self.panels;
            var i = 0;
            var activeIndex = self.activeIndex;
            S.each(triggers, function (t) {
                setTabIndex(t, "-1");
                i++;
            });
            i = 0;
            S.each(panels, function (p) {
                setTabIndex(p, activeIndex == i ? "0" : "-1");
                DOM.attr(p, "role", "option");
                i++;
            });

            var content = self.content;

            DOM.attr(content, "role", "listbox");

            Event.on(content, "keydown", _contentKeydownProcess, self);

            setTabIndex(panels[0], 0);

            self.on("switch", function (ev) {
                var index = ev.currentIndex,
                    domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement),
                    last = ev.fromIndex;

                if (last > -1) {
                    setTabIndex(panels[last], -1);
                }
                setTabIndex(panels[index], 0);

                //dom 触发的事件，自动聚焦
                if (domEvent) {
                    panels[index].focus();
                }
            });
        }
    });

    function _contentKeydownProcess(e) {
        var self = this,
            key = e.keyCode;
        switch (key) {

            case KEY_DOWN:
            case KEY_RIGHT:
                self.next(DOM_EVENT);
                e.halt();
                break;

            case KEY_UP:
            case KEY_LEFT:
                self.prev(DOM_EVENT);
                e.halt();
                break;
        }
    }

}, {
    requires:["dom", "event", 'switchable']
});
/**
 2011-05-12 yiminghe@gmail.com：add support for aria & keydown

 <h2>键盘操作</h2>
 <ul class="list">
 <li>tab 进入卡盘时，停止自动播放</li>
 <li>上/左键：当焦点位于卡盘时，切换到上一个 slide 面板</li>
 <li>下/右键：当焦点位于卡盘时，切换到下一个 slide 面板</li>
 <li>tab 离开卡盘时，开始自动播放</li>
 </ul>
 **/
