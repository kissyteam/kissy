/*
Copyright (c) 2010, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 20:22:35
Revision: 388
*/
/**
 * Widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("widget", function(S) {

    /**
     * Widget Class
     * @constructor
     */
    function Widget(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Widget)) {
            return new Widget(container, config);
        }

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = YAHOO.util.Dom.get(container);

        /**
         * config infomation
         * @type object
         */
        self.config = config || {};
    }

    S.Widget = Widget;
});
/**
 * Switchable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget
 */
KISSY.add("switchable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UNDEFINED = "undefined",
        DISPLAY = "display", BLOCK = "block", NONE = "none",
        FORWARD = "forward", BACKWARD = "backward",
        SWITCHABLE = "switchable",
        BEFORE_SWITCH = "beforeSwitch", ON_SWITCH = "onSwitch",
        CLS_PREFIX = "ks-switchable-";

    function Switchable() {
    }

    Switchable.Config = {
        mackupType: 0, // mackup 的类型，取值如下：

        // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
        navCls: CLS_PREFIX + "nav",
        contentCls: CLS_PREFIX + "content",

        // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
        triggerCls: CLS_PREFIX + "trigger",
        panelCls: CLS_PREFIX + "panel",

        // 2 - 完全自由：直接传入 triggers 和 panels
        triggers: [],
        panels: [],

        // 是否有触点
        hasTriggers: true,

        // 触发类型
        triggerType: "mouse", // or "click"
        // 触发延迟
        delay: .1, // 100ms

        activeIndex: 0, // mackup 的默认激活项，应该与此 index 一致
        activeTriggerCls: "active",

        // 切换视图内有多少个 panels
        steps: 1,

        // 切换视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize: []
    };

    /**
     * Attaches switchable ablility to Widget.
     * required members：
     *   - this.container
     *   - this.config
     * attached members:
     *   - this.triggers  可以为空值 []
     *   - this.panels    肯定有值，且 length > 1
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    S.Widget.prototype.switchable = function(config) {
        var self = this;
        config = config || {};

        // 根据配置信息，调整默认配置
        if (!("mackupType" in config)) {
            if (config.panelCls) {
                config.mackupType = 1;
            } else if (config.panels) {
                config.mackupType = 2;
            }
        }

        /**
         * 配置参数
         * @type object
         */
        self.config[SWITCHABLE] = S.merge(Switchable.Config, config || {});

        /**
         * triggers
         * @type Array of HTMLElement
         */
        self.triggers = self.triggers || [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        self.panels = self.panels || [];

        /**
         * length = panels.length / steps
         * @type number
         */
        //self.length

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * 当前激活的 index
         * @type number
         */
        if (typeof self.activeIndex === UNDEFINED) {
            self.activeIndex = self.config[SWITCHABLE].activeIndex;
        }

        // attach and init
        S.mix(self, Switchable.prototype, false);
        self._initSwitchable();

        return self; // support chain
    };

    S.mix(Switchable.prototype, {

        /**
         * init switchable
         */
        _initSwitchable: function() {
            var self = this, cfg = self.config[SWITCHABLE];

            // parse mackup
            if (self.panels.length === 0) {
                self._parseSwitchableMackup();
            }

            // create custom events
            self.createEvent(BEFORE_SWITCH);
            self.createEvent(ON_SWITCH);

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }
        },

        /**
         * 解析 mackup 的 switchable 部分，获取 triggers, panels, content
         */
        _parseSwitchableMackup: function() {
            var self = this, container = self.container,
                cfg = self.config[SWITCHABLE], hasTriggers = cfg.hasTriggers,
                nav, content, triggers = [], panels = [], i, n, m,
                getElementsByClassName = Dom.getElementsByClassName;

            switch (cfg.mackupType) {
                case 0: // 默认结构
                    nav = getElementsByClassName(cfg.navCls, "*", container)[0];
                    if (nav) triggers = Dom.getChildren(nav);
                    content = getElementsByClassName(cfg.contentCls, "*", container)[0];
                    panels = Dom.getChildren(content);
                    break;
                case 1: // 适度灵活
                    triggers = getElementsByClassName(cfg.triggerCls, "*", container);
                    panels = getElementsByClassName(cfg.panelCls, "*", container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }


            // get length
            n = panels.length;
            self.length = n / cfg.steps;

            // 自动生成 triggers
            if (hasTriggers && n > 0 && triggers.length === 0) {
                triggers = self._generateTriggersMackup(self.length);
            }

            // 将 triggers 转换为普通数组
            if (hasTriggers) {
                for (i = 0,m = triggers.length; i < m; i++) {
                    self.triggers.push(triggers[i]);
                }
            }
            // 将 panels 转换为普通数组
            for (i = 0; i < n; i++) {
                self.panels.push(panels[i]);
            }

            // get content
            self.content = content || panels[0].parentNode;
        },

        /**
         * 自动生成 triggers 的 mackup
         */
        _generateTriggersMackup: function(len) {
            var self = this, cfg = self.config[SWITCHABLE],
                ul = document.createElement("UL"), li, i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = document.createElement("LI");
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            return Dom.getChildren(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers: function() {
            var self = this, cfg = self.config[SWITCHABLE],
                triggers = self.triggers, trigger,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    // 响应点击和 Tab 键
                    Event.on(trigger, "click", function() {
                        self._onFocusTrigger(index);
                    });
                    Event.on(trigger, "focus", function() {
                        self._onFocusTrigger(index);
                    });

                    // 响应鼠标悬浮
                    if (cfg.triggerType === "mouse") {
                        Event.on(trigger, "mouseenter", function() {
                            self._onMouseEnterTrigger(index);
                        });
                        Event.on(trigger, "mouseleave", function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            var self = this;
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (self.activeIndex !== index) {
                self.switchTimer = Lang.later(self.config[SWITCHABLE].delay * 1000, self, function() {
                    self.switchTo(index);
                });
            }
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.switchTimer) self.switchTimer.cancel();
        },

        /**
         * 切换操作
         */
        switchTo: function(index, direction) {
            var self = this, cfg = self.config[SWITCHABLE],
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex,
                steps = cfg.steps,
                fromIndex = activeIndex * steps, toIndex = index * steps;
            //S.log("Triggerable.switchTo: index = " + index);

            if (index === activeIndex) return self;
            if (!self.fireEvent(BEFORE_SWITCH, index)) return self;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            // switch active panels
            if (typeof direction === UNDEFINED) {
                direction = index > activeIndex ? FORWARD : FORWARD;
            }
            // TODO: slice 是否会带来性能下降？需要测试
            self._switchView(
                panels.slice(fromIndex, fromIndex + steps),
                panels.slice(toIndex, toIndex + steps),
                index,
                direction);

            // update activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var activeTriggerCls = this.config[SWITCHABLE].activeTriggerCls;

            if (fromTrigger) Dom.removeClass(fromTrigger, activeTriggerCls);
            Dom.addClass(toTrigger, activeTriggerCls);
        },

        /**
         * 切换当前视图
         */
        _switchView: function(fromPanels, toPanels, index/*, direction*/) {
            // 最简单的切换效果：直接隐藏/显示
            Dom.setStyle(fromPanels, DISPLAY, NONE);
            Dom.setStyle(toPanels, DISPLAY, BLOCK);

            // fire onSwitch
            this.fireEvent(ON_SWITCH, index);
        },

        /**
         * 切换到上一个视图
         */
        prev: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.length - 1, BACKWARD);
            // TODO: fire event when at first/last view.
        },

        /**
         * 切换到下一个视图
         */
        next: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ? activeIndex + 1 : 0, FORWARD);
        }
    });

    S.augment(Switchable, Y.EventProvider);
    
    S.Switchable = Switchable;
});
/**
 * Switchable Autoplay Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, switchable
 */
