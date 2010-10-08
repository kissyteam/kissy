/**
 * 图片放大效果 ImageZoom
 * @creater  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('imagezoom', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, Event = S.Event,

        CLS_PREFIX = 'ks-imagezoom-',
        CLS_VIEWER = CLS_PREFIX + 'viewer',
        CLS_LENS = CLS_PREFIX + 'lens',
        CLS_ICON = CLS_PREFIX + 'icon',
        CLS_LOADING = CLS_PREFIX + 'loading',

        DIV = '<div>', IMG = '<img>',
        STANDARD = 'standard',
        RE_IMG_SRC = /^.+\.(?:jpg|png|gif)$/i,
        round = Math.round,
        AUTO = 'auto', LOAD = 'load',
        POSITION = ['top', 'right', 'bottom', 'left', 'inner'],
        SRC = 'src', MOUSEMOVE = 'mousemove',

        /**
         * 默认设置
         */
        defaultConfig = {
            type: STANDARD,            // 显示类型

            bigImageSrc: '',           // 大图路径, 默认为 '', 会取触点上的 data-ks-imagezoom 属性值.
            bigImageSize: [800, 800],  // 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值.
            position: 'right',         // 大图显示位置
            offset: 10,                // 大图位置的偏移量. 单一值或 [x, y]
            preload: true,             // 是否预加载大图

            zoomSize: [AUTO, AUTO],    // 放大区域宽高
            lensIcon: true,            // 是否显示放大镜提示图标

            zoomCls: ''                // 放大区域额外样式
        };

    /**
     * 图片放大镜组件
     * @class ImageZoom
     * @constructor
     * attached members：
     *   - this.image       需要缩放的图片      @type HTMLElement
     *   - this.config      配置参数           @type Object
     *   - this.lens        镜片              @type HTMLElement
     *   - this.lensIcon    放大镜图标         @type HTMLElement
     *   - this.bigImage    大图              @type HTMLElement
     *   - this.viewer      大图显示区域        @type HTMLElement
     */
    function ImageZoom(image, config) {
        var self = this, data;

        if (!(self instanceof ImageZoom)) {
            return new ImageZoom(image, config);
        }

        self.image = image = S.get(image);
        if (!image) return;

        self.config = config = S.merge(defaultConfig, config);

        if (!config.bigImageSrc) {
            data = DOM.attr(image, 'data-ks-imagezoom');
            if (data && RE_IMG_SRC.test(data)) config.bigImageSrc = data;
        }

        // 支持 [x, y] or x
        config.offset = S.makeArray(config.offset);

        // 预加载大图
        if (config.preload) {
            new Image().src = config.bigImageSrc;
        }

        self._isInner = config.position === POSITION[4];

        // 首次加载小图从缓存读取或在绑定load事件之前已经加载完小图时, 不显示 loading
        !image.complete && self._startLoading();
        // 保证非首张小图切换时也能正确隐藏, 不管是否来自缓存
        Event.on(image, LOAD, function(){
            self._finishLoading();
        });

        // 在小图加载完毕时初始化
        imgOnLoad(image, function() {
            if (!self._imgRegion) self._init();
        }, false);
    }

    S.augment(ImageZoom, S.EventTarget, {
        _init: function() {
            this._renderUI();
            this._bindUI();
        },

        _renderUI: function() {
            var self = this, config = self.config,
                image = self.image;

            // 小图宽高及位置, 用到多次, 先保存起来
            self._imgRegion = S.merge(DOM.offset(image), getSize(image));

            // 大图高宽, 默认使用配置信息中, 当加载大图之后, 更新该值
            self._bigImageSize = { width: config.bigImageSize[0], height: config.bigImageSize[1] };

            // 放大镜图标
            if (config.lensIcon) self._renderIcon();
        },

        _renderIcon: function() {
            var self = this,
                region = self._imgRegion,
                icon;

            icon = createAbsElem(CLS_ICON);
            doc.body.appendChild(icon);
            DOM.offset(icon, {
                left: region.left + region.width - DOM.width(icon),
                top: region.top + region.height - DOM.height(icon)
            });
            self.lensIcon = icon;
        },

        _bindUI: function() {
            var self = this, timer, config = self.config;

            Event.on(self.image, 'mouseenter', function(ev) {
                self._getEv(ev);
                Event.on(doc.body, MOUSEMOVE, self._getEv, self);

                timer = S.later(function() {
                    var bigImageSrc = self.config.bigImageSrc;

                    if (!self.viewer) {
                        self._createViewer();
                    }
                    else if (self._cacheBigImageSrc && (self._cacheBigImageSrc !== bigImageSrc)) {
                        // 首张图片标志, 用于判断是否需要更新 viewer 位置
                        self._partical = true;
                        DOM.attr(self.bigImage, SRC, bigImageSrc);
                        self._cacheBigImageSrc = bigImageSrc;
                        if (self._isInner) DOM.attr(self._bigImageCopy, SRC, DOM.attr(self.image, SRC));
                    }
                    self.show();
                }, 300); // 300 是感觉值，不立刻触发，同时要尽量让动画流畅
            });

            Event.on(self.image, 'mouseleave', function() {
                Event.remove(doc.body, MOUSEMOVE, self._getEv);

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            });
        },

        _getEv: function(ev) {
            this._ev = ev;
        },

        _createViewer: function() {
            var self = this, config = self.config,
                v, bigImage, bigImageCopy,
                bigImageSize = self._bigImageSize;

            // 创建 viewer 的 DOM 结构
            v = createAbsElem(CLS_VIEWER + ' ' + config.zoomCls);

            if (self._isInner) {
                bigImageCopy = createImage(DOM.attr(self.image, SRC), v);
                setWidthHeight(bigImageCopy, bigImageSize.width, bigImageSize.height);
                self._bigImageCopy = bigImageCopy;
            }
            // 标准模式，添加镜片
            else self._renderLens();

            if (config.bigImageSrc) {
                bigImage = createImage(config.bigImageSrc, v);
                self.bigImage = bigImage;
            }
            // 将 viewer 添加到 DOM 中
            doc.body.appendChild(v);
            self.viewer = v;

            // 立刻显示大图区域
            self._setViewerRegion();

            // 大图加载完毕后更新显示区域
            imgOnLoad(bigImage, function() {
                if (self._isInner) return;
                
                self._bigImageSize = getSize(bigImage);
                self._setViewerRegion();
                // 加载完立刻定位到鼠标位置
                self._onMouseMove();
            }, true);
        },

        _renderLens: function() {
            var self = this, config = self.config,
                lens = createAbsElem(CLS_LENS);

            DOM.hide(lens);
            doc.body.appendChild(lens);
            self.lens = lens;
        },

        _setViewerRegion: function() {
            var self = this, config = self.config,
                v = self.viewer,
                region = self._imgRegion,
                zoomSize = config.zoomSize,
                left, top, lensWidth, lensHeight, width, height,
                bigImageSize = self._bigImageSize;

            width = zoomSize[0];
            if (width === AUTO) width = region.width;
            height = zoomSize[1];
            if (height === AUTO) height = region.height;

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            lensWidth = round( width * region.width / bigImageSize.width);
            lensHeight = round( height * region.height / bigImageSize.height);
            self._lensSize = [lensWidth, lensHeight];

            if (!self._isInner) setWidthHeight(self.lens, lensWidth, lensHeight);

            if (!self._partical) {
                // 计算不同 position
                left = region.left + (config.offset[0] || 0);
                top = region.top + (config.offset[1] || 0);
                switch (config.position) {
                    // top
                    case POSITION[0]:
                        top -= height;
                        break;
                    // right
                    case POSITION[1]:
                        left += region.width;
                        break;
                    // bottom
                    case POSITION[2]:
                        top += region.height;
                        break;
                    // left
                    case POSITION[3]:
                        left -= width;
                        break;
                    // inner
                    case POSITION[4]:
                        width = region.width;
                        height = region.height;
                        DOM.css(v, 'cursor', 'move');
                        break;
                }

                DOM.offset(v, { left: left, top: top });
                setWidthHeight(v, width, height);
            }
        },

        _onMouseMove: function() {
            var self = this,
                lens = self.lens, ev = self._ev,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                bigImageSize = self._bigImageSize, lensOffset;

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {

                if (self._isInner && self._animTimer) return;

                lensOffset = self._getLensOffset();

                // 更新 lens 位置
                if (!self._isInner && lens) DOM.offset(lens, lensOffset);

                // 设置大图偏移
                DOM.css([self._bigImageCopy, self.bigImage], {
                    marginLeft: - round((lensOffset.left - rl) * bigImageSize.width / rw),
                    marginTop: - round((lensOffset.top - rt) * bigImageSize.height / rh)
                });
            } else {
                self.hide();
            }
        },

        // 获取镜片的位置
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

        _anim: function(seconds, times) {
            var self = this,
                go, t = 1, ev = self._ev,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                img = [self.bigImage, self._bigImageCopy],
                x = ev.pageX - rl, y = ev.pageY - rt, bigImageSize = self._bigImageSize;

            if (self._animTimer) self._animTimer.cancel();

            // set min width and height
            setWidthHeight(img, rw, rh);
            self._animTimer = S.later((go = function () {
                var tmpW = rw + (bigImageSize.width - rw)/times*t,
                    tmpH = rh + (bigImageSize.height - rh)/times*t;

                setWidthHeight(img, tmpW, tmpH);
                // 定位到鼠标点
                DOM.css(img, {
                    marginLeft: Math.max(Math.min(round( rw/2 - x*tmpW/rw ), 0), rw - tmpW),
                    marginTop: Math.max(Math.min(round( rh/2 - y*tmpH/rh ), 0), rh - tmpH)
                });

                if ( ++t > times) {
                    self._animTimer.cancel();
                    self._animTimer = undefined;
                }
            }), seconds*1000/times, true);

            go();
        },

        show: function() {
            var self = this,
                lens = self.lens, viewer = self.viewer;

            DOM.hide(self.lensIcon);
            if (self._isInner) {
                DOM.show(viewer);
                self._anim(0.5, 30);
            } else {
                DOM.show([lens, viewer]);
                self._onMouseMove();
            }

            Event.on(doc.body, MOUSEMOVE, self._onMouseMove, self);
        },

        hide: function() {
            var self = this;

            DOM.hide([self.lens, self.viewer]);
            DOM.show(self.lensIcon);

            Event.remove(doc.body, MOUSEMOVE, self._onMouseMove, self);
        },

        // TODO: use ATTR
        set: function(name, val) {
            var self = this;

            if (name === 'bigImageSrc') {
                if (val && RE_IMG_SRC.test(val)) {
                    self._cacheBigImageSrc = self.config.bigImageSrc;
                    self.config.bigImageSrc = val;
                }
            }
        },

        _startLoading: function() {
            DOM.addClass(this.viewer, CLS_LOADING);
        },

        _finishLoading: function() {
            DOM.removeClass(this.viewer, CLS_LOADING);
        },

        changeImageSrc: function(src) {
            var self = this;
            DOM.attr(self.image, SRC, src);
            self._startLoading();
        }
    });

    S.ImageZoom = ImageZoom;

    function imgOnLoad(img, callback, f) {
        if (checkImageReady(img)) {
            callback();
            if (f) Event.on(img, LOAD, callback);
        }
        // 图尚未加载完毕，等待 onload 时再初始化
        else Event.on(img, LOAD, callback);

    }

    function getSize(elem) {
        return { width: elem.clientWidth, height: elem.clientHeight };
    }

    function createAbsElem(cls) {
        return DOM.create(DIV, { 'class': cls, 'style': 'position:absolute;top:0;left:0' });
    }

    function  setWidthHeight(elem, w, h){
        S.each(S.makeArray(elem), function(e){
            DOM.width(e, w);
            DOM.height(e, h);
        });
    }

    function checkImageReady(imgElem) {
        return (imgElem && imgElem.complete && imgElem.clientWidth) ? true : false;
    }

    function createImage(s, p) {
        var img = DOM.create('<img src="'+s+'" style="position:absolute;top:0;left:0" >');
        //var img = DOM.create(IMG, { 'src': s, 'style': 'position:absolute;top:0;left:0' });
        if (p) p.appendChild(img);
        return img;
    }
});

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
 */
