/**
 * @ignore
 * @fileOverview 数据延迟加载组件
 */
KISSY.add('datalazyload', function (S, DOM, Event, Base, undefined) {

    var win = S.Env.host,
        doc = win.document,
        IMG_SRC_DATA = 'data-ks-lazyload',
        AREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM = '-custom',
        MANUAL = 'manual',
        DEFAULT = 'default',
        NONE = 'none',
        SCROLL = 'scroll',
        TOUCH_MOVE = "touchmove",
        RESIZE = 'resize',
        DURATION = 100;

    function isValidContainer(c) {
        return c.nodeType != 9;
    }

    function inDocument(el) {
        return DOM.contains(doc, el);
    }

    function getContainer(elem, cs) {
        for (var i = 0; i < cs.length; i++) {
            if (isValidContainer(cs[i])) {
                if (cs[i].contains(elem)) {
                    return cs[i];
                }
            }
        }
        return 0;
    }

    // 加载图片 src
    var loadImgSrc = function (img, flag) {
        flag = flag || IMG_SRC_DATA;
        var dataSrc = img.getAttribute(flag);

        if (dataSrc && img.src != dataSrc) {
            img.src = dataSrc;
            img.removeAttribute(flag);
        }
    };

    function removeExisting(newed, exists) {
        var ret = [];
        for (var i = 0; i < newed.length; i++) {
            if (!S.inArray(newed[i], exists)) {
                ret.push(newed[i]);
            }
        }
        return ret;
    }

    // 从 textarea 中加载数据
    function loadAreaData(area, execScript) {
        // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
        area.style.display = NONE;
        area.className = ''; // clear hook
        var content = DOM.create('<div>');
        // area 直接是 container 的儿子
        area.parentNode.insertBefore(content, area);
        DOM.html(content, area.value, execScript);
    }

    // filter for lazyload textarea
    function filterArea(area) {
        return DOM.hasClass(area, AREA_DATA_CLS);
    }

    /**
     * LazyLoad elements which are out of current viewPort.
     * @class KISSY.DataLazyload
     * @extends KISSY.Base
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
            containers = [DOM.get(containers) || doc];
        }

        config = config || {};

        config.containers = containers;

        DataLazyload.superclass.constructor.call(self, config);


        // 需要延迟下载的图片
        // self._images


        // 需要延迟处理的 textarea
        // self._areaes


        // 和延迟项绑定的回调函数
        self._callbacks = {els: [], fns: []};

        self._init();
    }

    DataLazyload.ATTRS = {
        /**
         * Do not use this any more.
         * @cfg {String} mod
         * @deprecated
         */
        /**
         * @ignore
         */
        mod: {
            value: MANUAL
        },
        /**
         * Distance outside viewport or specified container to pre load.
         * default: pre load one screen height and width.
         * @cfg {Number|Object} diff
         *
         *  for example:
         *
         *      diff : 50 // pre load 50px outside viewport or specified container
         *      // or more detailed :
         *      diff: {
         *          left:20, // pre load 50px outside left edge of viewport or specified container
         *          right:30, // pre load 50px outside right edge of viewport or specified container
         *          top:50, // pre load 50px outside top edge of viewport or specified container
         *          bottom:60 // pre load 50px outside bottom edge of viewport or specified container
         *      }
         */
        /**
         * @ignore
         */
        diff: {
            value: DEFAULT
        },
        /**
         * Placeholder img url for lazy loaded _images.
         * default: empty
         * @cfg {String} placeholder
         */
        /**
         * @ignore
         */
        placeholder: {
            value: NONE
        },

        /**
         * Whether execute script in lazy loaded textarea.
         * default: true
         * @cfg {Boolean} execScript
         */
        /**
         * @ignore
         */
        execScript: {
            value: true
        },

        /**
         * Containers which will be monitor scroll event to lazy load elements within it.
         * default: [ document ]
         * @cfg {HTMLElement[]} containers
         */
        /**
         * @ignore
         */
        containers: {
            valueFn: function () {
                return [doc];
            }
        },

        /**
         * Whether destroy this component when all lazy loaded elements are loaded.
         * default: true
         * @cfg {Boolean} autoDestroy
         */
        /**
         * @ignore
         */
        autoDestroy: {
            value: true
        }
    };

    // 两块区域是否相交
    function isCross(r1, r2) {
        var r = {};
        r.top = Math.max(r1.top, r2.top);
        r.bottom = Math.min(r1.bottom, r2.bottom);
        r.left = Math.max(r1.left, r2.left);
        r.right = Math.min(r1.right, r2.right);
        return r.bottom >= r.top && r.right >= r.left;
    }

    S.extend(DataLazyload,
        Base,

        {

            /**
             * @private
             */
            _init: function () {
                var self = this;
                self._filterItems();
                self._initLoadEvent();
            },

            /**
             * get _images and _areaes which will lazyload.
             * @private
             */
            _filterItems: function () {
                var self = this,
                    containers = self.get("containers"),
                    n, N, imgs, _areaes, img,
                    lazyImgs = [], lazyAreas = [];

                for (n = 0, N = containers.length; n < N; ++n) {
                    imgs = removeExisting(DOM.query('img', containers[n]), lazyImgs);
                    lazyImgs = lazyImgs.concat(S.filter(imgs, self._filterImg, self));

                    _areaes = removeExisting(DOM.query('textarea', containers[n]), lazyAreas);
                    lazyAreas = lazyAreas.concat(S.filter(_areaes, filterArea, self));
                }

                self._images = lazyImgs;
                self._areaes = lazyAreas;
            },

            /**
             * filter for lazyload image
             * @private
             */
            _filterImg: function (img) {
                var self = this,
                    dataSrc = img.getAttribute(IMG_SRC_DATA),
                    placeholder = self.get("placeholder"),
                    isManualMod = self.get("mod") === MANUAL;

                // 手工模式，只处理有 data-src 的图片
                if (isManualMod) {
                    if (dataSrc) {
                        if (placeholder !== NONE) {
                            img.src = placeholder;
                        }
                        return true;
                    }
                }
                // 自动模式，只处理 threshold 外无 data-src 的图片
                else {
                    // 注意：已有 data-src 的项，可能已有其它实例处理过，不用再次处理
                    if (!dataSrc && !self._checkElemInViewport(img)) {
                        DOM.attr(img, IMG_SRC_DATA, img.src);
                        if (placeholder !== NONE) {
                            img.src = placeholder;
                        } else {
                            img.removeAttribute('src');
                        }
                        return true;
                    }
                }
            },


            /**
             * attach scroll/resize event
             * @private
             */
            _initLoadEvent: function () {
                var self = this,
                    autoDestroy = self.get("autoDestroy"),
                // 加载延迟项
                    loadItems = function () {
                        self._loadItems();
                        if (autoDestroy &&
                            self._getItemsLength() === 0) {
                            self.destroy();
                        }
                    },
                // 加载函数
                    load = S.buffer(loadItems, DURATION, this);

                // scroll 和 resize 时，加载图片
                Event.on(win, SCROLL, load);
                Event.on(win, TOUCH_MOVE, load);
                Event.on(win, RESIZE, load);

                S.each(self.get("containers"), function (c) {
                    if (isValidContainer(c)) {
                        Event.on(c, SCROLL, load);
                        Event.on(c, TOUCH_MOVE, load);
                    }
                });

                self._loadFn = load;

                // 需要立即加载一次，以保证第一屏的延迟项可见
                if (self._getItemsLength()) {
                    S.ready(loadItems);
                }
            },

            /**
             * force datalazyload to recheck constraints and load lazyload
             * @public
             */
            refresh: function () {
                this._loadItems();
            },

            /**
             * lazyload all items
             * @private
             */
            _loadItems: function () {
                var self = this;
                self._loadImgs();
                self._loadAreas();
                self._fireCallbacks();
            },

            /**
             * lazyload images
             * @private
             */
            _loadImgs: function () {
                var self = this;
                self._images = S.filter(self._images, self._loadImg, self);
            },

            /**
             * check image whether it is inside viewport and load
             * @private
             */
            _loadImg: function (img) {
                var self = this;
                if (!inDocument(img)) {

                } else if (self._checkElemInViewport(img)) {
                    loadImgSrc(img);
                } else {
                    return true;
                }
            },


            /**
             * lazyload textareas
             * @private
             */
            _loadAreas: function () {
                var self = this;
                self._areaes = S.filter(self._areaes, self._loadArea, self);
            },

            /**
             * check textarea whether it is inside viewport and load
             * @private
             */
            _loadArea: function (area) {
                var self = this;
                if (!inDocument(area)) {

                } else if (self._checkElemInViewport(area)) {
                    loadAreaData(area, self.get("execScript"));
                } else {
                    return true;
                }
            },

            /**
             * fire callbacks
             * @private
             */
            _fireCallbacks: function () {
                var self = this,
                    callbacks = self._callbacks,
                    els = callbacks.els,
                    fns = callbacks.fns,
                    remove = 0,
                    i, el, fn, remainEls = [],
                    remainFns = [];

                for (i = 0; (el = els[i]) && (fn = fns[i++]);) {
                    remove = false;
                    if (!inDocument(el)) {
                        remove = true;
                    } else if (self._checkElemInViewport(el)) {
                        remove = fn.call(el);
                    }
                    if (remove === false) {
                        remainEls.push(el);
                        remainFns.push(fn);
                    }
                }
                callbacks.els = remainEls;
                callbacks.fns = remainFns;
            },

            /**
             * Register callback function. When el is in viewport, then fn is called.
             * @param {HTMLElement|String} el html element to be monitored.
             * @param {function(this: HTMLElement): boolean} fn
             * Callback function to be called when el is in viewport.
             * return false to indicate el is actually not in viewport( for example display none element ).
             */
            'addCallback': function (el, fn) {
                var self = this,
                    callbacks = self._callbacks;
                el = DOM.get(el);

                if (el && S.isFunction(fn)) {
                    callbacks.els.push(el);
                    callbacks.fns.push(fn);
                }

                // add 立即检测，防止首屏元素问题
                self._fireCallbacks();
            },

            /**
             * Remove a callback function. See {@link KISSY.DataLazyload#addCallback}
             * @param {HTMLElement|String} el html element to be monitored.
             * @param {Function} [fn] Callback function to be called when el is in viewport.
             *                        If not specified, remove all callbacks associated with el.
             */
            'removeCallback': function (el, fn) {
                var callbacks = this._callbacks,
                    els = [],
                    fns = [],
                    curFns = callbacks.fns;

                el = DOM.get(el);

                S.each(callbacks.els, function (curEl, index) {
                    if (curEl == el) {
                        if (fn === undefined || fn == curFns[index]) {
                            return;
                        }
                    }

                    els.push(curEl);
                    fns.push(curFns[index]);
                });

                callbacks.fns = fns;
                callbacks.els = els;
            },

            /**
             * Add a array of imgs or textareas to be lazy loaded to monitor list.
             * @param {HTMLElement[]} els Array of imgs or textareas to be lazy loaded
             */
            'addElements': function (els) {
                if (!S.isArray(els)) {
                    els = [els];
                }
                var self = this,
                    imgs = self._images || [],
                    areaes = self._areaes || [];
                S.each(els, function (el) {
                    var nodeName = el.nodeName.toLowerCase();
                    if (nodeName == "img") {
                        if (!S.inArray(el, imgs)) {
                            imgs.push(el);
                        }
                    } else if (nodeName == "textarea") {
                        if (!S.inArray(el, areaes)) {
                            areaes.push(el);
                        }
                    }
                });
                self._images = imgs;
                self._areaes = areaes;
            },

            /**
             * Remove a array of element from monitor list. See {@link KISSY.DataLazyload#addElements}.
             * @param {HTMLElement[]} els Array of imgs or textareas to be lazy loaded
             */
            'removeElements': function (els) {
                if (!S.isArray(els)) {
                    els = [els];
                }
                var self = this,
                    imgs = [], areaes = [];
                S.each(self._images, function (img) {
                    if (!S.inArray(img, els)) {
                        imgs.push(img);
                    }
                });
                S.each(self._areaes, function (area) {
                    if (!S.inArray(area, els)) {
                        areaes.push(area);
                    }
                });
                self._images = imgs;
                self._areaes = areaes;
            },

            /**
             * get c's bounding area.
             * @param {window|HTMLElement} [c]
             * @private
             */
            _getBoundingRect: function (c) {
                var vh, vw, left, top;

                if (c !== undefined &&
                    !S.isWindow(c) &&
                    c.nodeType != 9) {
                    vh = DOM.outerHeight(c);
                    vw = DOM.outerWidth(c);
                    var offset = DOM.offset(c);
                    left = offset.left;
                    top = offset.top;
                } else {
                    vh = DOM.viewportHeight();
                    vw = DOM.viewportWidth();
                    left = DOM.scrollLeft();
                    top = DOM.scrollTop();
                }

                var diff = this.get("diff"),
                    diffX = diff === DEFAULT ? vw : diff,
                    diffX0 = 0,
                    diffX1 = diffX,
                    diffY = diff === DEFAULT ? vh : diff,
                // 兼容，默认只向下预读
                    diffY0 = 0,
                    diffY1 = diffY,
                    right = left + vw,
                    bottom = top + vh;

                if (S.isObject(diff)) {
                    diffX0 = diff.left || 0;
                    diffX1 = diff.right || 0;
                    diffY0 = diff.top || 0;
                    diffY1 = diff.bottom || 0;
                }

                left -= diffX0;
                right += diffX1;
                top -= diffY0;
                bottom += diffY1;

                return {
                    left: left,
                    top: top,
                    right: right,
                    bottom: bottom
                };
            },

            /**
             * get num of items waiting to lazyload
             * @private
             */
            _getItemsLength: function () {
                var self = this;
                return self._images.length + self._areaes.length + self._callbacks.els.length;
            },

            /**
             * whether part of elem can be seen by user.
             * note: it will not handle display none.
             * @private
             * @param {HTMLElement} elem
             */
            _checkElemInViewport: function (elem) {
                // 注：不处理 elem display: none 或处于 display none 元素内的情景
                var self = this,
                    elemOffset = DOM.offset(elem),
                    inContainer = true,
                    container = getContainer(elem, self.get("containers")),
                    windowRegion = self._getBoundingRect(),
                    inWin,
                    containerRegion,
                    left = elemOffset.left,
                    top = elemOffset.top,
                    elemRegion = {
                        left: left,
                        top: top,
                        right: left + DOM.outerWidth(elem),
                        bottom: top + DOM.outerHeight(elem)
                    };

                if (container) {
                    containerRegion = self._getBoundingRect(container);
                    inContainer = isCross(containerRegion, elemRegion);
                }

                // 确保在容器内出现
                // 并且在视窗内也出现
                inWin = isCross(windowRegion, elemRegion);
                return inContainer && inWin;
            },

            /**
             * Destroy this component.Will fire destroy event.
             */
            destroy: function () {
                var self = this, load = self._loadFn;
                Event.remove(win, SCROLL, load);
                Event.remove(win, TOUCH_MOVE, load);
                Event.remove(win, RESIZE, load);
                load.stop();
                S.each(self.get("containers"), function (c) {
                    if (isValidContainer(c)) {
                        Event.remove(c, SCROLL, load);
                        Event.remove(c, TOUCH_MOVE, load);
                    }
                });
                self._callbacks.els = [];
                self._callbacks.fns = [];
                self._images = [];
                self._areaes = [];
                S.log("datalazyload is destroyed!");
                self.fire("destroy");
            }
        });

    /**
     * Load lazyload textarea and imgs manually.
     * @ignore
     * @name loadCustomLazyData
     * @method
     * @memberOf DataLazyload
     * @param {HTMLElement[]} containers Containers with in which lazy loaded elements are loaded.
     * @param {String} type Type of lazy loaded element. "img" or "textarea"
     * @param {String} [flag] flag which will be searched to find lazy loaded elements from containers.
     * Default "data-ks-lazyload-custom" for img attribute and "ks-lazyload-custom" for textarea css class.
     */
    function loadCustomLazyData(containers, type, flag) {
        var imgs;

        if (type === 'img-src') {
            type = 'img';
        }

        // 支持数组
        if (!S.isArray(containers)) {
            containers = [DOM.get(containers)];
        }

        // 遍历处理
        S.each(containers, function (container) {
            switch (type) {
                case 'img':
                    if (container.nodeName === 'IMG') { // 本身就是图片
                        imgs = [container];
                    } else {
                        imgs = DOM.query('img', container);
                    }

                    S.each(imgs, function (img) {
                        loadImgSrc(img, flag || (IMG_SRC_DATA + CUSTOM));
                    });
                    break;

                default:
                    DOM.query('textarea', container).each(function (area) {
                        if (DOM.hasClass(area, flag || (AREA_DATA_CLS + CUSTOM))) {
                            loadAreaData(area, true);
                        }
                    });
            }
        });
    }


    DataLazyload.loadCustomLazyData = loadCustomLazyData;

    S.DataLazyload = DataLazyload;

    return DataLazyload;

}, { requires: ['dom', 'event', 'base'] });

