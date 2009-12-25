/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-25 18:42:50
Revision: 362
*/
/**
 * 数据延迟加载组件
 * 包括 img, textarea, 以及特定元素即将出现时的回调函数
 * @module      datalazyload
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("datalazyload", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        win = window, doc = document,
        DATA_SRC = "data-lazyload-src",
        LAZY_TEXTAREA_CLS = "ks-datalazyload",
        CUSTOM_LAZYLOAD_CLS = "ks-datalazyload-custom",
        MOD = { AUTO: "auto", MANUAL: "manual" },
        DEFAULT = "default",

        defaultConfig = {

            /**
             * 懒处理模式
             *   auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *   manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 DATA_SRC
             * 注：对于 textarea 数据，只有手动模式
             */
            mod: MOD.MANUAL,

            /**
             * 当前视窗往下，diff px 外的 img/textarea 延迟加载
             * 适当设置此值，可以让用户在拖动时感觉数据已经加载好
             * 默认为当前视窗高度（两屏以外的才延迟加载）
             */
            diff: DEFAULT,

            /**
             * 图像的占位图
             */
            placeholder: "http://a.tbcdn.cn/kissy/1.0.2/build/datalazyload/dot.gif"
        };

    /**
     * 延迟加载组件
     * @constructor
     */
    function DataLazyload(containers, config) {
        var self = this;
        
        // factory or constructor
        if (!(self instanceof arguments.callee)) {
            return new arguments.callee(containers, config);
        }

        // 允许仅传递 config 一个参数
        if (typeof config === "undefined") {
            config = containers;
            containers = [doc];
        }

        // containers 是一个 HTMLElement 时
        if (!Lang.isArray(containers)) {
            containers = [Dom.get(containers) || doc];
        }

        /**
         * 图片所在容器（可以多个），默认为 [doc]
         * @type Array
         */
        self.containers = containers;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || {});

        /**
         * 需要延迟下载的图片
         * @type Array
         */
        //self.images

        /**
         * 需要延迟处理的 textarea
         * @type Array
         */
        //self.areaes

        /**
         * 和延迟项绑定的回调函数
         * @type object
         */
        self.callbacks = {els: [], fns: []};

        /**
         * 开始延迟的 Y 坐标
         * @type number
         */
        //self.threshold

        self._init();
    }

    S.mix(DataLazyload.prototype, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            var self = this;
            
            self.threshold = self._getThreshold();
            self._filterItems();

            if (self._getItemsLength()) {
                self._initLoadEvent();
            }
        },

        /**
         * 初始化加载事件
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this;

            // scroll 和 resize 时，加载图片
            Event.on(win, "scroll", loader);
            Event.on(win, "resize", function() {
                self.threshold = self._getThreshold();
                loader();
            });

            // 需要立即加载一次，以保证第一屏的延迟项可见
            if (self._getItemsLength()) {
                Event.onDOMReady(function() {
                    loadItems();
                });
            }

            // 加载函数
            function loader() {
                if (timer) return;
                timer = setTimeout(function() {
                    loadItems();
                    timer = null;
                }, 100); // 0.1s 内，用户感觉流畅
            }

            // 加载延迟项
            function loadItems() {
                self._loadItems();

                if (self._getItemsLength() === 0) {
                    Event.removeListener(win, "scroll", loader);
                    Event.removeListener(win, "resize", loader);
                }
            }
        },

        /**
         * 获取并初始化需要延迟的 img 和 textarea
         * @protected
         */
        _filterItems: function() {
            var self = this,
                containers = self.containers,
                threshold = self.threshold,
                placeholder = self.config.placeholder,
                isManualMod = self.config.mod === MOD.MANUAL,
                n, N, imgs, areaes, i, len, img, data_src,
                lazyImgs = [], lazyAreaes = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = containers[n].getElementsByTagName("img");

                for (i = 0,len = imgs.length; i < len; ++i) {
                    img = imgs[i];
                    data_src = img.getAttribute(DATA_SRC);

                    if (isManualMod) { // 手工模式，只处理有 data-src 的图片
                        if (data_src) {
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    } else { // 自动模式，只处理 threshold 外无 data-src 的图片
                        // 注意：已有 data-src 的项，可能已有其它实例处理过，重复处理
                        // 会导致 data-src 变成 placeholder
                        if (Dom.getY(img) > threshold && !data_src) {
                            img.setAttribute(DATA_SRC, img.src);
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    }
                }

                // 处理 textarea
                areaes = containers[n].getElementsByTagName("textarea");
                for( i = 0, len = areaes.length; i < len; ++i) {
                    if(Dom.hasClass(areaes[i], LAZY_TEXTAREA_CLS)) {
                        lazyAreaes.push(areaes[i]);
                    }
                }
            }

            self.images = lazyImgs;
            self.areaes = lazyAreaes;
        },

        /**
         * 加载延迟项
         */
        _loadItems: function() {
            var self = this;
            
            self._loadImgs();
            self._loadAreaes();
            self._fireCallbacks();
        },

        /**
         * 加载图片
         * @protected
         */
        _loadImgs: function() {
            var self = this,
                imgs = self.images,
                scrollTop = Dom.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, img, data_src, remain = [];

            for (i = 0; img = imgs[i++];) {
                if (Dom.getY(img) <= threshold) {
                    data_src = img.getAttribute(DATA_SRC);

                    if (data_src && img.src != data_src) {
                        img.src = data_src;
                        img.removeAttribute(DATA_SRC);
                    }
                } else {
                    remain.push(img);
                }
            }

            self.images = remain;
        },

        /**
         * 加载 textarea 数据
         * @protected
         */
        _loadAreaes: function() {
            var self = this,
                areaes = self.areaes,
                scrollTop = Dom.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, area, parent, remain = [];

            for (i = 0; area = areaes[i++];) {
                parent = area.parentNode;
                // 注：area 可能处于 display: none 状态，Dom.getY(area) 获取不到 Y 值
                //    因此这里采用 area.parentNode
                if (Dom.getY(parent) <= threshold) {
                    parent.innerHTML = area.value;
                } else {
                    remain.push(area);
                }
            }

            self.areaes = remain;
        },

        /**
         * 触发回调
         * @protected
         */
        _fireCallbacks: function() {
            var self = this,
                callbacks = self.callbacks,
                els = callbacks.els, fns = callbacks.fns,
                scrollTop = Dom.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, el, fn, remainEls = [], remainFns = [];

            for (i = 0; (el = els[i]) && (fn = fns[i++]);) {
                if (Dom.getY(el) <= threshold) {
                    fn.call(el);
                } else {
                    remainEls.push(el);
                    remainFns.push(fn);
                }

            }

            callbacks.els = remainEls;
            callbacks.fns = remainFns;
        },

        /**
         * 添加回调函数。当 el 即将出现在视图中时，触发 fn
         */
        addCallback: function(el, fn) {
            el = Dom.get(el);
            if(el && typeof fn === "function") {
                this.callbacks.els.push(el);
                this.callbacks.fns.push(fn);
            }
        },

        /**
         * 获取阈值
         * @protected
         */
        _getThreshold: function() {
            var diff = this.config.diff,
                ret = Dom.getViewportHeight();

            if (diff === DEFAULT) return 2 * ret; // diff 默认为当前视窗高度（两屏以外的才延迟加载）
            else return ret + diff;
        },

        /**
         * 获取当前延迟项的数量
         * @protected
         */
        _getItemsLength: function() {
            var self = this;
            return self.images.length + self.areaes.length + self.callbacks.els.length;
        },

        /**
         * 加载自定义延迟数据
         */
        loadCustomLazyData: function(parent) {
            var textarea = parent.getElementsByTagName("textarea")[0];
            if (textarea && Dom.hasClass(textarea, CUSTOM_LAZYLOAD_CLS)) {
                parent.innerHTML = textarea.value;
            }
        }
    });

    S.DataLazyload = DataLazyload;
});

