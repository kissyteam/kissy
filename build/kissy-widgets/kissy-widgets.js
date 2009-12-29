/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-29 17:38:43
Revision: 373
*/
/**
 * @module kissy
 * @creator lifesinger@gmail.com
 */

if (typeof KISSY === "undefined" || !KISSY) {
    /**
     * The KISSY global object.
     * @constructor
     * @global
     */
    function KISSY(c) {
        var o = this;
        // allow instantiation without the new operator
        if (!(o instanceof arguments.callee)) {
            return new arguments.callee(c);
        }

        // init the core environment
        o._init();
        o._config(c);

        // bind the specified additional modules for this instance
        o._setup();

        return o;
    }
}

(function(S) {

    var win = window, UNDEFINED = "undefined", slice = Array.prototype.slice,
        mix = function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (typeof ov === UNDEFINED) ov = true;
            var i, p, l;

            if (wl && (l = wl.length)) {
                for (i = 0; i < l; i++) {
                    p = wl[i];
                    if (p in s) {
                        if (ov || !(p in r)) {
                            r[p] = s[p];
                        }
                    }
                }
            } else {
                for (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }

            return r;
        };

    mix(S.prototype, {

        /**
         * Register a module
         * @param name {string} module name
         * @param fn {function} entry point into the module that is used to bind module to the KISSY instance
         * @param version {string} version string
         * @param details optional config data:
         * submodules - sub modules
         * requires - features that should be present before loading
         * optional - optional features that should be present if load optional defined
         * use - features that should be attached automatically
         * @return {KISSY} the KISSY instance
         */
        add: function(name, fn, version, details) {
            S.Env.mods[name] = {
                name: name,
                fn: fn,
                version: version,
                details: details || {}
            };
            return this; // chain support
        },

        /**
         * Initialize this KISSY instance
         * @private
         */
        _init: function() {
            var o = this;
            o.version = "@VERSION@";

            o.Env = {
                mods: {},
                _used: {},
                _attached: {}
            };

            o.config = {
                debug: true
            };
        },

        /**
         * Initialize this config
         * @private
         */
        _config: function(c) {
            mix(this.config, c);
        },

        /**
         * Attaches whatever modules were defined when the instance was created.
         * @private
         */
        _setup: function() {
            this.use("kissy-core");
        },

        /**
         * Bind a module to a KISSY instance
         * <pre>
         * KISSY().use("*", function(S){});
         * KISSY().use("editor", function(S){});
         * KISSY().use(function(S){});
         * </pre>
         * @return {KISSY} the KISSY instance
         */
        use: function() {
            var o = this,
                a = slice.call(arguments, 0),
                mods = S.Env.mods,
                used = o.Env._used,
                l = a.length,
                callback = a[l - 1],
                i, k, name, r = [];

            // the last argument is callback
            if (typeof callback === "function") {
                a.pop();
            } else {
                callback = null;
            }

            // bind everything available
            if (a[0] === "*") {
                a = [];
                for (k in mods) {
                    a.push(k);
                }
                if (callback) {
                    a.push(callback);
                }
                return o.use.apply(o, a);
            }

            // process each module
            function f(name) {
                // only attach a module once
                if (used[name]) return;

                var m = mods[name], j, n, subs;

                if (m) {
                    used[name] = true;
                    subs = m.details.submodules;
                }

                // add this module to full list of things to attach
                r.push(name);

                // make sure submodules are attached
                if (subs) {
                    if (typeof subs === "string") subs = [subs];
                    for (j = 0, n = subs.length; j < n; j++) {
                        f(subs[j]);
                    }
                }
            }

            for (i = 0; i < l; i++) {
                f(a[i]);
            }

            // attach available modules
            o._attach(r);

            // callback
            if (callback) {
                callback(o);
            }

            // chain support
            return o;
        },

        /**
         * Attaches modules to a KISSY instance
         */
        _attach: function(r) {
            var mods = S.Env.mods,
                attached = this.Env._attached,
                i, l = r.length, name, m;

            for (i = 0; i < l; i++) {
                name = r[i];
                m = mods[name];
                if (!attached[name] && m) {
                    attached[name] = true;
                    if (m.fn) {
                        m.fn(this);
                    }
                }
            }
        },

        /**
         * Copies all the properties of s to r. overwrite mode.
         * @return {object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects.  The properties from later objects
         * will overwrite those in earlier objects.  Passing in a
         * single object will create a shallow copy of it.
         * @return {object} the new merged object
         */
        merge: function() {
            var a = arguments, o = {}, i, l = a.length;
            for (i = 0; i < l; ++i) {
                mix(o, a[i], true);
            }
            return o;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         *
         * @method extend
         * @param {Function} r the object to modify
         * @param {Function} s the object to inherit
         * @param {Object} px prototype properties to add/override
         * @param {Object} sx static properties to add/override
         * @return {KISSY} the KISSY instance
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                    function F() {
                    }

                    F.prototype = o;
                    return new F();
                },
                sp = s.prototype,
                rp = O(sp);

            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                mix(rp, px);
            }

            // add object overrides
            if (sx) {
                mix(r, sx);
            }

            return r;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * The receiver must be a Function.
         * @param {Function} r  the object to receive the augmentation
         * @param {Function} s  the object that supplies the properties to augment
         * @param wl {string[]} a whitelist.  If supplied, only properties in this list will be applied to the receiver.
         * @return {object} the augmented object
         */
        augment: function(r, s, ov, wl) {
            return mix(r.prototype, s.prototype, ov, wl);
        },

        /**
         * Executes the supplied function on each item in the array.
         * @method each
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item.  The
         * function receives three arguments: the value, the index, the full array.
         * @param obj Optional context object
         */
        each: function (arr, fn, obj) {
            var l = (arr && arr.length) || 0, i;
            for (i = 0; i < l; i++) {
                fn.call(obj || this, arr[i], i, arr);
            }
            return this;
        },

        /**
         * Adds fn to domready event
         */
        ready: function(/*fn*/) {
          // TODO
        },

        /**
         * Execute the supplied method after the specified function
         * @param fn {Function} the function to execute
         * @param when {string} before or after
         * @param obj the object hosting the method to displace
         * @param sFn {string} the name of the method to displace
         */
        weave: function(fn, when, obj, sFn) {
            var arr = [obj[sFn], fn];

            if (when === "before") arr.reverse();
            obj[sFn] = function() {
                for (var i = 0, args = slice.call(arguments, 0); i < 2; i++) {
                    arr[i].apply(this, args);
                }
            };

            return this;
        },

        /**
         * Clones KISSY to another global object.
         * <pre>
         * S.cloneTo("TaoBao");
         * </pre>
         * @return {object}  A reference to the last object
         */
        cloneTo: function(name) {
            function O(c) {
                // allow instantiation without the new operator
                if (!(this instanceof O)) {
                    return new O(c);
                }
                if (typeof c === UNDEFINED) c = []; // fix ie bug
                O.superclass.constructor.apply(this, c);
            }

            S.extend(O, S, null, S);
            return (win[name] = O);
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist
         * Be careful when naming packages. Reserved words may work in some browsers
         * and not others.
         * <pre>
         * S.cloneTo("TB");
         * TB.namespace("TB.app"); // returns TB.app
         * TB.namespace("app.Shop"); // returns TB.app.Shop
         * </pre>
         * @return {object}  A reference to the last namespace object created
         */
        namespace: function() {
            var a = arguments, l = a.length, o = this, i, j, p;
            // allow instance.namespace() to work fine.
            if (typeof o === "object") o = o.constructor;

            for (i = 0; i < l; i++) {
                p = ("" + a[i]).split(".");
                for (j = (win[p[0]] === o) ? 1 : 0; j < p.length; j++) {
                    o[p[j]] = o[p[j]] || {};
                    o = o[p[j]];
                }
            }
            return o;
        },

        /**
         * print debug info
         * @param {String} msg The message to log.
         * @param {String} cat The log category for the message. Default
         * categories are "info", "warn", "error", time".
         * Custom categories can be used as well. (opt)
         * @param {String} src The source of the the message (opt)
         * @return {KISSY} KISSY instance
         */
        log: function(msg, cat, src) {
            var c = this.config;

            if (c.debug) {
                src && (msg = src + ": " + msg);
                if (typeof console !== UNDEFINED && console.log) {
                    console[cat && console[cat] ? cat : "log"](msg);
                }
            }

            return this;
        }
    });

    // Give the KISSY global the same properties as an instance.
    // More importantly, the KISSY global provides global metadata,
    // so env needs to be configured.
    mix(S, S.prototype); // TODO: white list?
    S._init();

})(KISSY);
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
        IMG_DATA_SRC = "data-lazyload-src",
        TEXTAREA_DATA_CLS = "ks-datalazyload",
        CUSTOM_IMG_DATA_SRC = IMG_DATA_SRC + "-custom",
        CUSTOM_TEXTAREA_DATA_CLS = TEXTAREA_DATA_CLS + "-custom",
        MOD = { AUTO: "auto", MANUAL: "manual" },
        DEFAULT = "default",

        defaultConfig = {

            /**
             * 懒处理模式
             *   auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *   manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 IMG_DATA_SRC
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

        // 放在 setTimeout 里，解决 Safari 缓存问题（后退到延迟页面，延迟内容未加载）
        setTimeout(function() {
            self._init();
        }, 0);
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
                    data_src = img.getAttribute(IMG_DATA_SRC);

                    if (isManualMod) { // 手工模式，只处理有 data-src 的图片
                        if (data_src) {
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    } else { // 自动模式，只处理 threshold 外无 data-src 的图片
                        // 注意：已有 data-src 的项，可能已有其它实例处理过，重复处理
                        // 会导致 data-src 变成 placeholder
                        if (Dom.getY(img) > threshold && !data_src) {
                            img.setAttribute(IMG_DATA_SRC, img.src);
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    }
                }

                // 处理 textarea
                areaes = containers[n].getElementsByTagName("textarea");
                for( i = 0, len = areaes.length; i < len; ++i) {
                    if(Dom.hasClass(areaes[i], TEXTAREA_DATA_CLS)) {
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
                    self._loadImgSrc(img);
                } else {
                    remain.push(img);
                }
            }

            self.images = remain;
        },

        _loadImgSrc: function(img, flag) {
            flag = flag || IMG_DATA_SRC;
            var data_src = img.getAttribute(flag);

            if (data_src && img.src != data_src) {
                img.src = data_src;
                img.removeAttribute(flag);
            }
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
         * @static
         */
        loadCustomLazyData: function(containers, type, flag) {
            var self = this, textarea, imgs;

            // 支持数组
            if (!Lang.isArray(containers)) {
                containers = [Dom.get(containers)];
            }

            // 遍历处理
            S.each(containers, function(container) {
                switch (type) {
                    case "textarea-data":
                        textarea = container.getElementsByTagName("textarea")[0];
                        if (textarea && Dom.hasClass(textarea, flag || CUSTOM_TEXTAREA_DATA_CLS)) {
                            container.innerHTML = textarea.value;
                        }
                        break;
                    //case "img-src":
                    default:
                        //S.log("loadCustomLazyData container = " + container.src);
                        if(container.nodeName === "IMG") { // 本身就是图片
                            imgs = [container];
                        } else {
                            imgs = container.getElementsByTagName("img");
                        }
                        for (var i = 0, len = imgs.length; i < len; i++) {
                            self._loadImgSrc(imgs[i], flag || CUSTOM_IMG_DATA_SRC);
                        }
                }
            });
        }
    });

    // attach static methods
    S.mix(DataLazyload, DataLazyload.prototype, true, ["loadCustomLazyData", "_loadImgSrc"]);

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
 * Widget
 * @module      widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("widget", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom;

    /**
     * Widget Class
     * @constructor
     */
    function Widget(container) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Widget)) {
            return new Widget(container);
        }

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = Dom.get(container);

        /**
         * config infomation
         * @type object
         */
        self.config = {};
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
        CLS_PREFIX = "ks-switchable-",
        Switchable = { };

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
     *   - this.triggers  值为 [] 时，代表无触点
     *   - this.panels    肯定有值，且 length > 1
     *   - this.activeIndex
     *   - this.switchTimer
     */
    S.Widget.prototype.switchable = function(config) {
        var self = this; config = config || {};

        // 根据配置信息，自动调整默认配置
        if (config.panelCls) {
            Switchable.Config.mackupType = 1;
        } else if (config.panels) {
            Switchable.Config.mackupType = 2;
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
        S.mix(self, Switchable);
        self._initSwitchable();

        return self; // chain
    };

    S.mix(Switchable, {

        /**
         * init switchable
         */
        _initSwitchable: function() {
            var self = this, cfg = self.config[SWITCHABLE];

            // parse mackup
            if(self.panels.length === 0) {
                self._parseSwitchableMackup();
            }

            // create custom events
            self.createEvent(BEFORE_SWITCH);
            self.createEvent(ON_SWITCH);

            // bind triggers
            if(cfg.hasTriggers) {
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
                    if(nav) triggers = Dom.getChildren(nav);
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
            if(hasTriggers && n > 0 && triggers.length === 0) {
                triggers = self._generateTriggersMackup(self.length);
            }

            // 将 triggers 转换为普通数组
            if (hasTriggers) {
                for (i = 0, m = triggers.length; i < m; i++) {
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
         * @protected
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

            if(index === activeIndex) return self;
            if (!self.fireEvent(BEFORE_SWITCH, index)) return self;

            // switch active trigger
            if(cfg.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            // switch active panels
            if(typeof direction === UNDEFINED) {
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
            Dom.setStyle(fromPanels, DISPLAY,  NONE);
            Dom.setStyle(toPanels, DISPLAY,  BLOCK);

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

    S.mix(Switchable, Y.EventProvider.prototype);
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

    }, "after", Switchable, "_initSwitchable");
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
        Switchable = S.Switchable;

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
    var effects = {

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
    effects[SCROLLX] = effects[SCROLLY] = effects.scroll;
    S.Switchable.Effects = effects;

    /**
     * 织入初始化函数：根据 effect, 调整初始状态
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

    }, "after", Switchable, "_initSwitchable");

    /**
     * 覆盖切换方法
     */
    S.mix(Switchable, {
       /**
         * 切换视图
         */
        _switchView: function(fromEls, toEls, index, direction) {
            var self = this, cfg = self.config[SWITCHABLE],
                effect = cfg.effect,
                fn = typeof effect === "function" ? effect : Switchable.Effects[effect];

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
        var self = this, cfg = self.config[SWITCHABLE],
            effect = cfg.effect, Effects = Switchable.Effects;

        // 仅有滚动效果需要下面的调整
        if (!cfg.circular || (effect !== SCROLLX && effect !== SCROLLY)) return;

        // 覆盖滚动效果函数
        Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll = circularScroll;

    }, "after", Switchable, "_initSwitchable");
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

    }, "after", Switchable, "_initSwitchable");
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

            showCloseBtn: true // 是否显示关闭按钮
        };

    /**
     * @class MegaMenu
     * @constructor
     */
    function MegaMenu(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof arguments.callee)) {
            return new arguments.callee(container, config);
        }

        // extend Widget
        MegaMenu.superclass.constructor.call(self, container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || {});

        // attach Switchable
        self.switchable(config);
        S.mix(self.config, self.config[SWITCHABLE]);

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

        /**
         * 当前激活项
         */
        self.activeIndex = -1;

        // init
        S.mix(self, Self);
        self._init();

    }
    S.extend(MegaMenu, S.Widget);

    /**
     * MegaMenu 特有的成员
     */
    var Self = {

        /**
         * 初始化操作
         * @protected
         */
        _init: function() {
            var self = this;

            self._initView();
            if(self.config.showCloseBtn) self._initCloseBtn();
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         * @override
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            if(self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         * @override
         */
        _onMouseEnterTrigger: function(index) {
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);
            var self = this;
            if(self.hideTimer) self.hideTimer.cancel(); // 取消隐藏

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            self.switchTimer = Lang.later(self.config.delay * 1000, self, function() {
                self.switchTo(index);
            });
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         * @override
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
    };

    S.MegaMenu = MegaMenu;
});

/**
 * TODO:
 *   - 类 YAHOO 首页，内容显示层的位置自适应
 */