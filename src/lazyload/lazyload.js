/**
 * KISSY.Lazyload 图片延迟加载组件
 *
 * lazyload.js
 * requires: yahoo-dom-event
 *
 * @author lifesinger@gmail.com
 */

var KISSY = window.KISSY || {};

/**
 * 图片延迟加载组件
 * @class Lazyload
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 */
KISSY.Lazyload = (function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        DATA_SRC = "kissy-lazyload-src",

        /**
         * 默认配置
         */
        defaultConfig = {
            /**
             * 当前视窗往下，diff px 外的图片延迟加载
             */
            diff: 0,

            /**
             * 占位指示图
             */
            placeholder: "blank.gif"
        };

    function Lazyload(id, config) {

        // Allow instantiation without the new operator
        if (!(this instanceof Lazyload)) {
            new Lazyload(id, config);
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
    }

    Lazyload.prototype = {
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
                    clearTimeout(timer);
                    timer = null;

                }, 100); // 0.1s 内，用户感觉流畅。
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
        },

        /**
         * 构造函数
         */
        constructor: Lazyload
    };

    return Lazyload;
})();