/**
 * NOTES:
 *
 * 模式为 auto 时：
 *  1. 在 Firefox 下非常完美。脚本运行时，还没有任何图片开始下载，能真正做到延迟加载。
 *  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 abort 掉，
 *     再在滚动时延迟加载，反而增加了链接数。
 *  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 abort 掉下载。该
 *     脚本完全无用。
 *  4. 在 Opera 下，和 Firefox 一致，完美。
 *
 * 模式为 manual 时：（要延迟加载的图片，src 属性替换为 data-lazyload-src, 并将 src 的值赋为 placeholder ）
 *  1. 在任何浏览器下都可以完美实现。
 *  2. 缺点是不渐进增强，无 JS 时，图片不能展示。
 *
 * 缺点：
 *  1. 对于大部分情况下，需要拖动查看内容的页面（比如搜索结果页），快速滚动时加载有损用
 *     户体验（用户期望所滚即所得），特别是网速不好时。
 *  2. auto 模式不支持 Webkit 内核浏览器；IE 下，有可能导致 HTTP 链接数的增加。
 *
 * 优点：
 *  1. 可以很好的提高页面初始加载速度。
 *  2. 第一屏就跳转，延迟加载图片可以减少流量。
 *
 * 参考资料：
 *  1. http://davidwalsh.name/lazyload MooTools 的图片延迟插件
 *  2. http://vip.qq.com/ 模板输出时，就替换掉图片的 src
 *  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
 *  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-images/
 *  5. http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
 *
 * 特别要注意的测试用例:
 *  1. 初始窗口很小，拉大窗口时，图片加载正常
 *  2. 页面有滚动位置时，刷新页面，图片加载正常
 *  3. 手动模式，第一屏有延迟图片时，加载正常
 *
 * 2009-12-17 补充：
 *  1. textarea 延迟加载约定：页面中需要延迟的 dom 节点，放在
 *       <textarea class="ks-datalazysrc invisible">dom code</textarea>
 *     里。可以添加 hidden 等 class, 但建议用 invisible, 并设定 height = "实际高度".
 *     这样可以保证滚动时，diff 更真实有效。
 *     注意：textarea 加载后，会替换掉父容器中的所有内容。
 *  2. 延迟 callback 约定：dataLazyload.addCallback(el, fn) 表示当 el 即将出现时，触发 fn.
 *  3. 所有操作都是最多触发一次，比如 callback. 来回拖动滚动条时，只有 el 第一次出现时会触发 fn 回调。
 */