KISSY.add("switchable-autoplay", function(S) {

    var Y = YAHOO.util, Event = Y.Event, Lang = YAHOO.lang,
        SWITCHABLE = "switchable",
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 织入初始化函数
     * attached members:
     *   - this.paused
     *   - this.autoPlayTimer
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE];
        if (!cfg.autoplay) return;

        // 鼠标悬停，停止自动播放
        if (cfg.pauseOnHover) {
            Event.on(self.container, "mouseenter", function() {
                self.paused = true;
            });
            Event.on(self.container, "mouseleave", function() {
                self.paused = false;
            });
        }

        // 设置自动播放
        self.autoplayTimer = Lang.later(cfg.interval * 1000, self, function() {
            if (self.paused) return;
            self.switchTo(self.activeIndex < self.length - 1 ? self.activeIndex + 1 : 0);
        }, null, true);

    }, "after", Switchable.prototype, "_initSwitchable");
});

/**
 * TODO:
 *  - 是否需要提供 play / pause / stop API ?
 *  - autoplayTimer 和 switchTimer 的关联？
 */
/**
 * Switchable Effect Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, yui-animation, widget, switchable
 */
KISSY.add("switchable-effect", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom,
        SWITCHABLE = "switchable",
        DISPLAY = "display", BLOCK = "block", NONE = "none",
        OPACITY = "opacity", Z_INDEX = "z-index",
        RELATIVE = "relative", ABSOLUTE = "absolute",
        SCROLLX = "scrollx", SCROLLY = "scrolly", FADE = "fade",
        Switchable = S.Switchable, Effects;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // "scrollx", "scrolly", "fade" 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: Y.Easing.easeNone // easing method
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromEls, toEls, callback) {
            Dom.setStyle(fromEls, DISPLAY, NONE);
            Dom.setStyle(toEls, DISPLAY, BLOCK);
            callback();
        },

        // 淡隐淡现效果
        fade: function(fromEls, toEls, callback) {
            if(fromEls.length !== 1) {
                throw new Error("fade effect only supports steps == 1.");
            }
            var self = this, cfg = self.config[SWITCHABLE],
                fromEl = fromEls[0], toEl = toEls[0];
            if (self.anim) self.anim.stop();

            // 首先显示下一张
            Dom.setStyle(toEl, OPACITY, 1);

            // 动画切换
            self.anim = new Y.Anim(fromEl, {opacity: {to: 0}}, cfg.duration, cfg.easing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free

                // 切换 z-index
                Dom.setStyle(toEl, Z_INDEX, 9);
                Dom.setStyle(fromEl, Z_INDEX, 1);

                callback();
            });
            self.anim.animate();
        },

        // 水平/垂直滚动效果
        scroll: function(fromEls, toEls, callback, index) {
            var self = this, cfg = self.config[SWITCHABLE],
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                attributes = {};

            attributes[isX ? "left" : "top"] = { to: -diff };

            if (self.anim) self.anim.stop();
            self.anim = new Y.Anim(self.content, attributes, cfg.duration, cfg.easing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free
                callback();
            });
            self.anim.animate();
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 织入初始化函数：根据 effect, 调整初始状态
     * attached members:
     *   - this.viewSize
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE],
            effect = cfg.effect, panels = self.panels, steps = cfg.steps,
            activeIndex = self.activeIndex,
            fromIndex = activeIndex * steps, toIndex = fromIndex + steps - 1,
            i, len = panels.length;

        // 1. 获取高宽
        self.viewSize = [
            cfg.viewSize[0] || panels[0].offsetWidth * steps,
            cfg.viewSize[0] || panels[0].offsetHeight * steps
            ];
        // 注：所有 panel 的尺寸应该相同
        //    最好指定第一个 panel 的 width 和 height，因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

        // 2. 初始化 panels 样式
        if (effect !== NONE) { // effect = scrollx, scrolly, fade
            // 这些特效需要将 panels 都显示出来
            for (i = 0; i < len; i++) {
                panels[i].style.display = BLOCK;
            }

            switch (effect) {
                // 如果是滚动效果
                case SCROLLX:
                case SCROLLY:
                    // 设置定位信息，为滚动效果做铺垫
                    self.content.style.position = ABSOLUTE;
                    self.content.parentNode.style.position = RELATIVE; // 注：content 的父级不一定是 container

                    // 水平排列
                    if (effect === SCROLLX) {
                        Dom.setStyle(panels, "float", "left");

                        // 设置最大宽度，以保证有空间让 panels 水平排布
                        this.content.style.width = self.viewSize[0] * (len / steps) + "px";
                    }
                    break;

                // 如果是透明效果，则初始化透明
                case FADE:
                    for (i = 0; i < len; i++) {
                        Dom.setStyle(panels[i], OPACITY, (i >= fromIndex && i <= toIndex) ? 1 : 0);
                        panels[i].style.position = ABSOLUTE;
                        panels[i].style.zIndex = (i >= fromIndex && i <= toIndex) ? 9 : 1;
                    }
                    break;
            }
        }

        // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
        //    nav 的 cls 由 CSS 指定

    }, "after", Switchable.prototype, "_initSwitchable");

    /**
     * 覆盖切换方法
     */
    S.mix(Switchable.prototype, {
       /**
         * 切换视图
         */
        _switchView: function(fromEls, toEls, index, direction) {
            var self = this, cfg = self.config[SWITCHABLE],
                effect = cfg.effect,
                fn = typeof effect === "function" ? effect : Effects[effect];

            fn.call(self, fromEls, toEls, function() {
                // fire event
                self.fireEvent("onSwitch", index);
            }, index, direction);
        }
    });
});

/**
 * TODO:
 *  - apple 翻页效果
 */
/**
 * Switchable Circular Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, switchable
 */
