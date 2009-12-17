/**
 * 图片延迟加载组件
 * @module      imglazyload
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("imglazyload", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        win = window, doc = document,
        DATA_SRC = "data-lazyload-src",
        MOD = { AUTO: "auto", MANUAL: "manual" },
        DEFAULT = "default",

        defaultConfig = {

            /**
             * 懒处理模式
             *  auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *  manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 DATA_SRC
             */
            mod: MOD.AUTO,

            /**
             * 当前视窗往下，diff px 外的图片延迟加载
             * 适当设置此值，可以让用户在拖动时感觉图片已经加载好
             * 默认为当前视窗高度（两屏以外的才延迟加载）
             */
            diff: DEFAULT,

            /**
             * 占位指示图
             */
            placeholder: "http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif"
        };

    /**
     * 图片延迟加载组件
     * @class ImageLazyload
     * @constructor
     */
    function ImageLazyload(containers, config) {
        // factory or constructor
        if (!(this instanceof arguments.callee)) {
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
        this.containers = containers;

        /**
         * 配置参数
         * @type Object
         */
        this.config = S.merge(defaultConfig, config || {});

        /**
         * 需要延迟下载的图片
         * @type Array
         */
        //this.images

        /**
         * 开始延迟的 Y 坐标
         * @type number
         */
        //this.threshold

        this._init();
    }

    S.mix(ImageLazyload.prototype, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            this.threshold = this._getThreshold();
            this.images = this._filterImgs();

            if (this.images.length > 0) {
                this._initLoadEvent();
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
         * 初始化加载事件
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this;

            // scroll 和 resize 时，加载图片
            Event.on(win, "scroll", loader);
            Event.on(win, "resize", function() {
                self.threshold = self._getThreshold();
                loader(true);
            });

            // 手工模式时，第一屏也有可能有 data-src 项
            if (this.config.mod === MOD.MANUAL) {
                // 需要立即加载一次，以保证第一屏图片可见
                Event.onDOMReady(function() {
                    self._loadImgs(true);
                });
            }

            // 加载函数
            function loader(force) {
                if (timer) return;
                timer = setTimeout(function() {
                    self._loadImgs(force);
                    if (self.images.length === 0) {
                        Event.removeListener(win, "scroll", loader);
                        Event.removeListener(win, "resize", loader);
                    }
                    timer = null;
                }, 100); // 0.1s 内，用户感觉流畅
            }
        },

        /**
         * 获取并初始化需要延迟下载的图片
         * @protected
         */
        _filterImgs: function() {
            var containers = this.containers,
                threshold = this.threshold,
                placeholder = this.config.placeholder,
                isManualMod = this.config.mod === MOD.MANUAL,
                n, N, imgs, i, len, img, data_src,
                ret = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = containers[n].getElementsByTagName("img");

                for (i = 0,len = imgs.length; i < len; ++i) {
                    img = imgs[i];
                    data_src = img.getAttribute(DATA_SRC);

                    if (isManualMod) { // 手工模式，只处理有 data-src 的图片
                        if (data_src) {
                            img.src = placeholder;
                            ret.push(img);
                        }
                    } else { // 自动模式，只处理 threshold 外无 data-src 的图片
                        // 注意：已有 data-src 的项，可能已有其它实例处理过，重复处理
                        // 会导致 data-src 变成 placeholder
                        if (Dom.getY(img) > threshold && !data_src) {
                            img.setAttribute(DATA_SRC, img.src);
                            img.src = placeholder;
                            ret.push(img);
                        }
                    }
                }
            }

            return ret;
        },

        /**
         * 加载图片
         * @protected
         */
        _loadImgs: function(force) {
            var scrollTop = Dom.getDocumentScrollTop();
            if (!force && scrollTop <= this.config.diff) return;

            var imgs = this.images,
                threshold = this.threshold + scrollTop,
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

            this.images = remain;
        }
    });

    S.ImageLazyload = ImageLazyload;
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
 */

/**
 * TODOs:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 */