/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed
http://kissy.googlecode.com/

Date: 2009-09-03 17:28:58
Revision: 134
*/
/**
 * KISSY.ImageLazyload 图片延迟加载组件
 *
 * imglazyload.js
 * requires: yahoo-dom-event
 *
 * @author lifesinger@gmail.com
 */

var KISSY = window.KISSY || {};

(function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        DATA_SRC = "data-lazyload-src",
        MOD = { AUTO: "auto", MANUAL: "manual" },

        defaultConfig = {

            /**
             * 懒处理模式
             *  auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *  manual - 输出 html 时，已经将需要延迟加载的 img.src 替换为 img.DATA_SRC
             */
            mod: MOD.AUTO,

            /**
             * 当前视窗往下，diff px 外的图片延迟加载
             * 适当设置此值，可以让用户在拖动时感觉图片已经加载好
             * 默认为当前视窗高度（两屏以外的才延迟加载）
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
    var ImageLazyload = function(containers, config) {
        // Factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(containers, config);
        }

        // 允许仅传递 config 参数
        if(typeof config === "undefined") {
            config = containers;
            containers = [document];
        }

        // containers 是一个 HTMLElement
        if(!Lang.isArray(containers)) {
            containers = [Dom.get(containers) || document];
        }

        /**
         * 图片所在容器（可以多个），默认为 [document]
         * @type Array
         */
        this.containers = containers;

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});

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
                this._initLoadEvent();
            }
        },

        /**
         * 初始化加载事件
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this;

            // 滚动时，加载图片
            Event.on(window, "scroll", function() {
                if(timer) return;

                timer = setTimeout(function() {
                    // load
                    self._loadImgs();

                    // free
                    if (self.images.length === 0) {
                        Event.removeListener(window, "scroll", arguments.callee);
                    }
                    timer = null;

                }, 100); // 0.1s 内，用户感觉流畅
            });

            // 手工模式时，第一屏也有可能有 data-src 项
            if(this.config.mod === MOD.MANUAL) {
                // 需要立即加载一次，以保证第一屏图片可见
                Event.onDOMReady(function() {
                    self._loadImgs(true);
                });
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
                img, data_src, ret = [];

            for (var n = 0, N = containers.length; n < N; ++n) {
                var imgs = containers[n].getElementsByTagName("img");

                for (var i = 0, len = imgs.length; i < len; ++i) {
                    img = imgs[i];
                    data_src = img.getAttribute(DATA_SRC);

                    // 手工模式，只需处理有 data-src 的图片
                    // 原因：当有不需要延迟的图片在 threshold 以后时，只处理有 data-src 的图片可以
                    //      减少 IE 下被 abort 掉的 http 图片链接
                    if (isManualMod && data_src) {
                        img.src = placeholder;
                        ret.push(img);

                    // 自动模式，只需处理 threshold 外的图片
                    } else if (Dom.getY(img) > threshold) {
                        img.setAttribute(DATA_SRC, img.src);
                        img.src = placeholder;
                        ret.push(img);
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
            if(!force && scrollTop <= this.config.diff) return;

            var imgs = this.images,
                threshold = this.threshold,
                data_src, remain = [];

            for(var i = 0, img; img = imgs[i++];) {
                if(Dom.getY(img) < threshold + scrollTop) {
                    data_src = img.getAttribute(DATA_SRC);

                    if(data_src && img.src != data_src) {
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
 * 感慨：这个插件有点鸡肋
 *
 * 2009-09-03 更新：
 *  1. 考虑到图片对主流 SEO 影响很小，腾讯一开始就替换掉 src 的方法是可行的。
 *  2. 对于淘宝 srp 页面，将后一半图片延迟加载，是一个不错的权衡。
 *  3. 上面 2 的缺点是，如用用户屏幕很高，第一屏露出了 data-src 项，则当用户不滚动屏幕时，
 *     延迟的空白图片永远不会加载。（基本上可以）
 */