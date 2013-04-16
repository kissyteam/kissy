/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:14
*/
/**
 * @ignore
 * 数据延迟加载组件
 */
KISSY.add('datalazyload', function (S, DOM, Event, Base, undefined) {

    var win = S.Env.host,
        doc = win.document,
        IMG_SRC_DATA = 'data-ks-lazyload',
        AREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM = '-custom',
        DEFAULT = 'default',
        NONE = 'none',
        SCROLL = 'scroll',
        TOUCH_MOVE = "touchmove",
        RESIZE = 'resize',
        DURATION = 100,

        webpSupportMeta = {
            detected: false,
            supported: false
        };

    // 加载图片 src
    var loadImgSrc = function (img, flag, webpFilter) {
        flag = flag || IMG_SRC_DATA;
        var dataSrc = img.getAttribute(flag),
            realSrc = '';

        if (dataSrc && img.src != dataSrc) {
            if (webpFilter && webpSupportMeta.supported) {
                if (S.isFunction(webpFilter)) {
                    realSrc = webpFilter(dataSrc, img);
                } else if (S.isArray(webpFilter)) {
                    var i,
                        len = webpFilter.length,
                        rule;
                    for (i = 0; i < len; i++) {
                        rule = webpFilter[i];
                        if (dataSrc.match(rule[0])) {
                            realSrc = dataSrc.replace(rule[0], rule[1]);
                            break;
                        }
                    }
                }
            } else {
                realSrc = dataSrc;
            }
            if (!realSrc) {
                realSrc = dataSrc;
            }
            img.src = realSrc;
            img.removeAttribute(flag);
        }
    };

    // 从 textarea 中加载数据
    function loadAreaData(textarea, execScript) {
        // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
        textarea.style.display = NONE;
        textarea.className = ''; // clear hook
        var content = DOM.create('<div>');
        // textarea 直接是 container 的儿子
        textarea.parentNode.insertBefore(content, textarea);
        DOM.html(content, textarea.value, execScript);
    }

    function getCallbackKey(el, fn) {
        var id, fid;
        if (!(id = el.id)) {
            id = el.id = S.guid('ks-lazyload');
        }

        if (!(fid = fn.ksLazyloadId)) {
            fid = fn.ksLazyloadId = S.guid('ks-lazyload');
        }
        return id + fid;
    }

    function cacheWidth(el) {
        if (el._ks_lazy_width) {
            return el._ks_lazy_width;
        }
        return el._ks_lazy_width = DOM.outerWidth(el);
    }


    function cacheHeight(el) {
        if (el._ks_lazy_height) {
            return el._ks_lazy_height;
        }
        return el._ks_lazy_height = DOM.outerHeight(el);
    }


    /**
     * whether part of elem can be seen by user.
     * note: it will not handle display none.
     * @ignore
     */
    function elementInViewport(elem, windowRegion, containerRegion) {
        // it's better to removeElements,
        // but if user want to append it later?
        // use addElements instead
        // if (!inDocument(elem)) {
        //    return false;
        // }
        // display none or inside display none
        if (!elem.offsetWidth) {
            return false;
        }
        var elemOffset = DOM.offset(elem),
            inContainer = true,
            inWin,
            left = elemOffset.left,
            top = elemOffset.top,
            elemRegion = {
                left: left,
                top: top,
                right: left + cacheWidth(elem),
                bottom: top + cacheHeight(elem)
            };

        inWin = isCross(windowRegion, elemRegion);

        if (inWin && containerRegion) {
            inContainer = isCross(containerRegion, elemRegion);
        }

        // 确保在容器内出现
        // 并且在视窗内也出现
        return inContainer && inWin;
    }

    /**
     * LazyLoad elements which are out of current viewPort.
     * @class KISSY.DataLazyload
     * @extends KISSY.Base
     */
    function DataLazyload(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof DataLazyload)) {
            return new DataLazyload(container, config);
        }

        var newConfig = container;

        if (!S.isPlainObject(newConfig)) {
            newConfig = config || {};
            if (container) {
                newConfig.container = container;
            }
        }

        DataLazyload.superclass.constructor.call(self, newConfig);


        // 需要延迟下载的图片
        // self._images


        // 需要延迟处理的 textarea
        // self._textareas


        // 和延迟项绑定的回调函数
        self._callbacks = {};
        self._containerIsNotDocument = self.get('container').nodeType != 9;

        self['_filterItems']();
        self['_initLoadEvent']();
    }

    DataLazyload.ATTRS = {
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

        // TODO: add containerDiff for container is not document

        /**
         * Placeholder img url for lazy loaded _images if image 's src is empty.
         * must be not empty!
         *
         * Defaults to: http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif
         * @cfg {String} placeholder
         */
        /**
         * @ignore
         */
        placeholder: {
            value: 'http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif'
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
         * Container which will be monitor scroll event to lazy load elements within it.
         * default: document
         * @cfg {HTMLElement} container
         */
        /**
         * @ignore
         */
        container: {
            setter: function (el) {
                el = el || doc;
                if (S.isWindow(el)) {
                    el = el.document;
                } else {
                    el = DOM.get(el);
                    if (DOM.nodeName(el) == 'body') {
                        el = el.ownerDocument;
                    }
                }
                return el;
            },
            valueFn: function () {
                return doc;
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
        },

        /**
         * Check whether current browser support webp and process each lazyload image.
         * Defaults to: null.
         * @cfg {Array|Function} webpFilter
         */
        webpFilter: {
            value: null
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

    S.extend(DataLazyload, Base, {

        /**
         * get _images and _textareas which will lazyload.
         * @private
         */
        '_filterItems': function () {
            var self = this,
                userConfig = self.userConfig,
                container = self.get("container"),
                _images = [],
                _textareas = [],
                containers = [container];

            // 兼容 1.2 传入数组，进入兼容模式，不检测 container 区域
            if (S.isArray(userConfig.container)) {
                self._backCompact = 1;
                containers = userConfig.container;
            }

            S.each(containers, function (container) {
                _images = _images.concat(S.filter(DOM.query('img', container), self['_filterImg'], self));
                _textareas = _textareas.concat(DOM.query('textarea.' + AREA_DATA_CLS, container));
            });

            self._images = _images;
            self._textareas = _textareas;

        },

        /**
         * filter for lazyload image
         * @private
         */
        '_filterImg': function (img) {
            var self = this,
                placeholder = self.get("placeholder");

            if (img.getAttribute(IMG_SRC_DATA)) {
                if (!img.src) {
                    img.src = placeholder;
                }
                return true;
            }

            return undefined;
        },


        /**
         * attach scroll/resize event
         * @private
         */
        '_initLoadEvent': function () {
            var self = this,
                img = new Image(),
                placeholder = self.get("placeholder"),
                autoDestroy = self.get("autoDestroy"),
            // 加载延迟项
                _loadItems = function () {
                    self['_loadItems']();
                    if (autoDestroy && self['_isLoadAllLazyElements']()) {
                        self.destroy();
                    }
                },
                loadItems = function () {
                    if (self.get('webpFilter')) {
                        checkWebpSupport(function () {
                            _loadItems()
                        });
                    } else {
                        _loadItems()
                    }
                };

            // 加载函数
            self._loadFn = S.buffer(loadItems, DURATION, self);

            self.resume();

            img.src = placeholder;

            function firstLoad() {
                // 需要立即加载一次，以保证第一屏的延迟项可见
                if (!self['_isLoadAllLazyElements']()) {
                    S.ready(loadItems);
                }
            }

            if (img.complete) {
                firstLoad()
            } else {
                img.onload = firstLoad;
            }
        },

        /**
         * force datalazyload to recheck constraints and load lazyload
         *
         */
        refresh: function () {
            this._loadFn();
        },

        /**
         * lazyload all items
         * @private
         */
        '_loadItems': function () {
            var self = this,
                containerRegion,
                container = self.get('container'),
                windowRegion;
            // container is display none
            if (self._containerIsNotDocument && !container.offsetWidth) {
                return;
            }
            windowRegion = self['_getBoundingRect']();
            // 兼容，不检测 container
            if (!self._backCompact && self._containerIsNotDocument) {
                containerRegion = self['_getBoundingRect'](self.get('container'));
            }
            self['_loadImgs'](windowRegion, containerRegion);
            self['_loadTextAreas'](windowRegion, containerRegion);
            self['_fireCallbacks'](windowRegion, containerRegion);
        },

        /**
         * lazyload images
         * @private
         */
        '_loadImgs': function (windowRegion, containerRegion) {
            var self = this;
            self._images = S.filter(self._images, function (img) {
                if (elementInViewport(img, windowRegion, containerRegion)) {
                    return loadImgSrc(img, undefined, self.get('webpFilter'));
                } else {
                    return true;
                }
            }, self);
        },


        /**
         * lazyload textareas
         * @private
         */
        '_loadTextAreas': function (windowRegion, containerRegion) {
            var self = this, execScript = self.get('execScript');
            self._textareas = S.filter(self._textareas, function (textarea) {
                if (elementInViewport(textarea, windowRegion, containerRegion)) {
                    return loadAreaData(textarea, execScript);
                } else {
                    return true;
                }
            }, self);
        },

        /**
         * fire callbacks
         * @private
         */
        '_fireCallbacks': function (windowRegion, containerRegion) {
            var self = this,
                callbacks = self._callbacks;

            // may call addCallback/removeCallback
            S.each(callbacks, function (callback, key) {
                var el = callback.el,
                    remove = false,
                    fn = callback.fn;
                if (elementInViewport(el, windowRegion, containerRegion)) {
                    remove = fn.call(el);
                }
                if (remove !== false) {
                    delete callbacks[key];
                }
            });
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

            callbacks[getCallbackKey(el, fn)] = {
                el: DOM.get(el),
                fn: fn
            };

            // add 立即检测，防止首屏元素问题
            self._loadFn();
        },

        /**
         * Remove a callback function. See {@link KISSY.DataLazyload#addCallback}
         * @param {HTMLElement|String} el html element to be monitored.
         * @param {Function} [fn] Callback function to be called when el is in viewport.
         *                        If not specified, remove all callbacks associated with el.
         */
        'removeCallback': function (el, fn) {
            var callbacks = this._callbacks;
            el = DOM.get(el);
            delete callbacks[getCallbackKey(el, fn)];
        },

        /**
         * get to be lazy loaded elements
         * @return {Object} eg: {images:,textareas:}
         */
        'getElements': function () {
            return {
                images: this._images,
                textareas: this._textareas
            };
        },

        /**
         * Add a array of imgs or textareas to be lazy loaded to monitor list.
         * @param {HTMLElement[]|String} els Array of imgs or textareas to be lazy loaded or selector
         */
        'addElements': function (els) {
            if (typeof els == 'string') {
                els = DOM.query(els);
            } else if (!S.isArray(els)) {
                els = [els];
            }
            var self = this,
                imgs = self._images || [],
                textareas = self._textareas || [];
            S.each(els, function (el) {
                var nodeName = el.nodeName.toLowerCase();
                if (nodeName == "img") {
                    if (!S.inArray(el, imgs)) {
                        imgs.push(el);
                    }
                } else if (nodeName == "textarea") {
                    if (!S.inArray(el, textareas)) {
                        textareas.push(el);
                    }
                }
            });
            self._images = imgs;
            self._textareas = textareas;
        },

        /**
         * Remove a array of element from monitor list. See {@link KISSY.DataLazyload#addElements}.
         * @param {HTMLElement[]|String} els Array of imgs or textareas to be lazy loaded
         */
        'removeElements': function (els) {
            if (typeof els == 'string') {
                els = DOM.query(els);
            } else if (!S.isArray(els)) {
                els = [els];
            }
            var self = this,
                imgs = [],
                textareas = [];
            S.each(self._images, function (img) {
                if (!S.inArray(img, els)) {
                    imgs.push(img);
                }
            });
            S.each(self._textareas, function (textarea) {
                if (!S.inArray(textarea, els)) {
                    textareas.push(textarea);
                }
            });
            self._images = imgs;
            self._textareas = textareas;
        },

        /**
         * get c's bounding textarea.
         * @param {window|HTMLElement} [c]
         * @private
         */
        '_getBoundingRect': function (c) {
            var vh, vw, left, top;

            if (c !== undefined) {
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
        '_isLoadAllLazyElements': function () {
            var self = this;
            return (self._images.length +
                self._textareas.length +
                (S.isEmptyObject(self._callbacks) ? 0 : 1)) == 0;
        },

        /**
         * pause lazyload
         */
        pause: function () {
            var self = this,
                load = self._loadFn;
            if (self._destroyed) {
                return;
            }
            Event.remove(win, SCROLL, load);
            Event.remove(win, TOUCH_MOVE, load);
            Event.remove(win, RESIZE, load);
            load.stop();
            if (self._containerIsNotDocument) {
                var c = self.get('container');
                Event.remove(c, SCROLL, load);
                Event.remove(c, TOUCH_MOVE, load);
            }
        },

        /**
         * resume lazyload
         */
        resume: function () {
            var self = this,
                load = self._loadFn;
            if (self._destroyed) {
                return;
            }
            // scroll 和 resize 时，加载图片
            Event.on(win, SCROLL, load);
            Event.on(win, TOUCH_MOVE, load);
            Event.on(win, RESIZE, load);
            if (self._containerIsNotDocument) {
                var c = self.get('container');
                Event.on(c, SCROLL, load);
                Event.on(c, TOUCH_MOVE, load);
            }
        },

        /**
         * Destroy this component.Will fire destroy event.
         */
        destroy: function () {
            var self = this;
            self.pause();
            self._callbacks = {};
            self._images = [];
            self._textareas = [];

            self.fire("destroy");
            self._destroyed = 1;
        }
    });

    /**
     * Load lazyload textarea and imgs manually.
     * @ignore
     * @method
     * @param {HTMLElement[]} containers Containers with in which lazy loaded elements are loaded.
     * @param {String} type Type of lazy loaded element. "img" or "textarea"
     * @param {String} [flag] flag which will be searched to find lazy loaded elements from containers.
     * @param {Array|Function} [webpFilter] img src transformer when browser support webp image format
     * Default "data-ks-lazyload-custom" for img attribute and "ks-lazyload-custom" for textarea css class.
     */
    function loadCustomLazyData(containers, type, flag, webpFilter) {
        if (webpFilter) {
            checkWebpSupport(load);
        } else {
            load();
        }

        function load() {
            if (type === 'img-src') {
                type = 'img';
            }

            // 支持数组
            if (!S.isArray(containers)) {
                containers = [DOM.get(containers)];
            }

            var imgFlag = flag || (IMG_SRC_DATA + CUSTOM),
                areaFlag = flag || (AREA_DATA_CLS + CUSTOM);

            S.each(containers, function (container) {
                var containerNodeName = DOM.nodeName(container);
                // 遍历处理
                if (type == 'img') {
                    if (containerNodeName == 'img') {
                        loadImgSrc(container, imgFlag, webpFilter);
                    } else {
                        DOM.query('img', container).each(function (img) {
                            loadImgSrc(img, imgFlag, webpFilter);
                        });
                    }
                } else {
                    if (containerNodeName == 'textarea') {
                        if (DOM.hasClass(container, areaFlag)) {
                            loadAreaData(container, true);
                        }
                    } else {
                        DOM.query('textarea.' + areaFlag, container).each(function (textarea) {
                            loadAreaData(textarea, true);
                        });
                    }
                }
            });
        }
    }

    DataLazyload.loadCustomLazyData = loadCustomLazyData;

    /**
     * check browser webp format support
     * @ignore
     * @method
     * @param {Function} callback with first param{Boolean} telling whether webp is supported
     */
    function checkWebpSupport(callback) {
        if (webpSupportMeta.detected) {
            callback(webpSupportMeta.supported);
        } else {
            var imgElem,
                webpSrc = "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAAAQAgCdASoEAAQAAAcIhYWIhYSIgIIADA1gAAUAAAEAAAEAAP7%2F2fIAAAAA";

            imgElem = DOM.create('<img>');
            Event.on(imgElem, 'load error', function (evt) {
                var type = String(evt.type);
                if (type == 'load') {
                    // 图片大小检测
                    webpSupportMeta.supported = Number(this.width) === 4;
                } else if (type == 'error') {
                    webpSupportMeta.supported = false;
                }

                webpSupportMeta.detected = true;
                callback(webpSupportMeta.supported);
            });
            DOM.attr(imgElem, "src", webpSrc);
        }
    }

    DataLazyload.checkWebpSupport = checkWebpSupport;


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
 *   - 2013-03-28 myhere.2009@gmail.com add support for webp
 *   - 2013-01-07 yiminghe@gmail.com optimize for performance
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
