/**
 * 数据延迟加载组件
 * 包括 img, textarea, 以及特定元素即将出现时的回调函数
 * @module      datalazyload
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add('datalazyload', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        win = window, doc = document,
        IMG_DATA_SRC = 'data-lazyload-src',
        TEXTAREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM_IMG_DATA_SRC = IMG_DATA_SRC + '-custom',
        CUSTOM_TEXTAREA_DATA_CLS = TEXTAREA_DATA_CLS + '-custom',
        MOD = { AUTO: 'auto', MANUAL: 'manual' },
        DEFAULT = 'default', NONE = 'none',

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
            placeholder: 'http://a.tbcdn.cn/kissy/1.0.4/build/datalazyload/dot.gif'
        },
        DP = DataLazyload.prototype;

    /**
     * 延迟加载组件
     * @constructor
     */
    function DataLazyload(containers, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof DataLazyload)) {
            return new DataLazyload(containers, config);
        }

        // 允许仅传递 config 一个参数
        if (config === undefined) {
            config = containers;
            containers = [doc];
        }

        // containers 是一个 HTMLElement 时
        if (!S.isArray(containers)) {
            containers = [S.get(containers) || doc];
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

    S.mix(DP, {

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
            Event.on(win, 'scroll', loader);
            Event.on(win, 'resize', function() {
                self.threshold = self._getThreshold();
                loader();
            });

            // 需要立即加载一次，以保证第一屏的延迟项可见
            if (self._getItemsLength()) {
                S.ready(function() {
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
                    Event.remove(win, 'scroll', loader);
                    Event.remove(win, 'resize', loader);
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
                n, N, imgs, areaes, i, len, img, area, data_src,
                lazyImgs = [], lazyAreaes = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = S.query('img', containers[n]);

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
                        if (YDOM.getY(img) > threshold && !data_src) {
                            img.setAttribute(IMG_DATA_SRC, img.src);
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    }
                }

                // 处理 textarea
                areaes = S.query('textarea', containers[n]);
                for (i = 0,len = areaes.length; i < len; ++i) {
                    area = areaes[i];
                    if (DOM.hasClass(area, TEXTAREA_DATA_CLS)) {
                        lazyAreaes.push(area);
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
                scrollTop = YDOM.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, img, data_src, remain = [];

            for (i = 0; img = imgs[i++];) {
                if (YDOM.getY(img) <= threshold) {
                    self._loadImgSrc(img);
                } else {
                    remain.push(img);
                }
            }

            self.images = remain;
        },

        /**
         * 加载图片 src
         * @static
         */
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
                scrollTop = YDOM.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, area, el, remain = [];

            for (i = 0; area = areaes[i++];) {
                el = area;

                // 注：area 可能处于 display: none 状态，Dom.getY(area) 返回 undefined
                //    这种情况下用 area.parentNode 的 Y 值来判断
                if(YDOM.getY(el) === undefined) {
                    el = area.parentNode;
                }

                if (YDOM.getY(el) <= threshold) {
                    self._loadDataFromArea(area.parentNode, area);
                } else {
                    remain.push(area);
                }
            }

            self.areaes = remain;
        },

        /**
         * 从 textarea 中加载数据
         * @static
         */
        _loadDataFromArea: function(container, area) {
            //container.innerHTML = area.value; // 这种方式会导致 chrome 缓存 bug

            // 采用隐藏不去除方式
            var content = DOM.create(area.value);
            area.style.display = NONE;
            //area.value = ''; // clear content  不能清空，否则 F5 刷新，会丢内容
            area.className = ''; // clear hook
            container.insertBefore(content, area);

            // 执行里面的脚本
            if(!S.UA.gecko) { // firefox 会自动执行 TODO: feature test
                S.query('script', content).each(function(script) {
                    S.globalEval(script.text);
                });
            }
        },

        /**
         * 触发回调
         * @protected
         */
        _fireCallbacks: function() {
            var self = this,
                callbacks = self.callbacks,
                els = callbacks.els, fns = callbacks.fns,
                scrollTop = YDOM.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, el, fn, remainEls = [], remainFns = [];

            for (i = 0; (el = els[i]) && (fn = fns[i++]);) {
                if (YDOM.getY(el) <= threshold) {
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
            el = S.get(el);
            if (el && typeof fn === 'function') {
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
                ret = YDOM.getViewportHeight();

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
            var self = this, area, imgs;


            // 支持数组
            if (!S.isArray(containers)) {
                containers = [S.get(containers)];
            }

            // 遍历处理
            S.each(containers, function(container) {
                switch (type) {
                    case 'textarea-data':
                        area = S.get('textarea', container);
                        if (area && DOM.hasClass(area, flag || CUSTOM_TEXTAREA_DATA_CLS)) {
                            self._loadDataFromArea(container, area);
                        }
                        break;
                    //case 'img-src':
                    default:
                        //S.log('loadCustomLazyData container = ' + container.src);
                        if (container.nodeName === 'IMG') { // 本身就是图片
                            imgs = [container];
                        } else {
                            imgs = S.query('img', container);
                        }
                        for (var i = 0, len = imgs.length; i < len; i++) {
                            self._loadImgSrc(imgs[i], flag || CUSTOM_IMG_DATA_SRC);
                        }
                }
            });
        }
    });

    // attach static methods
    S.mix(DataLazyload, DP, true, ['loadCustomLazyData', '_loadImgSrc', '_loadDataFromArea']);

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
 *       <textarea class='ks-datalazysrc invisible'>dom code</textarea>
 *     里。可以添加 hidden 等 class, 但建议用 invisible, 并设定 height = '实际高度'.
 *     这样可以保证滚动时，diff 更真实有效。
 *     注意：textarea 加载后，会替换掉父容器中的所有内容。
 *  2. 延迟 callback 约定：dataLazyload.addCallback(el, fn) 表示当 el 即将出现时，触发 fn.
 *  3. 所有操作都是最多触发一次，比如 callback. 来回拖动滚动条时，只有 el 第一次出现时会触发 fn 回调。
 */

/**
 * TODO:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 */

/**
 * UPDATE LOG:
 *   - 2010-04-05 yubo 重构，使得对 YUI 的依赖仅限于 YDOM
 *   - 2009-12-17 yubo 将 imglazyload 升级为 datalazyload, 支持 textarea 方式延迟和特定元素即将出现时的回调函数
 */
