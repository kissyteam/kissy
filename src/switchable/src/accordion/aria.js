/**
 *  accordion aria support
 * @author yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/aria', function (S, DOM, Event, Aria, Accordion, Switchable) {

    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

//    var DOM_EVENT = {originalEvent:{target:1}};

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Accordion.Config, {
        aria: true
    });

    Switchable.addPlugin({
        name: "aria",
        init: function (self) {
            if (!self.config.aria) return;
            var container = self.container,
                activeIndex = self.activeIndex;
            DOM.attr(container, "aria-multiselectable",
                self.config.multiple ? "true" : "false");
            if (self.nav) {
                DOM.attr(self.nav, "role", "tablist");
            }
            var triggers = self.triggers,
                panels = self.panels;
            var i = 0;
            S.each(panels, function (panel) {
                if (!panel.id) {
                    panel.id = S.guid("ks-accordion-tab-panel");
                }
            });
            S.each(triggers, function (trigger) {
                if (!trigger.id) {
                    trigger.id = S.guid("ks-accordion-tab");
                }
            });

            S.each(triggers, function (trigger) {
                trigger.setAttribute("role", "tab");
                trigger.setAttribute("aria-expanded", activeIndex == i ? "true" : "false");
                trigger.setAttribute("aria-selected", activeIndex == i ? "true" : "false");
                trigger.setAttribute("aria-controls", panels[i].id);
                setTabIndex(trigger, activeIndex == i ? "0" : "-1");
                i++;
            });
            i = 0;
            S.each(panels, function (panel) {
                var t = triggers[i];
                panel.setAttribute("role", "tabpanel");
                panel.setAttribute("aria-hidden", activeIndex == i ? "false" : "true");
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
    }, Accordion);

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


    function _currentPanelFromEvent(t) {
        var panels = this.panels,
            panel = null;
        S.each(panels, function (ct) {
            if (ct == t || DOM.contains(ct, t)) {
                panel = ct;
            }
        });
        return panel;
    }

    function getTabFromPanel(panel) {
        var self = this,
            triggers = self.triggers,
            panels = self.panels;
        return triggers[S.indexOf(panel, panels)];
    }

    function _currentTabByTarget(t) {
        var self = this,
            currentTarget = _currentTabFromEvent.call(self, t);
        if (!currentTarget) {
            currentTarget = getTabFromPanel.call(self,
                _currentPanelFromEvent.call(self, t))
        }
        return currentTarget;
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

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target,
            self = this,
            currentTarget,
            triggers = self.triggers;

        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_ENTER:
            case KEY_SPACE:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                    && no_modifier_pressed_flag
                    ) {

                    enter.call(self, currentTarget);
                    e.halt();
                }
                break;

            case KEY_LEFT:
            case KEY_UP:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    prev.call(self, currentTarget);
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                //&& no_modifier_pressed_flag
                    ) {
                    next.call(self, currentTarget);
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    next.call(self, currentTarget);
                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    prev.call(self, currentTarget);
                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    currentTarget = _currentTabByTarget.call(self, t);
                    switchTo.call(self, 0);
                    e.halt();
                }
                break;

            case KEY_END:
                if (no_modifier_pressed_flag) {
                    currentTarget = _currentTabByTarget.call(self, t);
                    switchTo.call(self, triggers.length - 1);
                    e.halt();
                }
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    if (e.shiftKey)
                        prev.call(self, currentTarget);
                    else
                        next.call(self, currentTarget);
                }
                break;
        }
    }

    function focusTo(nextIndex, focusNext) {
        var self = this,
            triggers = self.triggers,
            next = triggers[nextIndex];
        S.each(triggers, function (cur) {
            if (cur === next) return;
            setTabIndex(cur, "-1");
            DOM.removeClass(cur, "ks-switchable-select");
            cur.setAttribute("aria-selected", "false");
        });
        if (focusNext) {
            next.focus();
        }
        setTabIndex(next, "0");
        DOM.addClass(next, "ks-switchable-select");
        next.setAttribute("aria-selected", "true");
    }

    // trigger 焦点转移
    function prev(trigger) {
        var self = this,
            triggers = self.triggers,
            focusIndex = S.indexOf(trigger, triggers),
            nFocusIndex = focusIndex == 0
                ? triggers.length - 1 : focusIndex - 1;
        focusTo.call(self, nFocusIndex, true);
    }

    function switchTo(index) {
        focusTo.call(this, index, true)
    }


    // trigger 焦点转移
    function next(trigger) {
        var self = this,
            triggers = self.triggers,
            focusIndex = S.indexOf(trigger, triggers),
            nFocusIndex = (focusIndex == triggers.length - 1
                ? 0 : focusIndex + 1);
        focusTo.call(self, nFocusIndex, true);
    }

    function enter(trigger) {
        var self = this;
        self.switchTo(S.indexOf(trigger, self.triggers));
    }


    // 显示 tabpanel
    function _tabSwitch(ev) {

        var domEvent = ev.originalEvent && !!(ev.originalEvent.target || ev.originalEvent.srcElement),
            self = this,
            multiple = self.config.multiple,
            activeIndex = ev.currentIndex,
            panels = self.panels,
            triggers = self.triggers,
            trigger = triggers[activeIndex],
            panel = panels[activeIndex];

        if (!multiple) {
            S.each(panels, function (p) {
                if (p !== panel) {
                    p.setAttribute("aria-hidden", "true");
                }
            });
            S.each(triggers, function (t) {
                if (t !== trigger) {
                    t.setAttribute("aria-hidden", "true");
                }
            });
        }

        var o = panel.getAttribute("aria-hidden");
        panel.setAttribute("aria-hidden", o == "false" ? "true" : "false");
        trigger.setAttribute("aria-expanded", o == "false" ? "false" : "true");
        focusTo.call(self, activeIndex, domEvent);
    }
}, {
    requires: ["dom", "event", "../aria", "./base", "../base"]
});

/**

 yiminghe@gmail.com：2011.06.02 review switchable

 2011-05-08 yiminghe@gmail.com：add support for aria & keydown

 <h2>键盘快捷键</h2>
 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签
 <li>End: 当焦点在标签时转到最后一个标签
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 **/