KISSY.add("switchable-circular", function(S) {

    var Y = YAHOO.util,
        SWITCHABLE = "switchable",
        RELATIVE = "relative",
        LEFT = "left", TOP = "top",
        PX = "px", EMPTY = "",
        FORWARD = "forward", BACKWARD = "backward",
        SCROLLX = "scrollx", SCROLLY = "scrolly",
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this, cfg = self.config[SWITCHABLE],
            len = self.length,
            activeIndex = self.activeIndex,
            isX = cfg.effect === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            attributes = {},
            isCritical,
            isBackward = direction === BACKWARD;

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && activeIndex === 0 && index === len - 1)
                     || (direction === FORWARD && activeIndex === len - 1 && index === 0);

        if(isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }
        attributes[prop] = { to: diff };

        // 开始动画
        if (self.anim) self.anim.stop();
        self.anim = new Y.Anim(self.content, attributes, cfg.duration, cfg.easing);
        self.anim.onComplete.subscribe(function() {
            if(isCritical) {
                // 复原位置
                resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
            }
            // free
            self.anim = null;
            callback();
        });
        self.anim.animate();
    }

    /**
     * 调整位置
     */
    function adjustPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config[SWITCHABLE],
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 调整 panels 到下一个视图中
        for (i = from; i < to; i++) {
            panels[i].style.position = RELATIVE;
            panels[i].style[prop] = (isBackward ? "-" : EMPTY) + viewDiff * len + PX;
        }

        // 偏移量
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config[SWITCHABLE],
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 滚动完成后，复位到正常状态
        for (i = from; i < to; i++) {
            panels[i].style.position = EMPTY;
            panels[i].style[prop] = EMPTY;
        }

        // 瞬移到正常位置
        self.content.style[prop] = isBackward ? -viewDiff * (len - 1) + PX : EMPTY;
    }

    /**
     * 织入初始化函数
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE];

        // 仅有滚动效果需要下面的调整
        if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
            // 覆盖滚动效果函数
            cfg.effect = circularScroll;
        }

    }, "after", Switchable.prototype, "_initSwitchable");
});

/**
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 *//**
 * Switchable Lazyload Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, widget, switchable, datalazyload
 */
KISSY.add("switchable-lazyload", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom,
        SWITCHABLE = "switchable",
        BEFORE_SWITCH = "beforeSwitch",
        IMG_SRC = "img-src", TEXTAREA_DATA = "textarea-data",
        FLAGS = {},
        Switchable = S.Switchable,
        DataLazyload = S.DataLazyload;

    FLAGS[IMG_SRC] = "data-lazyload-src-custom";
    FLAGS[TEXTAREA_DATA] = "ks-datalazyload-custom";

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyDataType: "", // "img-src" or "textarea-data"
        lazyDataFlag: "" // "data-lazyload-src-custom" or "ks-datalazyload-custom"
    });

    /**
     * 织入初始化函数
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE],
            type = cfg.lazyDataType, flag = cfg.lazyDataFlag || FLAGS[type];
        if(!DataLazyload || !type || !flag) return; // 没有延迟项

        self.subscribe(BEFORE_SWITCH, loadLazyData);

        /**
         * 加载延迟数据
         */
        function loadLazyData(index) {
            //S.log("switchable-lazyload: index = " + index);
            var steps = cfg.steps, from = index * steps , to = from + steps;

            DataLazyload.loadCustomLazyData(self.panels.slice(from, to), type, flag);
            if(isAllDone()) {
                self.unsubscribe(BEFORE_SWITCH, loadLazyData);
            }
        }

        /**
         * 是否都已加载完成
         */
        function isAllDone() {
            var imgs, textareas, i, len;

            if(type === IMG_SRC) {
                imgs = self.container.getElementsByTagName("img");
                for(i = 0, len = imgs.length; i < len; i++) {
                    if(imgs[i].getAttribute(flag)) return false;
                }
            } else if(type === TEXTAREA_DATA) {
                textareas = self.container.getElementsByTagName("textarea");
                for(i = 0, len = textareas.length; i < len; i++) {
                    if(Dom.hasClass(textareas[i], flag)) return false;
                }
            }

            return true;
        }

    }, "after", Switchable.prototype, "_initSwitchable");
});
/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("tabs", function(S) {

    var SWITCHABLE = "switchable";

    /**
     * Tabs Class
     * @constructor
     */
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
        self.switchable(self.config);

        // add quick access for config
        self.config = self.config[SWITCHABLE];
        self.config[SWITCHABLE] = self.config;
    }

    S.extend(Tabs, S.Widget);
    S.Tabs = Tabs;
});
/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("slide", function(S) {

    var SWITCHABLE = "switchable",

    /**
     * 默认配置，和 Switchable 相同的部分此处未列出
     */
    defaultConfig = {
        autoplay: true,
        circular: true
    };

    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Slide.superclass.constructor.call(self, container, config);
        self.switchable(self.config);

        // add quick access for config
        self.config = self.config[SWITCHABLE];
        self.config[SWITCHABLE] = self.config;
    }

    S.extend(Slide, S.Widget);
    S.Slide = Slide;
});
/**
 * Carousel Widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("carousel", function(S) {

    var SWITCHABLE = "switchable",

        /**
         * 默认配置，和 Switchable 相同的部分此处未列出
         */
        defaultConfig = {
            circular: true
        };

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Carousel.superclass.constructor.call(self, container, config);
        self.switchable(self.config);

        // add quick access for config
        self.config = self.config[SWITCHABLE];
        self.config[SWITCHABLE] = self.config;
    }

    S.extend(Carousel, S.Widget);
    S.Carousel = Carousel;
});
/**
 * 超级菜单组件
 * @module      megamenu
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yui-base, widget, switchable
 */