/**
 * TODOs:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 */

/**
 * UPDATE LOG:
 *   - 2009-12-17 yubo 将 imglazyload 升级为 datalazyload, 支持 textarea 方式延迟和特定元素即将出现时的回调函数
 *//**
 * Triggerable
 * @module      triggerable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event, event-mouseenter
 */
KISSY.add("triggerable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        BEFORE_SWITCH = "beforeSwitch",
        ON_SWITCH = "onSwitch";

    /**
     * Triggerable
     * @constructor
     * 约定：
     *   - this.config.triggerType   触发类型。默认为 mouse
     *   - this.config.triggerDelay  触发延迟。默认为 0.1s
     *   - this.triggers
     *   - this.panels
     *   - this.activeIndex
     */
    function Triggerable() {
    }

    S.mix(Triggerable.prototype, {

        /**
         * 初始化 triggers
         */
        _initTriggers: function() {
            var self = this;
            
            // create custom events
            self.createEvent(BEFORE_SWITCH);
            self.createEvent(ON_SWITCH);

            // bind triggers events
            self._bindTriggers();
        },

        /**
         * 给 triggers 添加事件

         */
        _bindTriggers: function() {
            var self = this,
                cfg = self.config, triggers = self.triggers,
                i, len = triggers.length, trigger;

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
         * @protected
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if(self.activeIndex === index) return; // 重复点击
            if(self.showTimer) self.showTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         * @protected
         */
        _onMouseEnterTrigger: function(index) {
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);
            var self = this;

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (self.activeIndex !== index) {
                self.showTimer = Lang.later(self.config.triggerDelay * 1000, self, function() {
                    self.switchTo(index);
                });
            }
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         * @protected
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.showTimer) self.showTimer.cancel();
        },

        /**
         * 切换操作
         */
        switchTo: function(index) {
            var self = this, cfg = self.config,
                activeIndex  =self.activeIndex,
                triggers = self.triggers,
                panels = self.panels,
                fromPanel = panels[self.activeIndex],
                toPanel = panels[index];

            //S.log("Triggerable.switchTo: index = " + index);

            // fire beforeSwitch
            if(!self.fireEvent(BEFORE_SWITCH, index)) return self;
            // TODO: YUI 2.8.0r4 bug - don't pass multi args correctly
            //if(!self.fireEvent(BEFORE_SWITCH, fromPanel, toPanel, index)) return self;

            // 切换 active trigger
            if(activeIndex >= 0) { // 有可能为 -1, 表示没有当前项
                Dom.removeClass(triggers[activeIndex], cfg.activeTriggerCls);
            }
            Dom.addClass(triggers[index], cfg.activeTriggerCls);

            // 加载延迟数据
            if (self.loadCustomLazyData && toPanel.nodeType === 1) {
                self.loadCustomLazyData(toPanel);
            }

            // 切换 content
            self._switchContent(fromPanel, toPanel, index);

            // 更新 activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换内容
         * @protected
         */
        _switchContent: function(fromPanel, toPanel, index) {
            var self = this;

            // 最简单的切换效果：直接隐藏/显示
            fromPanel.style.display = "none";
            toPanel.style.display = "block";

            // fire onSwitch
            self.fireEvent(ON_SWITCH, index);
            // TODO: see above TODO
            //self.fireEvent(ON_SWITCH, toPanel, index);
        }
    });

    S.augment(Triggerable, Y.EventProvider);
    if(S.DataLazyload) {
        S.augment(Triggerable, S.DataLazyload, true, ["loadCustomLazyData"]);
    }

    S.Triggerable = Triggerable;
});
/**
 * TabView
 * @module      tabview
 * @creator     玉伯<lifesinger@gmail.com>, 云谦<yunqian@taobao.com>
 * @depends     yahoo-dom-event, kissy-core, triggerable
 */
