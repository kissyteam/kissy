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
        round = Math.round, max = Math.max,
        AUTO = 'auto', LOAD = 'load',
        POSITION = ['top', 'right', 'bottom', 'left', 'inner'],
        SRC = 'src', DOT = '.',

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
            timeoutMsg: '图片暂不可用',

            zoomSize: [AUTO, AUTO],    // 放大区域宽高
            lensIcon: true,            // 是否显示放大镜提示图标

            //loader: null,

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
        self._loadingBar = config.loader;
        self._showLoader();
        // 在小图加载完毕时初始化
        imgOnLoad(image, function() {
            if (!self._imgRegion) self._init();
        });
        // 防止从缓存进来的小图, 没有碰到 onload 事件而不能隐藏 load 
        Event.on(image, LOAD, function(){
            self._hideLoader();
        });
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
                timer = S.later(function() {
                    var bigImageSrc = self.config.bigImageSrc,
                        bigImage = self.bigImage;

                    if (!self.viewer) {
                        self._createViewer();
                    }
                    else if (self._cacheBigImageSrc && (self._cacheBigImageSrc !== bigImageSrc)) {
                        DOM.attr(bigImage, SRC, bigImageSrc);
                        self._cacheBigImageSrc = bigImageSrc;
                        if (self._isInner) DOM.attr(self._bigImageCopy, SRC, DOM.attr(self.image, SRC));
                        else {
                            // 更改大图后, 待加载完后, 更新 self._bigImageSize,  self._lensSize
                            self._updateViewerOnLoad(true);
                        }
                    }
                    self.show(ev);
                }, 100);
            });

            Event.on(self.image, 'mouseleave', function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            });
        },

        _createViewer: function() {
            var self = this, config = self.config, v, bigImage, bigImageCopy;

            // 标准模式，添加镜片
            if (!self._isInner) self._renderLens();

            // 创建 viewer 的 DOM 结构
            v = createAbsElem(CLS_VIEWER + ' ' + config.zoomCls);

            if (self._isInner) {
                bigImageCopy = createImage(DOM.attr(self.image, SRC), v);
                self._bigImageCopy = bigImageCopy;
            }

            if (config.bigImageSrc) {
                bigImage = createImage(config.bigImageSrc, v);
                self.bigImage = bigImage;
            }
            // 将 viewer 添加到 DOM 中
            doc.body.appendChild(v);
            self.viewer = v;

            // 立刻显示大图区域
            self._setViewerRegion();

            if (!self._isInner) self._updateViewerOnLoad();
        },

        _updateViewerOnLoad: function(partical) {
            var self = this, config = self.config,
                bigImage = self.bigImage;

            // 大图加载完毕后更新显示区域
            imgOnLoad(bigImage, function() {
                self._bigImageSize = getSize(bigImage);
                self._setViewerRegion(partical);
            });
        },

        _renderLens: function() {
            var self = this, config = self.config,
                lens = createAbsElem(CLS_LENS);

            DOM.hide(lens);
            doc.body.appendChild(lens);

            self.lens = lens;
        },

        _setViewerRegion: function(partical) {
            var self = this, config = self.config,
                v = self.viewer,
                region = self._imgRegion,
                zoomSize = config.zoomSize,
                left, top, lensWidth, lensHeight, width, height,
                bigImage = self.bigImage,
                bigImageCopy = self._bigImageCopy,
                bigImageSize = self._bigImageSize;

            width = zoomSize[0];
            if (width === AUTO) width = region.width;
            height = zoomSize[1];
            if (height === AUTO) height = region.height;

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            lensWidth = round( width * region.width / bigImageSize.width);
            lensHeight = round( height * region.height / bigImageSize.height);
            self._lensSize = [lensWidth, lensHeight];

            if (!self._isInner) {
                setWidthHeight(self.lens, lensWidth, lensHeight);
                DOM.offset(self.lens, { left: round( region.left + ( region.width - lensWidth ) / 2 ),
                                        top: round( region.top + ( region.height - lensHeight ) / 2 ) });
            } else {
                setWidthHeight(bigImageCopy, bigImageSize.width, bigImageSize.height);
            }

            if (!partical) {
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

        _onMouseMove: function(ev) {
            var self = this,
                lens = self.lens,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                lensOffset;

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {

                if (self._isInner && self._animTimer) return;

                lensOffset = self._getLensOffset(ev);

                // 更新 lens 位置
                if (!self._isInner && lens) DOM.offset(lens, lensOffset);

                // 设置大图偏移
                DOM.css([self._bigImageCopy, self.bigImage], {
                    marginLeft: - round((lensOffset.left - rl) * self._bigImageSize.width / rw),
                    marginTop: - round((lensOffset.top - rt) * self._bigImageSize.height / rh)
                });
            } else {
                self.hide();
            }
        },

        // 获取镜片的位置
        _getLensOffset: function(ev) {
            var self = this,
                region = self._imgRegion,
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

        _anim: function(ev, seconds, times) {
            var self = this,
                go, t = 1,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                img = [self.bigImage, self._bigImageCopy],
                x = ev.pageX - rl, y = ev.pageY - rt;

            if (self._animTimer) self._animTimer.cancel();

            // set min width and height
            setWidthHeight(img, rw, rh);
            self._animTimer = S.later((go = function () {
                var tmpW = rw + (self._bigImageSize.width - rw)/times*t,
                    tmpH = rh + (self._bigImageSize.height - rh)/times*t;

                setWidthHeight(img, tmpW, tmpH);
                // 定位到鼠标点
                DOM.css(img, {
                    marginLeft: round( x - x*tmpW/rw),
                    marginTop: round(y - y*tmpH/rh)
                });

                if ( ++t > times) {
                    self._animTimer.cancel();
                    self._animTimer = undefined;
                }
            }), seconds*1000/times, true);

            go();
        },

        show: function(ev) {
            var self = this,
                lens = self.lens;

            DOM.hide(self.lensIcon);
            if (self._isInner) {
                DOM.show(self.viewer);
                self._anim(ev, 0.5, 30);
            } else {
                DOM.show([lens, self.viewer]);
                if (lens) DOM.offset(lens, self._getLensOffset(ev));
            }

            Event.on(doc.body, 'mousemove', self._onMouseMove, self);
        },

        hide: function() {
            var self = this;

            DOM.hide([self.lens, self.viewer]);
            DOM.show(self.lensIcon);

            Event.remove(doc.body, 'mousemove', self._onMouseMove, self);
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

        _showLoader: function(){
            DOM.show(this._loadingBar);
        },
        _hideLoader: function() {
            DOM.hide(this._loadingBar);
        },
        changeImageSrc: function(src) {
            var self = this;
            DOM.attr(self.image, SRC, src);
            self._showLoader();
        }
    });

    S.ImageZoom = ImageZoom;

    function imgOnLoad(img, callback) {
        if (checkImageReady(img)) {
            callback();
        }
        // 图尚未加载完毕，等待 onload 时再初始化
        else {
            Event.on(img, LOAD, callback);
        }
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
        if (imgElem && imgElem.complete && imgElem.clientWidth) return true;
        return false;
    }

    function createImage(s, p) {
        var img = DOM.create(IMG, { 'src': s, 'style': 'position:absolute;top:0;left:0' });
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
