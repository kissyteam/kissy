/**
 * 图片放大效果 ImageZoom
 * @creater  qiaohua@taobao.com
 */
KISSY.add('imagezoom', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,

        CLS_PREFIX = 'ks-imagezoom-',
        IMGZOOM_CONTAINER_CLS = CLS_PREFIX + 'container',
        IMGZOOM_VIEWER_CLS = CLS_PREFIX + 'viewer',
        IMGZOOM_LENS_CLS = CLS_PREFIX + 'lens',
        IMGZOOM_ICON_CLS = CLS_PREFIX + 'icon',

        DIV = '<div>', IMG = '<img>',
        STANDARD = 'standard', FOLLOW = 'follow',
        HEIGHT = 'height', WIDTH = 'width',
        DISPLAY = 'display',
        RE_IMG_SRC = /^.+\.(jpg|png|gif)$/i,
        round = Math.round,

        /**
         * 默认设置
         */
        defaultConfig = {
            type: STANDARD,            // 显示类型

            bigImageSrc: '',           // 大图路径，为 '' 时，会先取原图上一级 a 的图片 src
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
     */
    function ImageZoom(img, config) {
        var self = this, tmp;

        if (!(self instanceof ImageZoom)) {
            return new ImageZoom(img, config);
        }

        /**
         * 需要缩放的图片
         * @type HTMLElement
         */
        self.image = img = S.get(img);
        if (!img) return;

        /**
         * 配置参数
         * @type Object
         */
        self.config = config = S.merge(defaultConfig, config);

        // 保存 img 的容器
        self.container = DOM.parent(self.image);
        DOM.addClass(self.container, IMGZOOM_CONTAINER_CLS);
        if (self.container.nodeName.toLowerCase() === 'a') self.container = DOM.parent(self.container);
        
        if (!config.bigImageSrc) {
            tmp = DOM.attr(self.container, 'data-src');
            if (tmp && RE_IMG_SRC.test(tmp)) config.bigImageSrc = tmp;
        }

        // 支持 [x, y] or x  <-- 只考虑 position 为 right
        config.offset = S.makeArray(config.offset);

        /**
         * 镜片
         * @type HTMLElement
         */
        //self.lens = null;

        /**
         * 放大镜图标
         * @type HTMLElement
         */
        //self.lensIcon = null;

        /**
         * 大图外层
         * @type HTMLElement
         */
        //self.viewer = null;

        /**
         * 大图
         * @type HTMLElement
         */
        //self.bigImage = null;

        // 预加载大图
        if (config.preload) {
            new Image().src = config.bigImageSrc;
        }

        // 在小图加载完毕时初始化
        imgOnLoad(img, function() {
            self._init();
        });
    }

    S.augment(ImageZoom, S.EventTarget, {
        _init: function() {
            this._renderUI();
            this._bindUI();
        },

        _renderUI: function() {
            var self = this, cfg = self.config,
                img = self.image,
                lens, icon;

            // 标准模式，添加镜片
            //if (cfg.type === STANDARD) {
            lens = DOM.create(DIV, { 'class': IMGZOOM_LENS_CLS });
            DOM.css(lens, { width: cfg.lensSize[0], height: cfg.lensSize[1] });
            hide(lens);
            document.body.appendChild(lens);
            self.lens = lens;

            // 放大镜图标
            if (cfg.lensIcon) {
                icon = DOM.create(DIV, { 'class': IMGZOOM_ICON_CLS });
                self.container.appendChild(icon);
                self.lensIcon = icon;
            }
        },

        _bindUI: function() {
            var self = this, cfg = self.config,
                lens = self.lens, lensIcon = self.lensIcon,
                lensSize = cfg.lensSize;

            self.imgOffset = DOM.offset(self.image);
            self.imgSize = getSize(self.image);
            
            Event.on(self.image, 'mouseenter', function(ev) {
                show(lens);
                hide(lensIcon);

                if (!self.viewer) {
                    self._createViewer({ x: ev.pageX, y: ev.pageY });
                    //self.fire('firstHover'); // 暂时不暴露该事件，等有真实需求时，再开启
                } else {
                    show(self.viewer);
                }
            });

            Event.on(document.body, 'mousemove', function(ev) {
                if (ev.pageX>self.imgOffset.left&&ev.pageX<self.imgOffset.left+self.imgSize.width&&ev.pageY>self.imgOffset.top&&ev.pageY<self.imgOffset.top+self.imgSize.height) {
                    self._onMouseMove({ x: ev.pageX, y: ev.pageY });
                } else {
                    hide(lens);
                    show(lensIcon);
                    hide(self.viewer);
                }
            });

            /*Event.on(self.image, 'mouseleave', function() {
                hide(lens);
                show(lensIcon);
                hide(self.viewer);
            });*/
        },

        _createViewer: function(cursorXY) {
            var self = this, cfg = self.config, v, bImg, timer;

            // 创建 viewer 的 DOM 结构
            v = DOM.create(DIV, { 'class': IMGZOOM_VIEWER_CLS });
            bImg = DOM.create(IMG, { src: cfg.bigImageSrc });
            v.appendChild(bImg);

            // 将 viewer 添加到 DOM 中
            document.body.appendChild(v);

            // 添加引用
            self.bigImage = bImg;
            self.viewer = v;

            if (!bImg.complete) {
                // 设置大图加载的超时定时器
                timer = S.later(function() {
                    if (!bImg.complete) self._showTimeoutMsg();
                    timer.cancel();
                }, cfg.timeout * 1000);

                // 大图加载完毕后更新显示区域
                imgOnLoad(bImg, function() {
                    if (timer) timer.cancel();
                    self._setViewerRegion();
                });
            }

            // 立刻显示大图区域
            self._setViewerRegion(cursorXY);
        },

        _setViewerRegion: function(cursorXY) {
            var self = this, cfg = self.config,
                img = self.image, v = self.viewer,
                imgOffset = DOM.offset(img),
                imgSize = self.imgSize,
                lensSize = cfg.lensSize,
                left, top, width, height,
                firstShow = !!cursorXY,
                bigImage = self.bigImage, bigImageSize;

            // 标准模式
            bigImageSize = firstShow ? {width:cfg.bigImageSize[0], height: cfg.bigImageSize[1]} : getSize(bigImage);
            
            // vH / bigImageH = lensH / imageH
            height = round(bigImageSize.height * lensSize[1] / imgSize.height);
            width = round(bigImageSize.width * lensSize[0] / imgSize.width);
            
            // 只考虑 position 为 right 的情形
            if (firstShow) {
                left = imgOffset.left + imgSize.width + (cfg.offset[0]||0);
                top = imgOffset.top + (cfg.offset[1]||0);
            }
            
            // set it
            if (width) DOM.css(v, { width: width, height: height });
            if (left !== undefined) DOM.offset(v, { left: left, top: top });
        },

        _onMouseMove: function(cursorXY) {
            var self = this, cfg = self.config,
                img = self.image, viewer = self.viewer, lens = self.lens,
                imgSize = self.imgSize,
                lensSize = cfg.lensSize,
                imgOffset = DOM.offset(img),
                lensOffset = {
                    left: cursorXY.x - lensSize[0]/2,
                    top: cursorXY.y - lensSize[1]/2
                };

            if (lensOffset.left <= imgOffset.left) {
                lensOffset.left = imgOffset.left;
            } else if (lensOffset.left >= imgSize.width + imgOffset.left - lensSize[0]) {
                lensOffset.left = imgSize.width + imgOffset.left - lensSize[0];
            }
            
            if (lensOffset.top <= imgOffset.top) {
                lensOffset.top = imgOffset.top;
            } else if (lensOffset.top >= imgSize.height + imgOffset.top - lensSize[1]) {
                lensOffset.top = imgSize.height + imgOffset.top - lensSize[1];
            }
            
            // 更新 lens 位置
            if (lens) DOM.offset(lens, lensOffset);
            
            // 计算大图偏移量
            var bigImgSize = getSize(self.bigImage);

            // 设置大图偏移
            viewer.scrollLeft = round((lensOffset.left - imgOffset.left) * bigImgSize.width / imgSize.width);
            viewer.scrollTop = round((lensOffset.top - imgOffset.top) * bigImgSize.height / imgSize.height);
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

    function hide(elem) {
        if (elem) DOM.css(elem, DISPLAY, 'none');
    }

    function show(elem) {
        if (elem) DOM.css(elem, DISPLAY, '');
    }

    function getSize(elem) {
        return { width: elem.clientWidth, height: elem.clientHeight };
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
 *      - 保留 标准模式+right, 镜片DOM移至
 *  TODO:
 *      - 加入 Zazzle 的 follow 效果
 *      - 仿照 Zazzle 的效果，在大图加载过程中显示进度条和提示文字
 */