KISSY.add("tabview", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        CLS_PREFIX = "ks-tabview-",

        defaultConfig = {
            mackupType: 0, // mackup 的类型，取值如下：

            // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
            navCls: CLS_PREFIX + "nav",
            contentCls: CLS_PREFIX + "content",

            // 1 - 适度灵活结构：通过 cls 来获取 triggers 和 panels
            triggerCls: CLS_PREFIX + "trigger",
            panelCls: CLS_PREFIX + "panel",

            // 2 - 完全自由结构：直接传入 triggers 和 panels
            triggers: [],
            panels: [],

            // 触发类型
            triggerType: "mouse", // or "click"
            // 触发延迟
            triggerDelay: 0.1, // 100ms

            activeIndex: 0, // 为了避免闪烁，mackup的默认激活项，应该与此 index 一致
            activeTriggerCls: CLS_PREFIX + "trigger-active"
        };

    /**
     * TabView
     * @constructor
     */
    function TabView(container, config) {
        var self = this;
        
        // 使 container 支持数组
        if (Lang.isArray(container)) {
            for (var rets = [], i = 0, len = container.length; i < len; i++) {
                rets[rets.length] = new arguments.callee(container[i], config);
            }
            return rets;
        }

        // factory or constructor
        if (!(self instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 容器
         * @type HTMLElement
         */
        self.container = Dom.get(container);

        // 根据配置信息，自动调整默认配置
        if(config.triggerCls) {
            defaultConfig.mackupType = 1;
        } else if(config.triggers) {
            defaultConfig.mackupType = 2;
        }

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || {});

        /**
         * triggers
         * @type Array of HTMLElement
         */
        self.triggers = [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        self.panels = [];

        /**
         * 当前激活的 index
         * @type number
         */
        self.activeIndex = self.config.activeIndex;

        // init
        self._init();
    }

    S.mix(TabView.prototype, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            this._parseMackup();
            this._initTriggers();
        },

        /**
         * 解析 mackup, 获取 triggers 和 panels
         * @protected
         */
        _parseMackup: function() {
            var self = this,
                container = self.container, cfg = self.config,
                nav, content, triggers = [], panels = [], n, m, i, len,
                getElementsByClassName = Dom.getElementsByClassName;

            switch (cfg.mackupType) {
                case 0: // 默认结构
                    nav = getElementsByClassName(cfg.navCls, "*", container)[0];
                    content = getElementsByClassName(cfg.contentCls, "*", container)[0];
                    triggers = Dom.getChildren(nav);
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

            // 让 triggers 和 panels 数量匹配
            n = triggers.length;
            m = panels.length;
            for(i = 0, len = n > m ? m : n; i < len; i++) {
                self.triggers.push(triggers[i]);
                self.panels.push(panels[i]);
            }
        }
    });

    S.augment(TabView, S.Triggerable, false);    
    S.TabView = TabView;
});
/**
 * SlideView
 * @module      slideview
 * @creator     玉伯<lifesinger@gmail.com>, 明城<mingcheng@taobao.com>
 * @depends     kissy-core, yui-base, triggerable
 */