/**
 * @ignore
 *
 * NOTES:
 *
 * 模式为 auto 时：
 *  1. 在 Firefox 下非常完美。脚本运行时，还没有任何图片开始下载，能真正做到延迟加载。
 *  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 abort 掉，
 *     再在滚动时延迟加载，反而增加了链接数。
 *  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 abort 掉下载。该
 *     脚本完全无用。
 *  4. 在 Opera 下，和 Firefox 一致，完美。
 *  5. 2010-07-12: 发现在 Firefox 下，也有导致部分 Aborted 链接。
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
 *  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-_images/
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
 *     里。可以添加 hidden 等 class, 但建议用 invisible, 并设定 height = '实际高度'，这样可以保证
 *     滚动时，diff 更真实有效。
 *     注意：textarea 加载后，会替换掉父容器中的所有内容。
 *  2. 延迟 callback 约定：dataLazyload.addCallback(el, fn) 表示当 el 即将出现时，触发 fn.
 *  3. 所有操作都是最多触发一次，比如 callback. 来回拖动滚动条时，只有 el 第一次出现时会触发 fn 回调。
 *
 * xTODO:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 *
 * UPDATE LOG:
 *   - 2012-04-27 yiminghe@gmail.com refactor to extend base, add removeCallback/addElements ...
 *   - 2012-04-27 yiminghe@gmail.com 检查是否在视窗内改做判断区域相交，textarea 可设置高度，宽度
 *   - 2012-04-25 yiminghe@gmail.com refactor, 监控容器内滚动，包括横轴滚动
 *   - 2012-04-12 yiminghe@gmail.com monitor touchmove in ios
 *   - 2011-12-21 yiminghe@gmail.com 增加 removeElements 与 destroy 接口
 *   - 2010-07-31 yubo IMG_SRC_DATA 由 data-lazyload-src 更名为 data-ks-lazyload + 支持 touch 设备
 *   - 2010-07-10 yiminghe@gmail.com 重构，使用正则表达式识别 html 中的脚本，使用 EventTarget 自定义事件机制来处理回调
 *   - 2010-05-10 yubo ie6 下，在 dom ready 后执行，会导致 placeholder 重复加载，为比避免此问题，默认为 none, 去掉占位图
 *   - 2010-04-05 yubo 重构，使得对 YUI 的依赖仅限于 YDOM
 *   - 2009-12-17 yubo 将 imglazyload 升级为 datalazyload, 支持 textarea 方式延迟和特定元素即将出现时的回调函数
 */
