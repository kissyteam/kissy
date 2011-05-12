/**
 * accordion aria support
 * @creator yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/aria', function(S, Aria, Accordion) {
    var SELECT = "ks-switchable-select";
    var Event = S.Event,DOM = S.DOM;
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

    S.mix(Accordion.Config, {
        aria:true
    });

    Accordion.Plugins.push({
        name:"aria",
        init:function(self) {
            if (!self.config.aria) return;
            var container = self.container;
            DOM.attr(container, "aria-multiselectable",
                self.config.multiple ? "true" : "false");
            DOM.attr(container, "role", "tablist");
            var triggers = self.triggers,
                panels = self.panels;
            var i = 0;
            S.each(panels, function(panel) {
                if (!panel.id) {
                    panel.id = S.guid("ks-switchable-tab-panel");
                }
            });
            S.each(triggers, function(trigger) {
                if (!trigger.id) {
                    trigger.id = S.guid("ks-switchable-tab");
                }
            });

            S.each(triggers, function(trigger) {
                trigger.setAttribute("role", "tab");
                trigger.setAttribute("aria-expanded", "false");
                trigger.setAttribute("aria-selected", "false");
                trigger.setAttribute("aria-controls", panels[i].id);
                setTabIndex(trigger, "-1");

                i++;
            });
            i = 0;
            S.each(panels, function(panel) {
                var t = triggers[i];
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", "true");
                panel.setAttribute("aria-labelledby", t.id);
                i++;
            });

            self.on("switch", _tabSwitch, self);


            Event.on(container, "keydown", _tabKeydown, self);
            /**
             * prevent firefox native tab switch
             */
            Event.on(container, "keypress", _tabKeypress, self);

        }
    });

    var setTabIndex = Aria.setTabIndex;

    function _currentTabFromEvent(t) {
        var triggers = this.triggers,trigger;
        S.each(triggers, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }

//
//    function _currentPanelFromEvent(t) {
//        var panels = this.panels,panel;
//        S.each(panels, function(ct) {
//            if (ct == t || DOM.contains(ct, t)) {
//                panel = ct;
//            }
//        });
//        return panel;
//    }

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

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target,self = this;
        var triggers = self.triggers;

        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_ENTER:
            case KEY_SPACE:
                if (_currentTabFromEvent.call(self, t)
                    && no_modifier_pressed_flag
                    ) {
                    enter.call(self);
                    e.halt();
                }
                break;

            case KEY_LEFT:
            case KEY_UP:
                if (_currentTabFromEvent.call(self, t)
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    prev.call(self);
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if (_currentTabFromEvent.call(self, t)
                //&& no_modifier_pressed_flag
                    ) {
                    next.call(self);
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:

                if (control_modifier_pressed_flag) {
                    e.halt();
                    next.call(self);

                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    prev.call(self);

                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    switchTo.call(self, 0);
                    e.halt();
                }

                break;
            case KEY_END:
                if (no_modifier_pressed_flag) {
                    switchTo.call(self, triggers.length - 1);
                    e.halt();
                }

                break;
            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    if (e.shiftKey)
                        prev.call(self);
                    else
                        next.call(self);

                }
                break;
        }
    }

    function focusTo(pre, nextIndex) {
        var self = this,triggers = self.triggers;
        if (S.isNumber(pre)) {
            var cur = triggers[pre];
        }
        var next = triggers[nextIndex];
        if (cur) {
            setTabIndex(cur, "-1");
            DOM.removeClass(cur, SELECT);
            cur.setAttribute("aria-selected", "false");
            next.focus();
        }
        setTabIndex(next, "0");
        DOM.addClass(next, SELECT);
        next.setAttribute("aria-selected", "true");
    }

    // trigger 焦点转移
    function prev() {
        var self = this,
            triggers = self.triggers,
            focusIndex = self.focusIndex,
            nFocusIndex = self.focusIndex = focusIndex == 0
                ? triggers.length - 1 : focusIndex - 1;
        focusTo.call(self, focusIndex, nFocusIndex);
    }

    function switchTo(index) {
        var self = this,
            focusIndex = self.focusIndex;
        self.focusIndex = index;
        focusTo.call(self, focusIndex, index)
    }


    // trigger 焦点转移
    function next() {
        var self = this,
            triggers = self.triggers,
            focusIndex = self.focusIndex,
            nFocusIndex = self.focusIndex = (focusIndex == triggers.length - 1
                ? 0 : focusIndex + 1);
        focusTo.call(self, focusIndex, nFocusIndex);
    }

    function enter() {
        this.switchTo(this.focusIndex);
    }


    // 显示 tabpanel
    function _tabSwitch(ev) {

        var self = this,
            multiple = self.config.multiple,
            lastActiveIndex = self.activeIndex,
            activeIndex = ev.currentIndex,
            trigger = self.triggers[activeIndex],
            panel = self.panels[activeIndex];

        if (lastActiveIndex > -1) {
            var lastTrigger = self.triggers[lastActiveIndex],
                lastPanel = self.panels[lastActiveIndex];
            setTabIndex(lastTrigger, "-1");
            //初次不聚焦
            trigger.focus();
            if (!multiple) {
                lastPanel.setAttribute("aria-hidden", "true");
                lastTrigger.setAttribute("aria-expanded", "false");
            }
        }

        setTabIndex(trigger, "0");
        var o = panel.getAttribute("aria-hidden");
        panel.setAttribute("aria-hidden", o == "false" ? "true" : "false");
        trigger.setAttribute("aria-expanded", o == "false" ? "false" : "true");
        focusTo.call(self, self.focusIndex, activeIndex);
        self.focusIndex = activeIndex;
    }


},
{
    requires:["../aria","./base"]
});

/**
 * 2011-05-08 承玉：add support for aria & keydown
 * <h2>键盘快捷键</h2>

 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签
 <li>End: 当焦点在标签时转到最后一个标签
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 */