KISSY.add("megamenu", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        NONE = "none", BLOCK = "block",
        CLOSEBTN_TMPL = "<span class=\"{hook_cls}\"></span>",
        SWITCHABLE = "switchable",
        CLS_PREFIX = "ks-megamenu-",

        /**
         * 默认配置，和 Switchable 相同的配置此处未列出
         */
        defaultConfig = {
            hideDelay: .5,    // 隐藏延迟

            viewCls: CLS_PREFIX + "view",
            closeBtnCls: CLS_PREFIX + "closebtn",

            showCloseBtn: true, // 是否显示关闭按钮

            activeIndex: -1 // 默认没有激活项
        };

    /**
     * @class MegaMenu
     * @constructor
     */
    function MegaMenu(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof MegaMenu)) {
            return new MegaMenu(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        MegaMenu.superclass.constructor.call(self, container, config);
        self.switchable(self.config);

        // add quick access for config
        self.config = self.config[SWITCHABLE];
        self.config[SWITCHABLE] = self.config;

        /**
         * 显示容器
         */
        //self.view

        /**
         * 显示容器里的数据元素
         */
        //self.viewContent

        /**
         * 定时器
         */
        //self.hideTimer

        // init
        self._init();

    }

    S.extend(MegaMenu, S.Widget);

    S.mix(MegaMenu.prototype, {

        /**
         * 初始化操作
         */
        _init: function() {
            var self = this;

            self._initView();
            if (self.config.showCloseBtn) self._initCloseBtn();
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            if (self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);
            var self = this;
            if (self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            self.switchTimer = Lang.later(self.config.delay * 1000, self, function() {
                self.switchTo(index);
            });
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.switchTimer) self.switchTimer.cancel();

            self.hideTimer = Lang.later(self.config.hideDelay * 1000, self, function() {
                self.hide();
            });
        },

        /**
         * 初始化显示容器
         */
        _initView: function() {
            var self = this, cfg = self.config,
                view = Dom.getElementsByClassName(cfg.viewCls, "*", self.container)[0];

            // 自动生成 view
            if (!view) {
                view = document.createElement("DIV");
                view.className = cfg.viewCls;
                self.container.appendChild(view);
            }

            // init events
            Event.on(view, "mouseenter", function() {
                if (self.hideTimer) self.hideTimer.cancel();
            });
            Event.on(view, "mouseleave", function() {
                self.hideTimer = Lang.later(cfg.hideDelay * 1000, self, "hide");
            });

            // viewContent 是放置数据的容器，无关闭按钮时，就是 view 本身
            self.viewContent = view;
            self.view = view;
        },

        /**
         * 初始化关闭按钮
         * @protected
         */
        _initCloseBtn: function() {
            var self = this, el, view = self.view;

            view.innerHTML = CLOSEBTN_TMPL.replace("{hook_cls}", self.config.closeBtnCls);
            Event.on(view.firstChild, "click", function() {
                self.hide();
            });

            // 更新 viewContent
            el = document.createElement("div");
            view.appendChild(el);
            self.viewContent = el;
        },

        /**
         * 切换视图内的内容
         * @override
         */
        _switchView: function(oldContents, newContents, index) {
            var self = this;

            // 显示 view
            self.view.style.display = BLOCK;

            // 加载新数据
            self.viewContent.innerHTML = newContents[0].innerHTML;

            // fire onSwitch
            self.fireEvent("onSwitch", index);
        },

        /**
         * 隐藏内容
         */
        hide: function() {
            var self = this;

            // hide current
            Dom.removeClass(self.triggers[self.activeIndex], self.config.activeTriggerCls);
            self.view.style.display = NONE;

            // update
            self.activeIndex = -1;
        }
    });

    S.MegaMenu = MegaMenu;
});

