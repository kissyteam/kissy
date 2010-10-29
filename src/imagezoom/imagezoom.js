/**
 * @fileoverview 图片放大效果 ImageZoom.
 * @author  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 * @see silde.html
 */
KISSY.add('imagezoom', function(S, undefined) {
    var doc = document,
        DOM = S.DOM, Event = S.Event,

        CLS_PREFIX = 'ks-imagezoom-',
        CLS_VIEWER = CLS_PREFIX + 'viewer',
        CLS_LENS = CLS_PREFIX + 'lens',
        CLS_ICON = CLS_PREFIX + 'icon',
        CLS_LOADING = CLS_PREFIX + 'loading',

        STANDARD = 'standard',
        RE_IMG_SRC = /^.+\.(?:jpg|png|gif)$/i,
        round = Math.round, min = Math.min, //max = Math.max,
        AUTO = 'auto',
        POSITION = ['top', 'right', 'bottom', 'left', 'inner'],
        SRC = 'src', MOUSEMOVE = 'mousemove', PARENT = 'parent',
        HASZOOM = 'hasZoom', BIGIMAGESRC = 'bigImageSrc', ABS_STYLE = '" style="position:absolute;top:0;left:0">',

        EVENT_INIT = 'init',
        EVENT_VIEWER_INIT = 'viewer_init',
        EVENT_SHOW = 'show',
        EVENT_HIDE = 'hide',
        EVENT_LOAD_START = 'start_load',
        EVENT_LOAD_END = 'end_load',
        EVENT_LOAD_BIG_START = 'start_big_load',
        EVENT_LOAD_BIG_END = 'end_big_load',

        /**
         * 默认设置
         */
        defaultConfig = {
            type: STANDARD,            // 显示类型

            //bigImageSrc: '',           // 大图路径, 默认为 '', 会取触点上的 data-ks-imagezoom 属性值
            bigImageSize: [800, 800],  // 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值.
            position: 'right',         // 大图显示位置
            //alignTo: undefined,      // 大图显示位置相对于哪个元素, 默认不设置, 相对于小图位置, 如果取 PARENT, 为小图的 offsetParent 元素
            offset: 10,                // 大图位置的偏移量. 单一值或 [x, y]
            preload: true,             // 是否预加载大图

            zoomSize: [AUTO, AUTO],    // 放大区域宽高
            lensIcon: true,            // 是否显示放大镜提示图标
            //hasZoom: true,             // 初始是否显示放大效果

            zoomCls: ''                // 放大区域额外样式
        };

    /**
     * 图片放大镜组件
     * @class ImageZoom
     * @constructor
     * @param {Element} image 小图元素.
     * @param {Object} config 配置对象.
     */
    function ImageZoom(image, config) {
        var self = this, tmp;

        if (!(self instanceof ImageZoom)) {
            return new ImageZoom(image, config);
        }

        ImageZoom.superclass.constructor.call(this);

        /**
         * 需要缩放的图片
         * @type Element
         */
        self.image = image = S.get(image);
        if (!image) return;

        /** 配置选项
         * @type Object
         */
        self.config = config = S.merge(defaultConfig, config);
        // 支持 [x, y] or x
        config.offset = S.makeArray(config.offset);
        config.bigImageSrc && self.set(BIGIMAGESRC, config.bigImageSrc);
        config.hasZoom && self.set(HASZOOM, config.hasZoom);


        // 预加载大图
        tmp = self.get(BIGIMAGESRC);
        if (tmp && config.preload) {
            new Image().src = tmp;
        }

        // 两种显示效果切换标志
        self._isInner = config.position === POSITION[4];

        self._getAlignTo();

        // 大图高宽, 默认使用配置信息中, 当加载大图之后, 更新该值
        self._bigImageSize = { width: config.bigImageSize[0], height: config.bigImageSize[1] };

        // 首次加载小图从缓存读取或在绑定load事件之前已经加载完小图时
        self.get(HASZOOM) && !image.complete && self._startLoading();

        // 初始化标志, 多张小图切换时, 通过此标志判断是否需要初始化
        self._firstInit = true;
        // 在小图加载完毕时初始化
        imgOnLoad(image, function() {
            if (!self.get(HASZOOM)) return;
            self._finishLoading();

            self._init();
        });
    }

    S.extend(ImageZoom, S.Base);

    /**
     * 设置不同参数
     */
    ImageZoom.ATTRS = {
        /**
         * 大图路径, 默认为 '', 会取触点上的 data-ks-imagezoom 属性值
         * @type {string}
         */
        bigImageSrc: {
            value: '',
            setter: function(v) {
                var self = this,
                    old = self.get(BIGIMAGESRC);

                if (v && RE_IMG_SRC.test(v) && v !== old) {
                    self._cacheBigImageSrc = old;
                    return v;
                }
                return self.get(BIGIMAGESRC);
            },
            getter: function(v) {
                var self = this, data;

                if (!v) {
                    data = DOM.attr(self.image, 'data-ks-imagezoom');
                    if (data && RE_IMG_SRC.test(data)) v = data;
                }
                return v;
            }
        },
        /**
         * 显示放大区域标志
         * @type {boolean}
         */
        hasZoom: {
            value: true,
            setter: function(v) {
                var self = this;

                v = !!v;
                DOM[v ? 'show' : 'hide'](self.lensIcon);
                return v;
            },
            getter: function(v) {
                return v;
            }
        }
    };

    S.augment(ImageZoom, S.EventTarget, {
        /**
         * 获取参照元素的位置
         * @private
         */
        _getAlignTo: function() {
            var self = this, config = self.config, rel;

            // 参照对齐元素
            if (!self._isInner && config.alignTo) {
                if (config.alignTo === PARENT) {
                    rel = self.image.offsetParent;
                } else {
                    rel = S.get(config.alignTo);
                }
                if (rel) {
                    // 参照对齐元素的宽高, 位置信息
                    self._alignToRegion = S.merge(DOM.offset(rel), getSize(rel));
                }
            }
        },

        /**
         * 初始化, 包括构建 UI 和绑定事件
         * @private
         */
        _init: function() {
            var self = this;

            self._renderUI();
            if (self._firstInit) {
                self._bindUI();
                self.fire(EVENT_INIT);
            }
            self._firstInit = false;
        },

        /**
         * 构建所需的 DOM
         * @private
         */
        _renderUI: function() {
            var self = this, config = self.config,
                image = self.image;

            // 小图宽高及位置, 用到多次, 先保存起来; 更换小图时需要更新该值
            self._imgRegion = S.merge(DOM.offset(image), getSize(image));
            // 放大镜图标, 更改小图时不重新更改此图标位置
            if (config.lensIcon) self._renderIcon();
        },

        /**
         * 创建放大镜
         * @private
         */
        _renderIcon: function() {
            var self = this,
                region = self._alignToRegion || self._imgRegion, icon = self.lensIcon;

            if (!icon) {
                icon = createAbsElem(CLS_ICON);
                doc.body.appendChild(icon);
                /**
                 * 放大镜图标
                 * @type Element
                 */
                self.lensIcon = icon;
            }
            DOM.offset(icon, {
                left: region.left + region.width - DOM.width(icon),
                top: region.top + region.height - DOM.height(icon)
            });
        },

        /**
         * 绑定鼠标进入/离开/移动事件, 只有进入, 才响应鼠标移动事件
         * @private
         */
        _bindUI: function() {
            var self = this, timer, config = self.config;

            Event.on(self.image, 'mouseenter', function(ev) {
                if (!self.get(HASZOOM)) return;

                self._setEv(ev);
                Event.on(doc.body, MOUSEMOVE, self._setEv, self);

                timer = S.later(function() {
                    if (!self.viewer) {
                        self._createViewer();
                    }
                    self.show();
                }, 300); // 300 是感觉值，不立刻触发，同时要尽量让动画流畅
            });

            Event.on(self.image, 'mouseleave', function() {
                if (!self.get(HASZOOM)) return;

                Event.remove(doc.body, MOUSEMOVE, self._setEv);

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            });
        },

        /**
         * 保存当前鼠标位置
         * @param {Object} ev
         * @private
         */
        _setEv: function(ev) {
            this._ev = ev;
        },

        /**
         * 创建放大区域
         * @private
         */
        _createViewer: function() {
            var self = this, config = self.config,
                v, bigImage, bigImageCopy,
                bigImageSize = self._bigImageSize,
                bigImageSrc = self.get(BIGIMAGESRC);

            // 创建 viewer 的 DOM 结构
            v = createAbsElem(CLS_VIEWER + ' ' + config.zoomCls);

            if (self._isInner) {
                bigImageCopy = createImage(DOM.attr(self.image, SRC), v);
                setWidthHeight(bigImageCopy, bigImageSize.width, bigImageSize.height);
                self._bigImageCopy = bigImageCopy;
            }
            // 标准模式, 添加镜片
            else self._renderLens();

            if (bigImageSrc) {
                bigImage = createImage(bigImageSrc, v);
                !bigImage.complete && self._startBigLoading();
                /**
                 * 大图元素
                 * @type {Element}
                 */
                self.bigImage = bigImage;
            }
            doc.body.appendChild(v);
            /**
             * 大图显示区域
             * @type {Element}
             */
            self.viewer = v;

            // 立刻显示大图区域
            self._setViewerRegion();

            // 大图加载完毕后更新显示区域
            imgOnLoad(bigImage, function() {
                self._finishBigLoading();

                if (!self._isInner) self._bigImageSize = getSize(bigImage);
                self._setViewerRegion();

                // 加载完立刻定位到鼠标位置
                if (!self._isInner) self._onMouseMove();
            });

            self.fire(EVENT_VIEWER_INIT);
        },

        /**
         * 创建镜片
         * @private
         */
        _renderLens: function() {
            var self = this, config = self.config,
                lens = createAbsElem(CLS_LENS);

            DOM.hide(lens);
            doc.body.appendChild(lens);
            /**
             * 镜片元素
             * @type {Element}
             */
            self.lens = lens;
        },

        /**
         * 设置放大区域的位置及宽高
         * @private
         */
        _setViewerRegion: function() {
            var self = this, config = self.config,
                v = self.viewer,
                region = self._imgRegion,
                alignToRegion = self._alignToRegion || region,
                zoomSize = config.zoomSize,
                left, top, lensWidth, lensHeight, width, height,
                bigImageSize = self._bigImageSize;

            width = zoomSize[0];
            if (width === AUTO) width = region.width;
            height = zoomSize[1];
            if (height === AUTO) height = region.height;

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            lensWidth = min(round(width * region.width / bigImageSize.width), region.width);
            lensHeight = min(round(height * region.height / bigImageSize.height), region.height);
            // 镜片宽高, 随大图宽高变化而变化
            self._lensSize = [lensWidth, lensHeight];

            if (!self._isInner) setWidthHeight(self.lens, lensWidth, lensHeight);

            // 计算不同 position
            left = alignToRegion.left + (config.offset[0] || 0);
            top = alignToRegion.top + (config.offset[1] || 0);
            switch (config.position) {
                // top
                case POSITION[0]:
                    top -= height;
                    break;
                // right
                case POSITION[1]:
                    left += alignToRegion.width;
                    break;
                // bottom
                case POSITION[2]:
                    top += alignToRegion.height;
                    break;
                // left
                case POSITION[3]:
                    left -= width;
                    break;
                // inner
                case POSITION[4]:
                    width = region.width;
                    height = region.height;
                    break;
            }

            DOM.offset(v, { left: left, top: top });
            setWidthHeight(v, width, height);
        },

        /**
         * 鼠标移动时, 更新放大区域的显示
         * @private
         */
        _onMouseMove: function() {
            var self = this,
                lens = self.lens, ev = self._ev,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                bigImageSize = self._bigImageSize, lensOffset;

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {

                // 动画时阻止移动
                if (self._isInner && self._animTimer) return;

                lensOffset = self._getLensOffset();

                // 更新 lens 位置
                if (!self._isInner && lens) DOM.offset(lens, lensOffset);

                // 设置大图偏移
                DOM.css([self._bigImageCopy, self.bigImage], {
                    left: - round((lensOffset.left - rl) * bigImageSize.width / rw),
                    top: - round((lensOffset.top - rt) * bigImageSize.height / rh)
                });
            } else {
                self.hide();
            }
        },

        /**
         * 随着鼠标移动, 获取镜片位置
         * @private
         */
        _getLensOffset: function() {
            var self = this,
                region = self._imgRegion, ev = self._ev,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                lensSize = self._lensSize,
                lensW = lensSize[0], lensH = lensSize[1],
                lensLeft = ev.pageX - lensW / 2,
                lensTop = ev.pageY - lensH / 2;

            if (lensLeft <= rl) {
                lensLeft = rl;
            } else if (lensLeft >= rw + rl - lensW) {
                lensLeft = rw + rl - lensW;
            }

            if (lensTop <= rt) {
                lensTop = rt;
            } else if (lensTop >= rh + rt - lensH) {
                lensTop = rh + rt - lensH;
            }
            return { left: lensLeft, top: lensTop };
        },

        /**
         * Inner 效果中的放大动画
         * @param {number} seconds
         * @param {number} times
         * @private
         */
        _anim: function(seconds, times) {
            var self = this,
                go, t = 1,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                img = [self.bigImage, self._bigImageCopy],
                bigImageSize = self._bigImageSize,
                lensOffset = self._getLensOffset(),
                max_left = - round((lensOffset.left - rl) * bigImageSize.width / rw),
                max_top = - round((lensOffset.top - rt) * bigImageSize.height / rh);

            if (self._animTimer) self._animTimer.cancel();

            // set min width and height
            setWidthHeight(img, rw, rh);
            self._animTimer = S.later((go = function() {
                setWidthHeight(img, rw + (bigImageSize.width - rw) / times * t, rh + (bigImageSize.height - rh) / times * t);
                // 定位到鼠标点
                DOM.css(img, {
                    left: max_left / times * t,    //max(min(round( rw / 2 - x * tmpW / rw ), 0), rw - tmpW),
                    top: max_top / times * t       //max(min(round( rh / 2 - y * tmpH / rh ), 0), rh - tmpH)
                });

                if (++t > times) {
                    self._animTimer.cancel();
                    self._animTimer = undefined;
                }
            }), seconds * 1000 / times, true);

            go();
        },

        /**
         * 显示放大区域
         */
        show: function() {
            var self = this,
                lens = self.lens, viewer = self.viewer,
                bigImageSrc = self.get(BIGIMAGESRC);

            DOM.hide(self.lensIcon);
            if (self._isInner) {
                DOM.show(viewer);
                self._anim(0.4, 60);
            } else {
                DOM.show([lens, viewer]);
                self._onMouseMove();
            }

            if (self._refresh) {
                self._setViewerRegion();
                self._refresh = false;
            }

            // 先 show 再替换 src, 是因为需要更新 viewer 位置, 当 display:none 时, DOM.offset 错误
            if (self._cacheBigImageSrc && (self._cacheBigImageSrc !== bigImageSrc)) {
                DOM.attr(self.bigImage, SRC, bigImageSrc);
                self._cacheBigImageSrc = bigImageSrc;
                if (self._isInner) DOM.attr(self._bigImageCopy, SRC, DOM.attr(self.image, SRC));
                !self.bigImage.complete && self._startBigLoading();
            }

            Event.on(doc.body, MOUSEMOVE, self._onMouseMove, self);

            self.fire(EVENT_SHOW);
        },

        /**
         * 隐藏放大区域
         */
        hide: function() {
            var self = this;

            DOM.hide([self.lens, self.viewer]);
            DOM.show(self.lensIcon);

            Event.remove(doc.body, MOUSEMOVE, self._onMouseMove, self);

            self.fire(EVENT_HIDE);
        },

        /**
         * 小图加载开始
         * @private
         */
        _startLoading: function() {
            this.fire(EVENT_LOAD_START);
        },

         /**
         * 小图加载结束
         * @private
         */
        _finishLoading: function() {
            this.fire(EVENT_LOAD_END);
        },

        /**
         * 大图加载开始
         * @private
         */
        _startBigLoading: function() {
            DOM.addClass(this.viewer, CLS_LOADING);
            this.fire(EVENT_LOAD_BIG_START);
        },

        /**
         * 大图加载结束
         * @private
         */
        _finishBigLoading: function() {
            DOM.removeClass(this.viewer, CLS_LOADING);
            this.fire(EVENT_LOAD_BIG_END);
        },

        /**
         * 改变小图元素的 src
         * @param {String} src
         */
        changeImageSrc: function(src) {
            var self = this;
            DOM.attr(self.image, SRC, src);
            self._startLoading();
        },

        /**
         * 调整放大区域位置, 在外部改变小图位置时, 需要对应更新放大区域的位置
         */
        refreshRegion: function() {
            this._getAlignTo();
            this._renderUI();

            // 更新位置标志
            this._refresh = true;
        }
    });

    S.ImageZoom = ImageZoom;

    function imgOnLoad(img, callback) {
        if (checkImageReady(img)) {
            callback();
        }
        // 1) 图尚未加载完毕，等待 onload 时再初始化 2) 多图切换时需要绑定load事件来更新相关信息
        Event.on(img, 'load', callback);
    }

    function getSize(elem) {
        return { width: elem.clientWidth, height: elem.clientHeight };
    }

    function createAbsElem(cls) {
        return DOM.create('<div class="' + cls + ABS_STYLE);
    }

    function setWidthHeight(elem, w, h) {
        S.each(S.makeArray(elem), function(e) {
            DOM.width(e, w);
            DOM.height(e, h);
        });
    }

    function checkImageReady(imgElem) {
        return (imgElem && imgElem.complete && imgElem.clientWidth) ? true : false;
    }

    function createImage(s, p) {
        var img = DOM.create('<img src="' + s + ABS_STYLE);
        if (p) p.appendChild(img);
        return img;
    }
}, { requires: ['widget'] } );

/**
 * NOTES:
 *  201006
 *      - 加入 position 选项，动态构建所需 dom
 *      - 小图加载
 *      - 大图加载之后才能显示
 *      - 加入跟随模式
 *      - 0624 去除 yahoo-dom-event 的依赖
 *  201007
 *      - 去除 getStyle, 使用DOM.css()
 *      - 增加 firstHover 事件
 *      - 纠正显示区域位置计算错误
 *      - 调整 DOM 结构，去除不必要的代码
 *  201008
 *      - yubo: refactor to kissy src
 *      - 保留 标准模式+right, 镜片DOM移至body
 *  201009
 *      - 加入 Zazzle 的 follow 效果
 * TODO:
 *      - 仿照 Zazzle 的效果，在大图加载过程中显示进度条和提示文字
 *      - http://www.apple.com/iphone/features/retina-display.html
 *
 */
