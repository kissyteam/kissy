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

        /**
         * 默认设置
         */
        defaultConfig = {
            type: STANDARD,            // 显示类型

            bigImageSrc: '',           // 大图路径，为 '' 时，会取 data-src
            bigImageSize: [900, 900],  // 大图高宽
            //position: 'right',       // 大图显示位置。仅支持 right, 不开放其它值
            offset: 10,                // 大图位置的偏移量。单一值或 [x, y]
            preload: true,             // 是否预加载大图
            timeout: 120,              // 等待大图加载的最大时间, 单位: s  默认 2 min
            timeoutMsg: '图片暂不可用',

            lensSize: [200, 200],      // 镜片高宽
            lensIcon: true             // 是否显示放大镜提示图标
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

        // 支持 [x, y] or x  <-- 只考虑 position 为 right
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
            self.imgRegion = S.merge(DOM.offset(image), getSize(image));

            // 标准模式，添加镜片
            self._renderLens();

            // 放大镜图标
            if (config.lensIcon) self._renderIcon();

        },

        _renderLens: function() {
            var self = this, config = self.config,
                lens = createAbsElem(CLS_LENS);

            DOM.width(lens, config.lensSize[0]);
            DOM.height(lens, config.lensSize[1]);

            DOM.hide(lens);
            doc.body.appendChild(lens);

            self.lens = lens;
        },

        _renderIcon: function() {
            var self = this,
                region = self.imgRegion,
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
                    if (!self.viewer) self._createViewer();
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
            var self = this, cfg = self.config, v, bImg, timer;

            // 创建 viewer 的 DOM 结构
            v = createAbsElem(CLS_VIEWER);
            bImg = DOM.create(IMG, { src: cfg.bigImageSrc });
            v.appendChild(bImg);

            // 将 viewer 添加到 DOM 中
            doc.body.appendChild(v);

            // 添加引用
            self.bigImage = bImg;
            self.viewer = v;

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

            // 立刻显示大图区域
            self._setViewerRegion();
        },

        _setViewerRegion: function() {
            var self = this, cfg = self.config,
                v = self.viewer,
                region = self.imgRegion,
                lensSize = cfg.lensSize,
                left, top, width, height,
                bigImage = self.bigImage, bigImageSize;

            // 标准模式
            bigImageSize = bigImage ? {width:cfg.bigImageSize[0], height: cfg.bigImageSize[1]} : getSize(bigImage);

            // vH / bigImageH = lensH / imageH
            height = round(bigImageSize.height * lensSize[1] / region.height);
            width = round(bigImageSize.width * lensSize[0] / region.width);

            // 只考虑 position 为 right 的情形
            if (bigImage) {
                left = region.left + region.width + (cfg.offset[0] || 0);
                top = region.top + (cfg.offset[1] || 0);
            }

            if (width) {
                DOM.width(v, width);
                DOM.height(v, height);
            }
            if (left !== undefined) DOM.offset(v, { left: left, top: top });
        },

        _onMouseMove: function(ev) {
            var self = this, config = self.config,
                viewer = self.viewer, lens = self.lens,
                region = self.imgRegion,
                rl = region.left, rt = region.top,
                rw = region.width, rh = region.height,
                lensSize = config.lensSize,
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

                // 计算大图偏移量
                var bigImgSize = getSize(self.bigImage);

                // 设置大图偏移
                viewer.scrollLeft = round((lensLeft - rl) * bigImgSize.width / rw);
                viewer.scrollTop = round((lensTop - rt) * bigImgSize.height / rh);

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

            DOM.show([self.lens, self.viewer]);
            DOM.hide(self.lensIcon);

            Event.on(doc.body, 'mousemove', self._onMouseMove, self);
        },

        hide: function() {
            var self = this;

            DOM.hide([self.lens, self.viewer]);
            DOM.show(self.lensIcon);

            Event.remove(doc.body, 'mousemove', self._onMouseMove, self);
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