/**
 * TODO:
 *   - 类 YAHOO 首页，内容显示层的位置自适应
 *//**
 * 提示补全组件
 * @module      suggest
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("suggest", function(S) {

    if (KISSY.Suggest) {
        // 共享模式：多个沙箱共用同一个 Suggest
        S.Suggest = KISSY.Suggest;
        return;
    }

    // 延迟到 use 时才初始化，并且仅初始化一次
    S.Suggest = KISSY.Suggest = (function() {

        var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
            win = window, doc = document,
            head = doc.getElementsByTagName("head")[0],
            ie = YAHOO.env.ua.ie, ie6 = (ie === 6),

            CALLBACK_STR = "g_ks_suggest_callback", // 约定的全局回调函数
            STYLE_ID = "suggest-style", // 样式 style 元素的 id

            CONTAINER_CLASS = "suggest-container",
            KEY_EL_CLASS = "suggest-key", // 提示层中，key 元素的 class
            RESULT_EL_CLASS = "suggest-result", // 提示层中，result 元素的 class
            SELECTED_ITEM_CLASS = "selected", // 提示层中，选中项的 class
            BOTTOM_CLASS = "suggest-bottom",
            CLOSE_BTN_CLASS = "suggest-close-btn",
            SHIM_CLASS = "suggest-shim", // iframe shim 的 class

            BEFORE_DATA_REQUEST = "beforeDataRequest",
            ON_DATA_RETURN = "onDataReturn",
            BEFORE_SHOW = "beforeShow",
            ON_ITEM_SELECT = "onItemSelect",

            /**
             * Suggest的默认配置
             */
            defaultConfig = {
                /**
                 * 用户附加给悬浮提示层的 class
                 *
                 * 提示层的默认结构如下：
                 * <div class="suggest-container [container-class]">
                 *     <ol>
                 *         <li>
                 *             <span class="suggest-key">...</span>
                 *             <span class="suggest-result">...</span>
                 *         </li>
                 *     </ol>
                 *     <div class="suggest-bottom">
                 *         <a class="suggest-close-btn">...</a>
                 *     </div>
                 * </div>
                 * @type String
                 */
                containerClass: "",

                /**
                 * 提示层的宽度
                 * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
                 * 示范取值："200px", "10%"等，必须带单位
                 * @type String
                 */
                containerWidth: "auto",

                /**
                 * result的格式
                 * @type String
                 */
                resultFormat: "约%result%条结果",

                /**
                 * 是否显示关闭按钮
                 * @type Boolean
                 */
                showCloseBtn: false,

                /**
                 * 关闭按钮上的文字
                 * @type String
                 */
                closeBtnText: "关闭",

                /**
                 * 是否需要iframe shim
                 * @type Boolean
                 */
                useShim: ie6,

                /**
                 * 定时器的延时
                 * @type Number
                 */
                timerDelay: 200,

                /**
                 * 初始化后，自动激活
                 * @type Boolean
                 */
                autoFocus: false,

                /**
                 * 鼠标点击完成选择时，是否自动提交表单
                 * @type Boolean
                 */
                submitFormOnClickSelect: true
            };

        /**
         * 提示补全组件
         * @class Suggest
         * @requires YAHOO.util.Dom
         * @requires YAHOO.util.Event
         * @constructor
         * @param {String|HTMLElement} textInput
         * @param {String} dataSource
         * @param {Object} config
         */
        function Suggest(textInput, dataSource, config) {

            // allow instantiation without the new operator
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(textInput, dataSource, config);
            }

            /**
             * 文本输入框
             * @type HTMLElement
             */
            this.textInput = Dom.get(textInput);

            /**
             * 获取数据的URL 或 JSON格式的静态数据
             * @type {String|Object}
             */
            this.dataSource = dataSource;

            /**
             * JSON静态数据源
             * @type Object 格式为 {"query1" : [["key1", "result1"], []], "query2" : [[], []]}
             */
            this.JSONDataSource = Lang.isObject(dataSource) ? dataSource : null;

            /**
             * 通过jsonp返回的数据
             * @type Object
             */
            this.returnedData = null;

            /**
             * 配置参数
             * @type Object
             */
            this.config = Lang.merge(defaultConfig, config || {});

            /**
             * 存放提示信息的容器
             * @type HTMLElement
             */
            this.container = null;

            /**
             * 输入框的值
             * @type String
             */
            this.query = "";

            /**
             * 获取数据时的参数
             * @type String
             */
            this.queryParams = "";

            /**
             * 内部定时器
             * @private
             * @type Object
             */
            this._timer = null;

            /**
             * 计时器是否处于运行状态
             * @private
             * @type Boolean
             */
            this._isRunning = false;

            /**
             * 获取数据的script元素
             * @type HTMLElement
             */
            this.dataScript = null;

            /**
             * 数据缓存
             * @private
             * @type Object
             */
            this._dataCache = {};

            /**
             * 最新script的时间戳
             * @type String
             */
            this._latestScriptTime = "";

            /**
             * script返回的数据是否已经过期
             * @type Boolean
             */
            this._scriptDataIsOut = false;

            /**
             * 是否处于键盘选择状态
             * @private
             * @type Boolean
             */
            this._onKeyboardSelecting = false;

            /**
             * 提示层的当前选中项
             * @type Boolean
             */
            this.selectedItem = null;

            // init
            this._init();
        }

        S.mix(Suggest.prototype, {
            /**
             * 初始化方法
             * @protected
             */
            _init: function() {
                // init DOM
                this._initTextInput();
                this._initContainer();
                if (this.config.useShim) this._initShim();
                this._initStyle();

                // create events
                this.createEvent(BEFORE_DATA_REQUEST);
                this.createEvent(ON_DATA_RETURN);
                this.createEvent(BEFORE_SHOW);
                this.createEvent(ON_ITEM_SELECT);

                // window resize event
                this._initResizeEvent();
            },

            /**
             * 初始化输入框
             * @protected
             */
            _initTextInput: function() {
                var instance = this;

                // turn off autocomplete
                this.textInput.setAttribute("autocomplete", "off");

                // focus
                // 2009-12-10 yubo: 延迟到 keydown 中 start
                //            Event.on(this.textInput, "focus", function() {
                //                instance.start();
                //            });

                // blur
                Event.on(this.textInput, "blur", function() {
                    instance.stop();
                    instance.hide();
                });

                // auto focus
                if (this.config.autoFocus) this.textInput.focus();

                // keydown
                // 注：截至目前，在Opera9.64中，输入法开启时，依旧不会触发任何键盘事件
                var pressingCount = 0; // 持续按住某键时，连续触发的keydown次数。注意Opera只会触发一次。
                Event.on(this.textInput, "keydown", function(ev) {
                    var keyCode = ev.keyCode;
                    //console.log("keydown " + keyCode);

                    switch (keyCode) {
                        case 27: // ESC键，隐藏提示层并还原初始输入
                            instance.hide();
                            instance.textInput.value = instance.query;
                            break;
                        case 13: // ENTER键
                            // 提交表单前，先隐藏提示层并停止计时器
                            instance.textInput.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                            // 如果是键盘选中某项后回车，触发onItemSelect事件
                            if (instance._onKeyboardSelecting) {
                                if (instance.textInput.value == instance._getSelectedItemKey()) { // 确保值匹配
                                    instance.fireEvent(ON_ITEM_SELECT, instance.textInput.value);
                                }
                            }

                            // 提交表单
                            instance._submitForm();

                            break;
                        case 40: // DOWN键
                        case 38: // UP键
                            // 按住键不动时，延时处理
                            if (pressingCount++ == 0) {
                                if (instance._isRunning) instance.stop();
                                instance._onKeyboardSelecting = true;
                                instance.selectItem(keyCode == 40);

                            } else if (pressingCount == 3) {
                                pressingCount = 0;
                            }
                            break;
                    }

                    // 非 DOWN/UP 键时，开启计时器
                    if (keyCode != 40 && keyCode != 38) {
                        if (!instance._isRunning) {
                            // 1. 当网速较慢，js还未下载完时，用户可能就已经开始输入
                            //    这时，focus事件已经不会触发，需要在keyup里触发定时器
                            // 2. 非DOWN/UP键时，需要激活定时器
                            instance.start();
                        }
                        instance._onKeyboardSelecting = false;
                    }
                });

                // reset pressingCount
                Event.on(this.textInput, "keyup", function() {
                    //console.log("keyup");
                    pressingCount = 0;
                });
            },

            /**
             * 初始化提示层容器
             * @protected
             */
            _initContainer: function() {
                // create
                var container = doc.createElement("div"),
                    customContainerClass = this.config.containerClass;

                container.className = CONTAINER_CLASS;
                if (customContainerClass) {
                    container.className += " " + customContainerClass;
                }
                container.style.position = "absolute";
                container.style.visibility = "hidden";
                this.container = container;

                this._setContainerRegion();
                this._initContainerEvent();

                // append
                doc.body.insertBefore(container, doc.body.firstChild);
            },

            /**
             * 设置容器的left, top, width
             * @protected
             */
            _setContainerRegion: function() {
                var r = Dom.getRegion(this.textInput);
                var left = r.left, w = r.right - left - 2;  // 减去border的2px

                // bug fix: w 应该判断下是否大于 0, 后边设置 width 的时候如果小于 0, ie 下会报参数无效的错误
                w = w > 0 ? w : 0;

                // ie8兼容模式
                // document.documentMode:
                // 5 - Quirks Mode
                // 7 - IE7 Standards
                // 8 - IE8 Standards
                var docMode = doc.documentMode;
                if (docMode === 7 && (ie === 7 || ie === 8)) {
                    left -= 2;
                } else if (YAHOO.env.ua.gecko) { // firefox下左偏一像素 注：当 input 所在的父级容器有 margin: auto 时会出现
                    left++;
                }

                this.container.style.left = left + "px";
                this.container.style.top = r.bottom + "px";

                if (this.config.containerWidth == "auto") {
                    this.container.style.width = w + "px";
                } else {
                    this.container.style.width = this.config.containerWidth;
                }
            },

            /**
             * 初始化容器事件
             * 子元素都不用设置事件，冒泡到这里统一处理
             * @protected
             */
            _initContainerEvent: function() {
                var instance = this;

                // 鼠标事件
                Event.on(this.container, "mousemove", function(ev) {
                    //console.log("mouse move");
                    var target = Event.getTarget(ev);

                    if (target.nodeName != "LI") {
                        target = Dom.getAncestorByTagName(target, "li");
                    }
                    if (Dom.isAncestor(instance.container, target)) {
                        if (target != instance.selectedItem) {
                            // 移除老的
                            instance._removeSelectedItem();
                            // 设置新的
                            instance._setSelectedItem(target);
                        }
                    }
                });

                var mouseDownItem = null;
                this.container.onmousedown = function(e) {
                    e = e || win.event;
                    // 鼠标按下处的item
                    mouseDownItem = e.target || e.srcElement;

                    // 鼠标按下时，让输入框不会失去焦点
                    // 1. for IE
                    instance.textInput.onbeforedeactivate = function() {
                        win.event.returnValue = false;
                        instance.textInput.onbeforedeactivate = null;
                    };
                    // 2. for W3C
                    return false;
                };

                // mouseup事件
                Event.on(this.container, "mouseup", function(ev) {
                    // 当mousedown在提示层，但mouseup在提示层外时，点击无效
                    if (!instance._isInContainer(Event.getXY(ev))) return;
                    var target = Event.getTarget(ev);
                    // 在提示层A项处按下鼠标，移动到B处释放，不触发onItemSelect
                    if (target != mouseDownItem) return;

                    // 点击在关闭按钮上
                    if (target.className == CLOSE_BTN_CLASS) {
                        instance.hide();
                        return;
                    }

                    // 可能点击在li的子元素上
                    if (target.nodeName != "LI") {
                        target = Dom.getAncestorByTagName(target, "li");
                    }
                    // 必须点击在container内部的li上
                    if (Dom.isAncestor(instance.container, target)) {
                        instance._updateInputFromSelectItem(target);

                        // 触发选中事件
                        //console.log("on item select");
                        instance.fireEvent(ON_ITEM_SELECT, instance.textInput.value);

                        // 提交表单前，先隐藏提示层并停止计时器
                        instance.textInput.blur();

                        // 提交表单
                        instance._submitForm();
                    }
                });
            },

            /**
             * click选择 or enter后，提交表单
             */
            _submitForm: function() {
                // 注：对于键盘控制enter选择的情况，由html自身决定是否提交。否则会导致某些输入法下，用enter选择英文时也触发提交
                if (this.config.submitFormOnClickSelect) {
                    var form = this.textInput.form;
                    if (!form) return;

                    // 通过js提交表单时，不会触发onsubmit事件
                    // 需要js自己触发
                    if (doc.createEvent) { // w3c
                        var evObj = doc.createEvent("MouseEvents");
                        evObj.initEvent("submit", true, false);
                        form.dispatchEvent(evObj);
                    }
                    else if (doc.createEventObject) { // ie
                        form.fireEvent("onsubmit");
                    }

                    form.submit();
                }
            },

            /**
             * 判断p是否在提示层内
             * @param {Array} p [x, y]
             */
            _isInContainer: function(p) {
                var r = Dom.getRegion(this.container);
                return p[0] >= r.left && p[0] <= r.right && p[1] >= r.top && p[1] <= r.bottom;
            },

            /**
             * 给容器添加iframe shim层
             * @protected
             */
            _initShim: function() {
                var iframe = doc.createElement("iframe");
                iframe.src = "about:blank";
                iframe.className = SHIM_CLASS;
                iframe.style.position = "absolute";
                iframe.style.visibility = "hidden";
                iframe.style.border = "none";
                this.container.shim = iframe;

                this._setShimRegion();
                doc.body.insertBefore(iframe, doc.body.firstChild);
            },

            /**
             * 设置shim的left, top, width
             * @protected
             */
            _setShimRegion: function() {
                var container = this.container, shim = container.shim;
                if (shim) {
                    shim.style.left = (parseInt(container.style.left) - 2) + "px"; // 解决吞边线bug
                    shim.style.top = container.style.top;
                    shim.style.width = (parseInt(container.style.width) + 2) + "px";
                }
            },

            /**
             * 初始化样式
             * @protected
             */
            _initStyle: function() {
                var styleEl = Dom.get(STYLE_ID);
                if (styleEl) return; // 防止多个实例时重复添加

                var style = ".suggest-container{background:white;border:1px solid #999;z-index:99999}"
                    + ".suggest-shim{z-index:99998}"
                    + ".suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}"
                    + ".suggest-container li.selected{background-color:#39F;cursor:default}"
                    + ".suggest-key{float:left;text-align:left;padding-left:5px}"
                    + ".suggest-result{float:right;text-align:right;padding-right:5px;color:green}"
                    + ".suggest-container li.selected span{color:#FFF;cursor:default}"
                    // + ".suggest-container li.selected .suggest-result{color:green}"
                    + ".suggest-bottom{padding:0 5px 5px}"
                    + ".suggest-close-btn{float:right}"
                    + ".suggest-container li,.suggest-bottom{overflow:hidden;zoom:1;clear:both}"
                    /* hacks */
                    + ".suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}";

                styleEl = doc.createElement("style");
                styleEl.id = STYLE_ID;
                styleEl.type = "text/css";
                head.appendChild(styleEl); // 先添加到DOM树中，都在cssText里的hack会失效

                if (styleEl.styleSheet) { // IE
                    styleEl.styleSheet.cssText = style;
                } else { // W3C
                    styleEl.appendChild(doc.createTextNode(style));
                }
            },

            /**
             * window.onresize时，调整提示层的位置
             * @protected
             */
            _initResizeEvent: function() {
                var instance = this, resizeTimer;

                Event.on(win, "resize", function() {
                    if (resizeTimer) {
                        clearTimeout(resizeTimer);
                    }

                    resizeTimer = setTimeout(function() {
                        instance._setContainerRegion();
                        instance._setShimRegion();
                    }, 50);
                });
            },

            /**
             * 启动计时器，开始监听用户输入
             */
            start: function() {
                Suggest.focusInstance = this;

                var instance = this;
                instance._timer = setTimeout(function() {
                    instance.updateContent();
                    instance._timer = setTimeout(arguments.callee, instance.config.timerDelay);
                }, instance.config.timerDelay);

                this._isRunning = true;
            },

            /**
             * 停止计时器
             */
            stop: function() {
                Suggest.focusInstance = null;
                clearTimeout(this._timer);
                this._isRunning = false;
            },

            /**
             * 显示提示层
             */
            show: function() {
                if (this.isVisible()) return;
                var container = this.container, shim = container.shim;

                container.style.visibility = "";

                if (shim) {
                    if (!shim.style.height) { // 第一次显示时，需要设定高度
                        var r = Dom.getRegion(container);
                        shim.style.height = (r.bottom - r.top - 2) + "px";
                    }
                    shim.style.visibility = "";
                }
            },

            /**
             * 隐藏提示层
             */
            hide: function() {
                if (!this.isVisible()) return;
                var container = this.container, shim = container.shim;
                //console.log("hide");

                if (shim) shim.style.visibility = "hidden";
                container.style.visibility = "hidden";
            },

            /**
             * 提示层是否显示
             */
            isVisible: function() {
                return this.container.style.visibility != "hidden";
            },

            /**
             * 更新提示层的数据
             */
            updateContent: function() {
                if (!this._needUpdate()) return;
                //console.log("update data");

                this._updateQueryValueFromInput();
                var q = this.query;

                // 1. 输入为空时，隐藏提示层
                if (!Lang.trim(q).length) {
                    this._fillContainer("");
                    this.hide();
                    return;
                }

                if (typeof this._dataCache[q] != "undefined") { // 2. 使用缓存数据
                    //console.log("use cache");
                    this.returnedData = "using cache";
                    this._fillContainer(this._dataCache[q]);
                    this._displayContainer();

                } else if (this.JSONDataSource) { // 3. 使用JSON静态数据源
                    this.handleResponse(this.JSONDataSource[q]);

                } else { // 4. 请求服务器数据
                    this.requestData();
                }
            },

            /**
             * 是否需要更新数据
             * @protected
             * @return Boolean
             */
            _needUpdate: function() {
                // 注意：加入空格也算有变化
                return this.textInput.value != this.query;
            },

            /**
             * 通过script元素加载数据
             */
            requestData: function() {
                //console.log("request data via script");
                if (!ie) this.dataScript = null; // IE不需要重新创建script元素

                if (!this.dataScript) {
                    var script = doc.createElement("script");
                    script.type = "text/javascript";
                    script.charset = "utf-8";

                    // jQuery ajax.js line 275:
                    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                    // This arises when a base node is used.
                    head.insertBefore(script, head.firstChild);
                    this.dataScript = script;

                    if (!ie) {
                        var t = new Date().getTime();
                        this._latestScriptTime = t;
                        script.setAttribute("time", t);

                        Event.on(script, "load", function() {
                            //console.log("on load");
                            // 判断返回的数据是否已经过期
                            this._scriptDataIsOut = script.getAttribute("time") != this._latestScriptTime;
                        }, this, true);
                    }
                }

                // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
                this.queryParams = "q=" + encodeURIComponent(this.query) + "&code=utf-8&callback=" + CALLBACK_STR;
                this.fireEvent(BEFORE_DATA_REQUEST, this.query);
                this.dataScript.src = this.dataSource + "?" + this.queryParams;
            },

            /**
             * 处理获取的数据
             * @param {Object} data
             */
            handleResponse: function(data) {
                //console.log("handle response");
                if (this._scriptDataIsOut) return; // 抛弃过期数据，否则会导致bug：1. 缓存key值不对； 2. 过期数据导致的闪屏

                this.returnedData = data;
                this.fireEvent(ON_DATA_RETURN, data);

                // 格式化数据
                this.returnedData = this.formatData(this.returnedData);

                // 填充数据
                var content = "";
                var len = this.returnedData.length;
                if (len > 0) {
                    var list = doc.createElement("ol");
                    for (var i = 0; i < len; ++i) {
                        var itemData = this.returnedData[i];
                        var li = this.formatItem(itemData["key"], itemData["result"]);
                        // 缓存key值到attribute上
                        li.setAttribute("key", itemData["key"]);
                        list.appendChild(li);
                    }
                    content = list;
                }
                this._fillContainer(content);

                // 有内容时才添加底部
                if (len > 0) this.appendBottom();

                // fire event
                if (Lang.trim(this.container.innerHTML)) {
                    // 实际上是beforeCache，但从用户的角度看，是beforeShow
                    this.fireEvent(BEFORE_SHOW, this.container);
                }

                // cache
                this._dataCache[this.query] = this.container.innerHTML;

                // 显示容器
                this._displayContainer();
            },

            /**
             * 格式化输入的数据对象为标准格式
             * @param {Object} data 格式可以有3种：
             *  1. {"result" : [["key1", "result1"], ["key2", "result2"], ...]}
             *  2. {"result" : ["key1", "key2", ...]}
             *  3. 1和2的组合
             *  4. 标准格式
             *  5. 上面1-4中，直接取o["result"]的值
             * @return Object 标准格式的数据：
             *  [{"key" : "key1", "result" : "result1"}, {"key" : "key2", "result" : "result2"}, ...]
             */
            formatData: function(data) {
                var arr = [];
                if (!data) return arr;
                if (Lang.isArray(data["result"])) data = data["result"];
                var len = data.length;
                if (!len) return arr;

                var item;
                for (var i = 0; i < len; ++i) {
                    item = data[i];

                    if (Lang.isString(item)) { // 只有key值时
                        arr[i] = {"key" : item};
                    } else if (Lang.isArray(item) && item.length >= 2) { // ["key", "result"] 取数组前2个
                        arr[i] = {"key" : item[0], "result" : item[1]};
                    } else {
                        arr[i] = item;
                    }
                }
                return arr;
            },

            /**
             * 格式化输出项
             * @param {String} key 查询字符串
             * @param {Number} result 结果 可不设
             * @return {HTMLElement}
             */
            formatItem: function(key, result) {
                var li = doc.createElement("li");
                var keyEl = doc.createElement("span");
                keyEl.className = KEY_EL_CLASS;
                keyEl.appendChild(doc.createTextNode(key));
                li.appendChild(keyEl);

                if (typeof result != "undefined") { // 可以没有
                    var resultText = this.config.resultFormat.replace("%result%", result);
                    if (Lang.trim(resultText)) { // 有值时才创建
                        var resultEl = doc.createElement("span");
                        resultEl.className = RESULT_EL_CLASS;
                        resultEl.appendChild(doc.createTextNode(resultText));
                        li.appendChild(resultEl);
                    }
                }

                return li;
            },

            /**
             * 添加提示层底部
             */
            appendBottom: function() {
                var bottom = doc.createElement("div");
                bottom.className = BOTTOM_CLASS;

                if (this.config.showCloseBtn) {
                    var closeBtn = doc.createElement("a");
                    closeBtn.href = "javascript: void(0)";
                    closeBtn.setAttribute("target", "_self"); // bug fix: 覆盖<base target="_blank" />，否则会弹出空白页面
                    closeBtn.className = CLOSE_BTN_CLASS;
                    closeBtn.appendChild(doc.createTextNode(this.config.closeBtnText));

                    // 没必要，点击时，输入框失去焦点，自动就关闭了
                    /*
                     Event.on(closeBtn, "click", function(ev) {
                     Event.stopEvent(ev);
                     this.hidden();
                     }, this, true);
                     */

                    bottom.appendChild(closeBtn);
                }

                // 仅当有内容时才添加
                if (Lang.trim(bottom.innerHTML)) {
                    this.container.appendChild(bottom);
                }
            },

            /**
             * 填充提示层
             * @protected
             * @param {String|HTMLElement} content innerHTML or Child Node
             */
            _fillContainer: function(content) {
                if (content.nodeType == 1) {
                    this.container.innerHTML = "";
                    this.container.appendChild(content);
                } else {
                    this.container.innerHTML = content;
                }

                // 一旦重新填充了，selectedItem就没了，需要重置
                this.selectedItem = null;
            },

            /**
             * 根据contanier的内容，显示或隐藏容器
             */
            _displayContainer: function() {
                if (Lang.trim(this.container.innerHTML)) {
                    this.show();
                } else {
                    this.hide();
                }
            },

            /**
             * 选中提示层中的上/下一个条
             * @param {Boolean} down true表示down，false表示up
             */
            selectItem: function(down) {
                //console.log("select item " + down);
                var items = this.container.getElementsByTagName("li");
                if (items.length == 0) return;

                // 有可能用ESC隐藏了，直接显示即可
                if (!this.isVisible()) {
                    this.show();
                    return; // 保留原来的选中状态
                }
                var newSelectedItem;

                // 没有选中项时，选中第一/最后项
                if (!this.selectedItem) {
                    newSelectedItem = items[down ? 0 : items.length - 1];
                } else {
                    // 选中下/上一项
                    newSelectedItem = Dom[down ? "getNextSibling" : "getPreviousSibling"](this.selectedItem);
                    // 已经到了最后/前一项时，归位到输入框，并还原输入值
                    if (!newSelectedItem) {
                        this.textInput.value = this.query;
                    }
                }

                // 移除当前选中项
                this._removeSelectedItem();

                // 选中新项
                if (newSelectedItem) {
                    this._setSelectedItem(newSelectedItem);
                    this._updateInputFromSelectItem();
                }
            },

            /**
             * 移除选中项
             * @protected
             */
            _removeSelectedItem: function() {
                //console.log("remove selected item");
                Dom.removeClass(this.selectedItem, SELECTED_ITEM_CLASS);
                this.selectedItem = null;
            },

            /**
             * 设置当前选中项
             * @protected
             * @param {HTMLElement} item
             */
            _setSelectedItem: function(item) {
                //console.log("set selected item");
                Dom.addClass((item), SELECTED_ITEM_CLASS);
                this.selectedItem = (item);
            },

            /**
             * 获取提示层中选中项的key字符串
             * @protected
             */
            _getSelectedItemKey: function() {
                if (!this.selectedItem) return "";

                // getElementsByClassName比较损耗性能，改用缓存数据到attribute上方法
                //var keyEl = Dom.getElementsByClassName(KEY_EL_CLASS, "*", this.selectedItem)[0];
                //return keyEl.innerHTML;

                return this.selectedItem.getAttribute("key");
            },

            /**
             * 将textInput的值更新到this.query
             * @protected
             */
            _updateQueryValueFromInput: function() {
                this.query = this.textInput.value;
            },

            /**
             * 将选中项的值更新到textInput
             * @protected
             */
            _updateInputFromSelectItem: function() {
                this.textInput.value = this._getSelectedItemKey(this.selectedItem);
            }

        });

        S.augment(Suggest, Y.EventProvider);

        /**
         * 约定的全局回调函数
         */
        win[CALLBACK_STR] = function(data) {
            if (!Suggest.focusInstance) return;
            // 使得先运行 script.onload 事件，然后再执行 callback 函数
            setTimeout(function() {
                Suggest.focusInstance.handleResponse(data);
            }, 0);
        };

        return Suggest;
    })();
});


