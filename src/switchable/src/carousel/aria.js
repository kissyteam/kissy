/**
 *  aria support for carousel
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/carousel/aria", function (S, DOM, Event, Aria, Carousel, Switchable) {

//    var KEY_PAGEUP = 33;
//    var KEY_PAGEDOWN = 34;
//    var KEY_END = 35;
//    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    //var KEY_TAB = 9;

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;
    var setTabIndex = Aria.setTabIndex,
        DOM_EVENT = {originalEvent: {target: 1}},
        FORWARD = 'forward',
        BACKWARD = 'backward';

    function _switch(ev) {
        var self = this,
            steps = self.config.steps,
            index = ev.currentIndex,
            activeIndex = self.activeIndex,
            panels = self.panels,
            panel = panels[index * steps],
            triggers = self.triggers,
            trigger = triggers[index],
            domEvent = ev.originalEvent && !!(ev.originalEvent.target || ev.originalEvent.srcElement);

        // dom 事件触发
        if (domEvent ||
            // 初始化
            activeIndex == -1) {

            S.each(triggers, function (t) {
                setTabIndex(t, -1);
            });

            S.each(panels, function (t) {
                setTabIndex(t, -1);
            });

            if (trigger) {
                setTabIndex(trigger, 0);
            }

            setTabIndex(panel, 0);

            //dom 事件触发时，才会进行聚焦，否则会干扰用户
            if (domEvent) {
                panel.focus();
            }
        }
    }

    function findTrigger(t) {
        var r = null;
        S.each(this.triggers, function (trigger) {
            if (trigger == t
                || DOM.contains(trigger, t)) {
                r = trigger;
                return false;
            }
        });
        return r;
    }

    function next(c) {
        var n = DOM.next(c),
            triggers = this.triggers;
        if (!n) {
            n = triggers[0];
        }
        setTabIndex(c, -1);
        if (n) {
            setTabIndex(n, 0);
            n.focus();
        }
    }


    function prev(c) {
        var n = DOM.prev(c),
            triggers = this.triggers;
        if (!n) {
            n = triggers[triggers.length - 1];
        }
        setTabIndex(c, -1);
        if (n) {
            setTabIndex(n, 0);
            n.focus();
        }
    }

    function _navKeydown(e) {
        var key = e.keyCode,
            self = this,
            t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findTrigger.call(self, t);
                if (c) {
                    next.call(self, c);
                    e.halt();
                }
                break;

            case KEY_UP:
            case KEY_LEFT:

                c = findTrigger.call(self, t);
                if (c) {
                    prev.call(self, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:
                c = findTrigger.call(self, t);
                if (c) {
                    self.switchTo(S.indexOf(c, self.triggers),
                        undefined, DOM_EVENT);
                    e.halt();
                }
                break;
        }
    }

    function findPanel(t) {
        var r = null;
        S.each(this.panels, function (p) {
            if (p == t || DOM.contains(p, t)) {
                r = p;
                return false;
            }
        });
        return r;
    }


    function nextPanel(c) {
        var self = this,
            n = DOM.next(c),
            panels = self.panels;
        if (!n) {
            n = panels[0];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);

        if (checkPanel.call(self, n, FORWARD)) {
            n.focus();
        }
    }


    function prevPanel(c) {
        var n = DOM.prev(c),
            self = this,
            panels = self.panels;
        if (!n) {
            n = panels[panels.length - 1];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);
        if (checkPanel.call(self, n, BACKWARD)) {
            n.focus();
        }
    }

    function checkPanel(p, direction) {
        var self = this,
            index = S.indexOf(p, self.panels),
            steps = self.config.steps,
            dest = Math.floor(index / steps);
        // 在同一个 panel 组，立即返回
        if (dest == self.activeIndex) {
            return 1;
        }
        if (index % steps == 0 || index % steps == steps - 1) {
            //向前动画滚动中，focus，会不正常 ...
            //传递事件，动画后异步 focus
            self.switchTo(dest, direction, DOM_EVENT);
            return 0;
        }
        return 1;
    }


    function _contentKeydown(e) {

        var self = this,
            key = e.keyCode,
            t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findPanel.call(self, t);
                if (c) {
                    nextPanel.call(self, c);
                    e.halt();
                }
                break;


            case KEY_UP:
            case KEY_LEFT:

                c = findPanel.call(self, t);
                if (c) {
                    prevPanel.call(self, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:

                c = findPanel.call(self, t);
                if (c) {
                    self.fire('itemSelected', { item: c });
                    e.halt();
                }
                break;
        }
    }

    S.mix(Carousel.Config, {
        aria: false
    });

    Switchable.addPlugin({
        name: "aria",
        init: function (self) {
            if (!self.config.aria) {
                return;
            }
            var triggers = self.triggers;
            var panels = self.panels;
            var content = self.content;
            var activeIndex = self.activeIndex;

            if (!content.id) {
                content.id = S.guid("ks-switchbale-content");
            }
            content.setAttribute("role", "listbox");
            var i = 0;
            S.each(triggers, function (t) {
                setTabIndex(t, activeIndex == i ? "0" : "-1");
                t.setAttribute("role", "button");
                t.setAttribute("aria-controls", content.id);
                i++;
            });
            i = 0;
            S.each(panels, function (t) {
                setTabIndex(t, "-1");
                t.setAttribute("role", "option");
                i++;
            });

            self.on("switch", _switch, self);
            var nav = self.nav;

            if (nav) {
                Event.on(nav, "keydown", _navKeydown, self);
            }

            Event.on(content, "keydown", _contentKeydown, self);

            var prevBtn = self['prevBtn'],
                nextBtn = self['nextBtn'];

            if (prevBtn) {
                setTabIndex(prevBtn, 0);
                prevBtn.setAttribute("role", "button");
                Event.on(prevBtn, "keydown", function (e) {
                    if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                        self.prev(DOM_EVENT);
                        e.preventDefault();
                    }
                });
            }

            if (nextBtn) {
                setTabIndex(nextBtn, 0);
                nextBtn.setAttribute("role", "button");
                Event.on(nextBtn, "keydown", function (e) {
                    if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                        self.next(DOM_EVENT);
                        e.preventDefault();
                    }
                });
            }

        }
    }, Carousel);

}, {
    requires: ["dom", "event", "../aria", "./base", '../base']
});

/**
 yiminghe@gmail.com：2011.06.02 review switchable

 yiminghe@gmail.com:2011.05.12

 <h2>键盘快捷键</h2>
 <ul class="list">
 <li><strong>当焦点在上一页 / 下一页时</strong>
 <ul>
 <li>
 enter/space 旋转到上一屏下一屏，并且焦点转移到当前屏的第一个面板
 </li>
 </ul>
 </li>

 <li>
 <strong> 当焦点在导航圆点时</strong>
 <ul>
 <li>
 上/左键：焦点转移到上一个导航圆点
 </li>
 <li>
 下/右键：焦点转移到下一个导航圆点
 </li>
 <li>
 enter/space: 旋转到当前导航圆点代表的滚动屏，并且焦点转移到当前屏的第一个面板
 </li>
 </ul>
 </li>


 <li>
 <strong>当焦点在底部滚动屏某个面板时</strong>
 <ul>
 <li>
 上/左键：焦点转移到上一个面板，必要时滚屏
 </li>
 <li>
 下/右键：焦点转移到下一个面板，必要时滚屏
 </li>
 <li>
 enter/space: 触发 itemSelect 事件，item 为当前面板
 </li>
 </ul>
 </li>
 </ul>
 **/