KISSY.add("slideview", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        BLOCK = "block", NONE = "none",
        OPACITY = "opacity", Z_INDEX = "z-index",
        RELATIVE = "relative", ABSOLUTE = "absolute",
        SCROLLX = "scrollx", SCROLLY = "scrolly", FADE ="fade",
        CLS_PREFIX = "ks-slideview-",

        defaultConfig = {
            // mackup 是固定的，详见 demo. nav 可以自动生成
            navCls: CLS_PREFIX + "nav",
            contentCls: CLS_PREFIX + "content",

            triggerType: "mouse", // or "click" 触发类型
            triggerDelay: 0.1, // 触发延迟

            autoPlay: true,
            autoPlayInterval: 5, // 自动播放间隔时间
            pauseOnMouseOver: true,  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放

            effectType: NONE, // "scrollx", "scrolly", "fade"
            animDuration: .5, // 开启切换效果时，切换的时长
            animEasing: Y.Easing.easeNone, // easing method

            activeIndex: 0, // 为了避免闪烁，mackup的默认激活项，应该与此 index 一致
            activeTriggerCls: CLS_PREFIX + "trigger-active",

            panelSize: [] // 卡盘 panel 的宽高。一般不需要设定此值
            // 只有当无法正确获取高宽时，才需要设定
            // 比如父级元素 display: none 时，无法获取到 offsetWidth, offsetHeight
        },

        // 效果集
        effects = {

            // 最朴素的显示/隐藏效果
            none: function(fromPanel, toPanel, callback) {
                fromPanel.style.display = NONE;
                toPanel.style.display = BLOCK;
                callback();
            },

            // 淡隐淡现效果
            fade: function(fromPanel, toPanel, callback) {
                var self = this, cfg = self.config;
                if (self.anim) self.anim.stop();

                // 首先显示下一张
                Dom.setStyle(toPanel, OPACITY, 1);

                // 动画切换
                self.anim = new Y.Anim(fromPanel, {opacity: {to: 0}}, cfg.animDuration, cfg.animEasing);
                self.anim.onComplete.subscribe(function() {
                    self.anim = null; // free

                    // 切换 z-index
                    Dom.setStyle(toPanel, Z_INDEX, 9);
                    Dom.setStyle(fromPanel, Z_INDEX, 1);

                    callback();
                });
                self.anim.animate();
            },

            // 水平/垂直滚动效果
            scroll: function(fromPanel, toPanel, callback, index) {
                var self = this, cfg = self.config,
                    isX = cfg.effectType === SCROLLX,
                    diff = self.panelSize[isX ? 0 : 1] * index,
                    attributes = {};

                attributes[isX ? "left" : "top"] = { to: -diff };

                if (self.anim) self.anim.stop();
                self.anim = new Y.Anim(self.content, attributes, cfg.animDuration, cfg.animEasing);
                self.anim.onComplete.subscribe(function() {
                    self.anim = null; // free
                    callback();
                });
                self.anim.animate();
            }
        };
    effects[SCROLLX] = effects[SCROLLY] = effects.scroll;

    /**
     * SlideView
     * @constructor
     */
    function SlideView(container, config) {
        var self = this;
        config = config || {};
        
        // factory or constructor
        if (!(self instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 触发
         * @type HTMLElement
         */
        self.container = Dom.get(container);

        // 根据效果类型，调整默认配置
        if (config.effectType === SCROLLX || config.effectType === SCROLLY) {
            defaultConfig.animDuration = .8;
            defaultConfig.animEasing = Y.Easing.easeOutStrong;
        }

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || {});

        /**
         * triggers
         * @type Array of HTMLElement
         */
        self.triggers = [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        self.panels = [];

        /**
         * nav
         * @type HTMLElement
         */

        /**
         * content
         * @type HTMLElement
         */

        /**
         * panelSize
         * @type Array  [x, y]
         */
        self.panelSize = [];

        /**
         * 当前激活的 index
         * @type number
         */
        self.activeIndex = self.config.activeIndex;

        /**
         * anim
         * @type YAHOO.util.Anim
         */

        /**
         * 自动播放是否暂停
         * @type boolean
         */
        //self.paused = false;

        // init
        self._init();
    }

    S.mix(SlideView.prototype, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            var self = this, cfg = self.config;

            self._parseMackup();
            self._initStyle();
            self._initTriggers();

            if (cfg.autoPlay) self._initAutoPlay();
        },

        /**
         * 解析 mackup, 获取 triggers 和 panels
         * @protected
         */
        _parseMackup: function() {
            var self = this,
                container = self.container, cfg = self.config,
                nav, content, triggers = [], panels = [], n, m, i, len,
                getElementsByClassName = Dom.getElementsByClassName;

            content = getElementsByClassName(cfg.contentCls, "*", container)[0];
            panels = Dom.getChildren(content);
            nav = getElementsByClassName(cfg.navCls, "*", container)[0] || self._generateNavMackup(panels.length);
            triggers = Dom.getChildren(nav);

            // 让 triggers 和 panels 数量匹配
            n = triggers.length;
            m = panels.length;
            for (i = 0,len = n > m ? m : n; i < len; i++) {
                self.triggers.push(triggers[i]);
                self.panels.push(panels[i]);
            }

            self.nav = nav;
            self.content = content;
        },

        /**
         * 自动生成 nav 的 mackup
         * @protected
         */
        _generateNavMackup: function(len) {
            var self = this, cfg = self.config,
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
            return ul;
        },

        /**
         * 根据 effectType，调整初始状态
         * @protected
         */
        _initStyle: function() {
            var self = this,
                cfg = self.config, type = cfg.effectType,
                panels = self.panels,
                i, len = self.triggers.length,
                activeIndex = self.activeIndex;

            // 1. 获取高宽
            self.panelSize[0] = cfg.panelSize[0] || panels[0].offsetWidth;
            self.panelSize[1] = cfg.panelSize[0] || panels[0].offsetHeight; // 所有 panel 的尺寸应该相同
            // 最好指定第一个 panel 的 width 和 height，因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (type === NONE) {
                // 默认情况，只显示 activePanel
                for (i = 0; i < len; i++) {
                    panels[i].style.display = i === activeIndex ? BLOCK : NONE;
                }

            } else { // type = scrollx, scrolly, fade

                // 这些特效需要将 panels 都显示出来
                for (i = 0; i < len; i++) {
                    panels[i].style.display = BLOCK;
                }

                switch(type) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:
                        // 设置定位信息，为滚动效果做铺垫
                        self.container.style.position = RELATIVE;
                        self.content.style.position = ABSOLUTE;

                        // 水平排列
                        if (type === SCROLLX) {
                            Dom.setStyle(panels, "float", "left");

                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            this.content.style.width = self.panelSize[0] * len + "px";
                        }
                    break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        for (i = 0; i < len; i++) {
                            Dom.setStyle(panels[i], OPACITY, i === self.activeIndex ? 1 : 0);
                            panels[i].style.position = ABSOLUTE;
                            panels[i].style.zIndex = i === self.activeIndex ? 9 : 1;
                        }
                    break;
                }
            }

            // 3. 对应的 CSS 里，container 需要设置高宽和 overflow: hidden
            //    nav 的 cls 由 CSS 指定
        },

        /**
         * 设置自动播放
         * @protected
         */
        _initAutoPlay: function() {
            var self = this,
                cfg = self.config, max = self.panels.length - 1;

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnMouseOver) {
                Event.on([self.content, self.nav], "mouseenter", function() {
                    self.paused = true;
                });

                Event.on([self.content, self.nav], "mouseleave", function() {
                    self.paused = false;
                });
            }

            // 设置自动播放
            self.autoPlayTimer = Lang.later(cfg.autoPlayInterval * 1000, this, function() {
                if (self.paused) return;
                self.switchTo(self.activeIndex < max ? self.activeIndex + 1 : 0);
            }, null, true);
        },

        /**
         * 切换内容
         * @protected
         */
        _switchContent: function(fromPanel, toPanel, index) {
            var self = this;

            effects[self.config.effectType].call(self, fromPanel, toPanel, function() {
                // fire onSwitch
                self.fireEvent("onSwitch", index);
            }, index);
        }
    });

    S.augment(SlideView, S.Triggerable, false);
    S.SlideView = SlideView;
});
/**
 * 超级菜单组件
 * @module      megamenu
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yui-base, triggerable
 */
