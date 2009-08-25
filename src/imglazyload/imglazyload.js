/**
 * KISSY.ImageLazyload 图片延迟加载组件
 *
 * imglazyload.js
 * requires: yahoo-dom-event
 *
 * @author lifesinger@gmail.com
 *
 * TODO: container 支持集合（一次指定多个区域）
 */

var KISSY = window.KISSY || {};

(function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        DATA_SRC = "data-lazyload",

        defaultConfig = {
            /**
             * 当前视窗往下，diff px 外的图片延迟加载
             * 适当设置此值，可以让用户在拖动时感觉图片已经加载好
             * 默认为当前视窗高度（提前加载一屏）
             */
            diff: Dom.getViewportHeight(),

            /**
             * 占位指示图
             */
            placeholder: "spaceball.gif"
        };

    /**
     * 图片延迟加载组件
     * @class Lazyload
     * @requires YAHOO.util.Dom
     * @requires YAHOO.util.Event
     * @constructor
     */
    function ImageLazyload(id, config) {
        // Factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(id, config);
        }

        // 允许仅传递 config 参数
        if(typeof config === "undefined") {
            config = id;
            id = document;
        }

        /**
         * 图片所在容器，默认为 document
         * @type HTMLElement
         */
        this.container = Dom.get(id) || document;

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});

        /**
         * 需要延迟下载的图片
         */
        //this.images

        /**
         * 开始延迟的 Y 坐标
         */
        //this.threshold

        // init
        this._init();
    };

    Lang.augmentObject(ImageLazyload.prototype, {
        /**
         * 初始化
         * @protected
         */
        _init: function() {
            this.threshold = Dom.getViewportHeight() + this.config.diff;
            this.images = this._filterImgs();

            if (this.images.length > 0) {
                this._initScroll();
            }
        },

        /**
         * 初始化滚动事件
         * @protected
         */
        _initScroll: function() {
            var timer, self = this;

            Event.on(window, "scroll", function() {
                if(timer) return;

                timer = setTimeout(function(){
                    // load
                    self._loadImgs();

                    // free
                    if (self.images.length === 0) {
                        Event.removeListener(window, "scroll", arguments.callee);
                    }
                    timer = null;

                }, 100); // 0.1s 内，用户感觉流畅
            });
        },

        /**
         * 获取并初始化需要延迟下载的图片
         * @protected
         */
        _filterImgs: function() {
            var imgs = this.container.getElementsByTagName("img"),
                threshold = this.threshold,
                placeholder = this.config.placeholder,
                img, ret = [];

            for (var i = 0, len = imgs.length; i < len; ++i) {
                img = imgs[i];
                if (Dom.getY(img) > threshold) {
                    img.setAttribute(DATA_SRC, img.src);
                    img.src = placeholder;
                    ret.push(img);
                }
            }
            return ret;
        },

        /**
         * 加载图片
         * @protected
         */
        _loadImgs: function() {
            var scrollTop = Dom.getDocumentScrollTop();
            if(scrollTop <= this.config.diff) return;

            var imgs = this.images,
                threshold = this.threshold,
                src, remain = [];

            for(var i = 0, img; img = imgs[i++];) {
                if(Dom.getY(img) < threshold + scrollTop) {
                    src = img.getAttribute(DATA_SRC);
                    if(src) {
                        img.src = src;
                        img.removeAttribute(DATA_SRC);
                    }
                } else {
                    remain.push(img);
                }
            }
            this.images = remain;
        }
    });

    KISSY.ImageLazyload = ImageLazyload;
})();

/**
 * NOTES:
 *
 * 目前的方案：
 *  1. 在 Firefox 下非常完美。脚本运行时，还没有任何图片开始下载，能真正做到延迟加载。
 *  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 Abort 掉，
 *     再在滚动时延迟加载，对于 listing 等页面说来，反而增加了链接数。
 *  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 Abort 掉下载。该
 *     脚本完全无用。
 *  4. 在 Opera 下，和 Firefox 一致，完美。
 *
 * 缺点：
 *  1. 对于大部分情况下，需要拖动查看内容的页面（比如搜索结果页），滚动时加载有损用户体
 *     验。用户期望的是，所滚即所得。延迟加载会挑战用户的耐心，特别是网速不好时。
 *  2. 不支持 Webkit 内核浏览器；IE 下，有可能导致 HTTP 链接数的增加。
 *
 * 优点：
 *  1. 如果一个页面，大部分用户在第一屏就跳转，延迟加载图片可以减少流量，提高性能。
 *
 * 应用前需调研：
 *  1. 页面的滚动条拉动比率（有多少用户永远只看第一屏）
 *  2. 延迟加载图片对用户耐心的挑战。提前加载一屏是否解决问题？
 *
 * 参考资料：
 *  1. http://davidwalsh.name/lazyload MooTools 的图片延迟插件
 *  2. http://vip.qq.com/ 模板输出时，就替换掉图片的 src. 这能使得在所有浏览器下都
 *     能实现延迟加载。缺点是：不渐进增强，无 JS 时，图片不能展示。对搜索爬虫不利。
 *  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
 *
 * 最后的感慨：这个插件有点鸡肋
 */