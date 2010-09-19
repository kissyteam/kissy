/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 19 17:41
*/
/**
 * 图片放大效果 ImageZoom
 * @creater  qiaohua@taobao.com
 */
KISSY.add('imagezoom', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, Event = S.Event,

        CLS_PREFIX = 'ks-imagezoom-',
        CLS_VIEWER = CLS_PREFIX + 'viewer',
        CLS_LENS = CLS_PREFIX + 'lens',
        CLS_ICON = CLS_PREFIX + 'icon',

        DIV = '<div>', IMG = '<img>',
        STANDARD = 'standard',
        RE_IMG_SRC = /^.+\.(jpg|png|gif)$/i,
        round = Math.round,
        AUTO = 'auto',
        POSITION = ['top', 'right', 'bottom', 'left', 'inner'],

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
            timeout: 120,              // 等待大图加载的最大时间, 单位: s  默认 2 min
            timeoutMsg: '图片暂不可用',

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

        // 在小图加载完毕时初始化
        imgOnLoad(image, function() {
            self._init();
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

            // 放大镜图标
            if (config.lensIcon) self._renderIcon();

        },

        _renderIcon: function() {
            var self = this,
                region = self._imgRegion,
                icon = createAbsElem(CLS_ICON);

            doc.body.appendChild(icon);
            DOM.offset(icon, {
                left: region.left + region.width - DOM.width(icon),
                top: region.top + region.height - DOM.height(icon)
            });

            self.lensIcon = icon;
        },

        _bindUI: function() {
            var self = this, timer;

            Event.on(self.image, 'mouseenter', function() {
                timer = S.later(function() {
                    var bigImageSrc = self.config.bigImageSrc;

                    if (!self.viewer) {
                        self._createViewer();
                    }
                    else if (self._cacheBigImageSrc && (self._cacheBigImageSrc !== bigImageSrc)) {
                        DOM.attr(self.bigImage, 'src', bigImageSrc);
                        self._cacheBigImageSrc = bigImageSrc;

                        // 更改大图后, 待加载完后, 更新 self._bigImageSize,  self._lensSize
                        self._updateViewerOnLoad();
                    }
                    self.show();
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
            var self = this, cfg = self.config, v, bImg;

            // 标准模式，添加镜片
            self._renderLens();

            // 创建 viewer 的 DOM 结构
            v = createAbsElem(CLS_VIEWER + ' ' + cfg.zoomCls);
            bImg = DOM.create(IMG, { src: cfg.bigImageSrc });
            v.appendChild(bImg);

            // 将 viewer 添加到 DOM 中
            doc.body.appendChild(v);

            // 添加引用
            self.bigImage = bImg;
            self.viewer = v;

            // 立刻显示大图区域
            self._setViewerRegion();

            self._updateViewerOnLoad();
        },

        _updateViewerOnLoad: function(){
            var self = this, cfg = self.config, timer,
                bImg = self.bigImage;

            if (!bImg.complete) {
                // 设置大图加载的超时定时器
                timer = S.later(function() {
                    if (!bImg.complete) self._showTimeoutMsg();
                    timer = undefined;

                }, cfg.timeout * 1000);

                // 大图加载完毕后更新显示区域
                imgOnLoad(bImg, function() {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }
                    self._setViewerRegion();
                });
            }
        },

        _renderLens: function() {
            var self = this, config = self.config,
                lens = createAbsElem(CLS_LENS);

            DOM.hide(lens);
            doc.body.appendChild(lens);

            self.lens = lens;
        },

        _setViewerRegion: function() {
            var self = this, cfg = self.config,
                v = self.viewer,
                region = self._imgRegion,
                zoomSize = cfg.zoomSize,
                left, top, lensWidth, lensHeight, width, height,
                bigImage = self.bigImage, bigImageSize;

            // 标准模式, 计算大图偏移量
            bigImageSize = bigImage ? {width:cfg.bigImageSize[0], height: cfg.bigImageSize[1]} : getSize(bigImage);
            self._bigImageSize = bigImageSize;

            width = zoomSize[0];
            if (width === AUTO) width = region.width;
            height = zoomSize[1];
            if (height === AUTO) height = region.height;

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            lensWidth = round( width * region.width / bigImageSize.width);
            lensHeight = round( height * region.height / bigImageSize.height);
            self._lensSize = [lensWidth, lensHeight];

            setWidthHeight(self.lens, lensWidth, lensHeight);
            DOM.offset(self.lens, { left: region.left + ( region.width - lensWidth ) / 2,
                                    top: region.top + ( region.height - lensHeight ) / 2 });

            // 计算不同 position
            left = region.left + (cfg.offset[0] || 0);
            top = region.top + (cfg.offset[1] || 0);
            switch (cfg.position) {
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
        },

        _onMouseMove: function(ev) {
            var self = this,
                viewer = self.viewer, lens = self.lens,
                region = self._imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                lensSize = self._lensSize,
                lensLeft, lensTop,
                lensW = lensSize[0], lensH = lensSize[1];

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {

                lensLeft = ev.pageX - lensW / 2;
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

                // 更新 lens 位置
                if (lens) DOM.offset(lens, { left: lensLeft, top: lensTop });

                // 设置大图偏移
                viewer.scrollLeft = round((lensLeft - rl) * self._bigImageSize.width / rw);
                viewer.scrollTop = round((lensTop - rt) * self._bigImageSize.height / rh);

            } else {
                self.hide();
            }
        },

        /**
         * 大图片不可用时显示提示信息
         */
        _showTimeoutMsg: function() {
            var self = this, cfg = self.config,
                v = this.viewer, p = S.get('p', v);

            if (!p) {
                p = DOM.create('<p>');
                v.appendChild(p);
            }

            DOM.html(p, cfg.timeoutMsg);
        },

        show: function() {
            var self = this;

            DOM.show(self.config.position !== POSITION[4] ? [self.lens, self.viewer]: self.viewer);
            DOM.hide(self.lensIcon);

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
        }
    });

    S.ImageZoom = ImageZoom;

    function imgOnLoad(img, callback) {
        if (img.complete) {
            callback();
        }
        // 小图尚未加载完毕，等待 onload 时再初始化
        else {
            Event.on(img, 'load', callback);
        }
    }

    function getSize(elem) {
        return { width: elem.clientWidth, height: elem.clientHeight };
    }

    function createAbsElem(cls) {
        return DOM.create(DIV, { 'class': cls, 'style': 'position:absolute' });
    }

    function  setWidthHeight(elem, w, h){
        DOM.width(elem, w);
        DOM.height(elem, h);
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
 *
 *  TODO:
 *      - 加入 Zazzle 的 follow 效果
 *      - 仿照 Zazzle 的效果，在大图加载过程中显示进度条和提示文字
 *      - http://www.apple.com/iphone/features/retina-display.html
 */
/**
 * auto render
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('autorender', function(S) {

    /**
     * 自动渲染 container 元素内的所有 ImageZoom 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="ImageZoom" data-widget-config="{...}">
     */
    S.ImageZoom.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        S.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;

            if (type === 'ImageZoom') {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new S[type](elem, S.JSON.parse(config));
                }
                catch(ex) {
                    S.log('ImageZoom.autoRender: ' + ex, 'warn');
                }
            }
        });
    }

}, { host: 'imagezoom' } );