KISSY.add("megamenu", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        NONE = "none", BLOCK = "block",
        CLOSEBTN_TMPL = "<span class=\"{hook_cls}\"></span>",
        CLS_PREFIX = "ks-megamenu-",

        defaultConfig = {

            triggerType: "mouse", // or "click" 触发类型
            triggerDelay: 0.1, // 触发延迟
            hideDelay: .5,    // 隐藏延迟

            // 只支持适度灵活结构，view 可以自动生成
            triggerCls: CLS_PREFIX + "trigger",
            viewCls: CLS_PREFIX + "view",
            contentCls: CLS_PREFIX + "content",
            activeTriggerCls: CLS_PREFIX + "trigger-active",
            closeBtnCls: CLS_PREFIX + "closebtn",

            showCloseBtn: true // 是否显示关闭按钮
        };

    /**
     * @class MegaMenu
     * @constructor
     */
    function MegaMenu(container, config) {
        var self = this,
            cfg = S.merge(defaultConfig, config || {});
        
        // factory or constructor
        if (!(self instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        /**
         * 菜单容器
         * @type HTMLElement
         */
        self.container = Dom.get(container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = cfg;

        /**
         * 菜单项
         */
        self.triggers = Dom.getElementsByClassName(cfg.triggerCls, "*", container);

        /**
         * 显示容器
         */
        //self.view

        /**
         * 显示容器里的数据元素
         */
        //self.viewContent

        /**
         * 内容
         */
        self.contents = [];
        Dom.getElementsByClassName(cfg.contentCls, "*", container, function(each) {
            self.contents.push(each.value || each.innerHTML);
        });
        self.panels = self.contents; // for Triggerable

        /**
         * 定时器
         */
        //self.showTimer = null;
        //self.hideTimer = null;

        /**
         * 当前激活项
         */
        self.activeIndex = -1;

        // init
        self._init();
    }

    S.mix(MegaMenu.prototype, {

        /**
         * 初始化操作
         * @protected
         */
        _init: function() {
            var self = this;

            self._initTriggers();
            self._initView();
            if(self.config.showCloseBtn) self._initCloseBtn();
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         * @protected
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.showTimer) self.showTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            if(self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         * @protected
         */
        _onMouseEnterTrigger: function(index) {
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);
            var self = this;
            if(self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            self.showTimer = Lang.later(self.config.triggerDelay * 1000, self, function() {
                self.switchTo(index);
            });
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         * @protected
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.showTimer) self.showTimer.cancel();

            self.hideTimer = Lang.later(self.config.hideDelay * 1000, self, function() {
                self.hide();
            });
        },

        /**
         * 初始化显示容器
         * @protected
         */
        _initView: function() {
            var self = this, cfg = self.config,
                view = Dom.getElementsByClassName(cfg.viewCls, "*", self.container)[0];

            // 自动生成 view
            if(!view) {
                view = document.createElement("DIV");
                view.className = cfg.viewCls;
                self.container.appendChild(view);
            }

            // init events
            Event.on(view, "mouseenter", function() {
                if(self.hideTimer) self.hideTimer.cancel();
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
         * 切换内容
         * @protected
         */
        _switchContent: function(oldContent, newContent, index) {
            var self = this;

            // 显示 view
            self.view.style.display = BLOCK;

            // 加载新数据
            self.viewContent.innerHTML = newContent;

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

    S.augment(MegaMenu, S.Triggerable, false);
    S.MegaMenu = MegaMenu;
});

/**
 * TODO:
 *   - 类 YAHOO 首页，内容显示层的位置自适应
 */// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=utf8 nobomb:
/**
 * KISSY - Carousel Module
 *
 * @module      carousel
 * @creator     mingcheng<i.feelinglucky#gmail.com>
 * @depends     kissy-core, yahoo-dom-event, yahoo-animate
 */

KISSY.add("scrollview", function(S) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        getFirstChild = Dom.getFirstChild, getLastChild  = Dom.getLastChild,
        insertBefore = Dom.insertBefore, insertAfter = Dom.insertAfter,
        getAttribute = Dom.getAttribute, setAttribute = Dom.setAttribute;

    var PREV = 'prev', NEXT = 'next', INDEX_FLAG = 'carousel:index',
        HORIZONTAL = 'horizontal', VERTICAL = 'vertical';

    var defaultConfig = {
        delay: 2000,
        speed: 500,
        startDelay: 2000,
        autoStart: true,
        direction: 'vertical', // 'horizontal(h)' or 'vertical(v)'
        scrollWidth: false,
        //easing: function() {},
        //onScroll: function() {},
        //onBeforeScroll: function() {},
        //onPause: function() {},
        //onWakeup: function() {},
        scrollSize: 1 // the number of horse scrolls, default is 1
    };


    /**
     * Get Element's real offset
     *
     * @param Object Elements
     * @private
     */
    function getRealOffset(elem) {
        var elem = Dom.get(elem),
            leftOffset = elem.offsetLeft,
            topOffset  = elem.offsetTop,
            parent     = elem.offsetParent;

        // fix IE offsetLeft bug, see
        // http://www.gtalbot.org/BrowserBugsSection/MSIE6Bugs/
        while(parent) {
            leftOffset += parent.offsetLeft;
            topOffset  += parent.offsetTop;
            parent      = parent.offsetParent;
        }

        return { top: topOffset, left: leftOffset };
    }
        

    /**
     * 鎵惧埌涓嬩釜鑺傜偣鐨勪綅缃�
     *
     * @private
     */
    var findNextPanel = function(ref, size, direction) {
        var func = Dom[(direction == 'prev') ? 'getPreviousSibling' : 'getNextSibling'];
        for(var i = 0; i < size; i++) {
            ref = func(ref);
            if (!ref) return false;
        }
        return ref;
    }


    /**
     * 鍩轰簬骞虫粦婊氬姩锛岄噸鏂版帓鍒楀厓绱犱綅缃�
     *
     * @private
     */
    var rebuildSeq = function(container, size, direction) {
        direction = (direction == PREV) ? PREV : NEXT;
        switch(direction) {
            case PREV:
                for (var i = 0; i < size; i++) {
                    insertBefore(getLastChild(container), getFirstChild(container));
                }
                break;
            default: 
                for (var i = 0; i < size; i++) {
                    insertAfter(getFirstChild(container), getLastChild(container));
                }
        }
    }




    // NOTICE: the container must be scrollable
    var ScrollView = function(container, config) {
        var self = this, config = Lang.merge(defaultConfig, config || {}),
        container, panels, currentPanel, current, total, i, len, direction;

        // carousel's elements
        container = Dom.get(container), panels = container.getElementsByTagName('li');

        // move current to first
        currentPanel = panels[0] || [], total = panels.length;
        if (total < config.scrollSize) {
            return;
        }

        // mark index
        for(i = 0, len = total; i < len; i++) {
            setAttribute(panels[i], INDEX_FLAG, i);
        }

        // mark current index
        current = getAttribute(currentPanel, INDEX_FLAG);

        // default direction value is vertical
        direction = {
            x: (config.direction == HORIZONTAL) || (config.direction == 'h'),
            y: (config.direction == VERTICAL)   || (config.direction == 'v')       
        };

        // 閲嶆柊缁戝埌瀹炰緥鍖栦腑
        self.config    = config,
        self.container = container, 
        self.panels    = panels,
        self.currentPanel = currentPanel,
        self.current = current,
        self.total     = total,
        self.direction = direction;

        // initialize
        self._init(); 
    }

    S.mix(ScrollView.prototype, {
        _init: function() {
            var self = this, config = self.config, container = self.container, 
                panels = self.panels,
                i, len, flag;

            // bind custom event
            var events = ['onScroll', 'onPause', 'onBeforeScroll', 'onPause', 'onWakeup'];
            for(i = 0,  len = events.length; i < len; i++) {
                flag = events[i];
                if (Lang.isFunction(config[flag])) {
                    self[flag + 'Event'] = new Y.CustomEvent(flag, self, false, Y.CustomEvent.FLAT);
                    self[flag + 'Event'].subscribe(config[flag]);
                }
            }

            // stop scroll when mouseover the container
            Event.on(container, 'mouseenter', function() {
                if (config.autoStart) self.pause();
            });

            Event.on(container, 'mouseleave',  function() {
                if (config.autoStart) self.wakeup();
            });

            // autoStart?
            if (config.autoStart) {
                Lang.later(config.startDelay, self, function() {
                    self.play();
                });
            }
        },


        play: function(direction) {
            var self = this, container = self.container, currentPanel = self.currentPanel,
                current = self.current,
                config = self.config, callee = arguments.callee, attributes,
                destination;

            direction = (direction == PREV) ? PREV : NEXT;

            // is scrolling?
            if (self._scrolling || self.paused) {
                return;
            }

            // find the destination
            do {
                destination = findNextPanel(currentPanel, config.scrollSize, direction);
                // 濡傛灉寰�涓嬫病鎵惧埌锛屽垯閲嶆柊鎺掑簭
                if (!destination) {
                    rebuildSeq(currentPanel.parentNode, config.scrollSize, direction);
                }
            } while(!destination);


            // 濡傛灉鎸囧畾婊氬姩璺濈锛岃褰�
            if (Lang.isNumber(config.scrollWidth)) {
                var offset = config.scrollWidth * config.scrollSize;
            }

            // 鍏冪礌鐩稿浣嶇疆
            var currentOffset     = getRealOffset(self.currentPanel),
                containerOffset   = getRealOffset(container),
                destinationOffset = getRealOffset(destination);

            // 婊氬姩灞炴��
            if (self.direction.y) {
                // 鍨傜洿婊氬姩
                var from = currentOffset.top - containerOffset.top;
                attributes = {scroll: { from: [, from] }};
                attributes.scroll.to = offset ?
                    [, from + (offset * (direction == NEXT ? 1 : -1))] : [, destinationOffset.top - containerOffset.top];
            } else {
                // 姘村钩婊氬姩
                var from = currentOffset.left - containerOffset.left;
                attributes = { scroll: { from: [from] } };
                // 濡傛灉鎵嬪姩璁惧畾浜嗘粴鍔ㄨ窛绂�
                attributes.scroll.to = offset ? 
                    [from + (offset * (direction == NEXT ? 1 : -1))] : [destinationOffset.left - containerOffset.left];
            }

            // move current to next Item
            self.currentPanel = destination;

            // mark current horses index
            self.current = getAttribute(destination, INDEX_FLAG);

            if(Lang.isObject(self.onBeforeScrollEvent)) self.onBeforeScrollEvent.fire();

            // start scroll
            self._scrolling = true;
            if (self.anim) self.anim.stop();
            self.anim = new Y.Scroll(container, attributes, config.speed/1000, 
                                                            config.easing || Y.Easing.easeOut); 
            self.anim.onComplete.subscribe(function() {
                self._scrolling = false;

                // run the callback
                if(Lang.isObject(self.onScrollEvent)) {
                    self.onScrollEvent.fire();
                }

                // set next move time
                if (!self.paused && config.autoStart) {
                    self.timer = Lang.later(config.delay, self, callee);
                }
            });
            self.anim.animate();
        },

        pause: function() {
            var self = this;
            self.paused = true;
            // skip wakeup
            if (self._wakeupTimer) self._wakeupTimer.cancel();

            // run the callback
            if(Lang.isObject(self.onPauseEvent)) self.onPauseEvent.fire();
        },

        wakeup: function() {
            var self = this;
            self.paused = false;

            // skip wakeup for previous set
            if (self._wakeupTimer) {
                self._wakeupTimer.cancel();
            }

            // run the callback
            if(Lang.isObject(this.onWakeupEvent)) {
                self.onWakeupEvent.fire();
            }

            self._wakeupTimer = Lang.later(0, self, function() {
                self.timer = Lang.later(self.config.delay, self, self.play);
            });
        },


        jumpTo: function(index, direction) {
            var self = this, config = self.config, currentPanel = self.currentPanel, 
                total = self.total, 
                current, opponent, i, tmp, len;

            if (Lang.isUndefined(direction) && Lang.isNumber(this._prevIndex)) {
                direction = index > self._prevIndex ? NEXT : PREV;
            }
            direction = (direction == PREV) ? PREV : NEXT;
            opponent = (direction == PREV) ? NEXT : PREV;

            if (index > self.total) {
                return;
            }

            // find direction element
            for(i = 0, len = total; i < len; i++) {
                tmp = getAttribute(self.panels[i], INDEX_FLAG);
                if (tmp == index) {
                    current = self.panels[i];
                    break;
                }
            }
            if (!current) return;

            do {
                self.currentPanel = findNextPanel(current, config.scrollSize, opponent);
                // find opponent element
                if (!self.currentPanel) {
                    rebuildSeq(current.parentNode, config.scrollSize, direction);
                }
            } while(!self.currentPanel);

            //
            self._prevIndex = index;

            // start scroll
            self.play(direction);
        },

        next: function() {
            this.play('next');
        },

        prev: function() {
            this.play('prev');
        }
    });

    S.ScrollView = ScrollView;
});
/**
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