/**
 * 小结：
 *
 * 整个组件代码，由两大部分组成：数据处理 + 事件处理
 *
 * 一、数据处理很core，但相对来说是简单的，由 requestData + handleResponse + formatData等辅助方法组成
 * 需要注意两点：
 *  a. IE中，改变script.src, 会自动取消掉之前的请求，并发送新请求。非IE中，必须新创建script才行。这是
 *     requestData方法中存在两种处理方式的原因。
 *  b. 当网速很慢，数据返回时，用户的输入可能已改变，已经有请求发送出去，需要抛弃过期数据。目前采用加时间戳
 *     的解决方案。更好的解决方案是，调整API，使得返回的数据中，带有query值。
 *
 * 二、事件处理看似简单，实际上有不少陷阱，分2部分：
 *  1. 输入框的focus/blur事件 + 键盘控制事件
 *  2. 提示层上的鼠标悬浮和点击事件
 * 需要注意以下几点：
 *  a. 因为点击提示层时，首先会触发输入框的blur事件，blur事件中调用hide方法，提示层一旦隐藏后，就捕获不到
 *     点击事件了。因此有了 this._mouseHovering 来排除这种情况，使得blur时不会触发hide，在提示层的点击
 *     事件中自行处理。（2009-06-18更新：采用mouseup来替代click事件，代码清晰简单了很多）
 *  b. 当鼠标移动到某项或通过上下键选中某项时，给this.selectedItem赋值；当提示层的数据重新填充时，重置
 *     this.selectedItem. 这种处理方式和google的一致，可以使得选中某项，隐藏，再次打开时，依旧选中原来
 *     的选中项。
 *  c. 在ie等浏览器中，输入框中输入ENTER键时，会自动提交表单。如果form.target="_blank", 自动提交和JS提交
 *     会打开两个提交页面。因此这里采取了在JS中不提交的策略，ENTER键是否提交表单，完全由HTML代码自身决定。这
 *     样也能使得组件很容易应用在不需要提交表单的场景中。（2009-06-18更新：可以通过blur()取消掉浏览器的默认
 *     Enter响应，这样能使得代码逻辑和mouseup的一致）
 *  d. onItemSelect 仅在鼠标点击选择某项 和 键盘选中某项回车 后触发。
 *  e. 当textInput会触发表单提交时，在enter keydown 和 keyup之间，就会触发提交。因此在keydown中捕捉事件。
 *     并且在keydown中能捕捉到持续DOWN/UP，在keyup中就不行了。
 *
 * 【得到的一些编程经验】：
 *  1. 职责单一原则。方法的职责要单一，比如hide方法和show方法，除了改变visibility, 就不要拥有其它功能。这
 *     看似简单，真要做到却并不容易。保持职责单一，保持简单的好处是，代码的整体逻辑更清晰，方法的可复用性也提
 *     高了。
 *  2. 小心事件处理。当事件之间有关联时，要仔细想清楚，设计好后再写代码。比如输入框的blur和提示层的click事件。
 *  3. 测试的重要性。目前是列出Test Cases，以后要尝试自动化。保证每次改动后，都不影响原有功能。
 *  4. 挑选正确的事件做正确的事，太重要了，能省去很多很多烦恼。
 *
 */

/**
 * 2009-08-05 更新： 将 class 从配置项中移动到常量，原因是：修改默认 className 的可能性很小，仅保留一个
 *                  containerClass 作为个性化样式的接口即可
 *
 * 2009-12-10 更新： 采用 kissy module 组织代码。为了避免多个沙箱下，对全局回调函数覆盖定义引发的问题，
 *                  采用共享模式。
 */
