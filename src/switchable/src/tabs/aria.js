/**
 *  Tabs aria support
 * @author yiminghe@gmail.com
 */
KISSY.add('switchable/tabs/aria', function (S, DOM, Event, Switchable, Aria, Tabs) {

    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    //var KEY_END = 35;
    //var KEY_HOME = 36;
    var EVENT_ADDED = 'added';
    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

//    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
//    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Tabs.Config, {
        aria: true
    });

    Switchable.addPlugin({
        name: "aria",
        init: function (self) {
            if (!self.config.aria) return;
            var triggers = self.triggers,
                activeIndex = self.activeIndex,
                panels = self.panels;
            var container = self.container;
            if (self.nav) {
                DOM.attr(self.nav, "role", "tablist");
            }
            var i = 0;

            function initTrigger(trigger) {
                trigger.setAttribute("role", "tab");
                setTabIndex(trigger, "-1");
                if (!trigger.id) {
                    trigger.id = S.guid("ks-switchable");
                }
            }


            function initPanel(panel, trigger) {
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", "true");
                panel.setAttribute("aria-labelledby", trigger.id);
            }

            S.each(triggers, initTrigger);


            self.on(EVENT_ADDED, function (e) {
                var t;
                initTrigger(t = e.trigger);
                initPanel(e.panel, t);
            });

            i = 0;

            S.each(panels, function (panel) {
                var t = triggers[i];
                initPanel(panel, t);
                i++;
            });

            if (activeIndex > -1) {
                setTabIndex(triggers[activeIndex], "0");
                panels[activeIndex].setAttribute("aria-hidden", "false");
            }


            self.on("switch", _tabSwitch, self);


            Event.on(container, "keydown", _tabKeydown, self);
            /**
             * prevent firefox native tab switch
             */
            Event.on(container, "keypress", _tabKeypress, self);

        }
    }, Tabs);

    var setTabIndex = Aria.setTabIndex;


    function _currentTabFromEvent(t) {
        var triggers = this.triggers,
            trigger = null;
        S.each(triggers, function (ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }

    function _tabKeypress(e) {

        switch (e.keyCode) {

            case KEY_PAGEUP:
            case KEY_PAGEDOWN:
                if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.halt();
                } // endif
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                } // endif
                break;

        }
    }

    var getDomEvent = Switchable.getDomEvent;

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target, self = this;
        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        // var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_LEFT:
            case KEY_UP:
                if (_currentTabFromEvent.call(self, t)
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    self.prev(getDomEvent(e));
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if (_currentTabFromEvent.call(self, t)
                //&& no_modifier_pressed_flag
                    ) {
                    self.next(getDomEvent(e));
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:

                if (control_modifier_pressed_flag) {
                    e.halt();
                    self.next(getDomEvent(e));
                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    self.prev(getDomEvent(e));
                }
                break;

//            case KEY_HOME:
//                if (no_modifier_pressed_flag) {
//                    self.switchTo(0, undefined, getDomEvent(e));
//                    e.halt();
//                }
//                break;
//            case KEY_END:
//                if (no_modifier_pressed_flag) {
//                    self.switchTo(triggers.length - 1, undefined, getDomEvent(e));
//                    e.halt();
//                }
//
//                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    if (e.shiftKey)
                        self.prev(getDomEvent(e));
                    else
                        self.next(getDomEvent(e));
                }
                break;
        }
    }

    function _tabSwitch(ev) {
        var domEvent = ev.originalEvent && !!(ev.originalEvent.target || ev.originalEvent.srcElement);

        var self = this;
        // 上一个激活 tab
        var lastActiveIndex = ev.fromIndex;

        // 当前激活 tab
        var activeIndex = ev.currentIndex;

        if (lastActiveIndex == activeIndex) return;

        var lastTrigger = self.triggers[lastActiveIndex];
        var trigger = self.triggers[activeIndex];
        var lastPanel = self.panels[lastActiveIndex];
        var panel = self.panels[activeIndex];
        if (lastTrigger) {
            setTabIndex(lastTrigger, "-1");
        }
        setTabIndex(trigger, "0");

        // move focus to current trigger if invoked by dom event
        if (domEvent) {
            trigger.focus();
        }
        if (lastPanel) {
            lastPanel.setAttribute("aria-hidden", "true");
        }
        panel.setAttribute("aria-hidden", "false");
    }


}, {
    requires: ["dom", "event", "../base", "../aria", "./base"]
});

/**
 * 2011-05-08 yiminghe@gmail.com：add support for aria & keydown
 * <h2>键盘快捷键</h2>

 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签 -- 去除
 输入框内 home 跳到输入框第一个字符前面 ，
 end 跳到输入框最后一个字符后面 ，
 不应该拦截
 <li>End: 当焦点在标签时转到最后一个标签 -- 去除
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 */
