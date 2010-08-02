/**
 * 图片放大效果 ImageZoom
 * @creater  qiaohua@taobao.com
 * @depends  ks-core
 */
KISSY.add('imagezoom', function(S, undefined) {

    var DOM = S.DOM, EVENT = S.Event,

        CLS_PREFIX = 'ks-imagezoom-',
        IMGZOOM_ORIGIN_CLS = CLS_PREFIX + 'origin',
        IMGZOOM_VIEWER_CLS = CLS_PREFIX + 'viewer',
        IMGZOOM_LOADING_CLS = CLS_PREFIX + 'loading',
        IMGZOOM_LENS_CLS = CLS_PREFIX + 'lens',
        IMGZOOM_ICON_CLS = CLS_PREFIX + 'icon',

        DIV = '<div>', IMG = '<img>',
        STANDARD = 'standard', FOLLOW = 'follow',
        HEIGHT = 'height', WIDTH = 'width',
        TOP = 'top', LEFT = 'left',
        DISPLAY = 'display',
        RE_IMG_SRC = /^.+\.(jpg|png|gif)$/i,

        /**
         * 默认设置
         */
        defaultConfig = {
            type: STANDARD,            // 显示类型。可选值：follow

            bigImageSrc: '',           // 大图路径，为 '' 时，会先取原图上一级 a 的图片 src
            bigImageSize: [900, 900],  // 大图高宽
            //position: 'right',       // 大图显示位置。仅支持 right, 不开放其它值
            offset: 10,                // 大图位置的偏移量。单一值或 [x, y]
            preload: true,             // 是否预加载大图
            timeout: 120,              // 等待大图加载的最大时间, 单位: s  默认 2 min
            timeoutMsg: '图片暂不可用',

            lensSize: [100, 100],      // 镜片高宽
            lensIcon: true             // 是否显示放大镜提示图标
        };

    /**
     * 图片放大镜组件
     * @class ImageZoom
     * @constructor
     */
    function ImageZoom(img, config) {
        var self = this, p;

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
        // 如果 img 的父级元素是大图链接，直接取之
        if (!config.bigImageSrc) {
            p = DOM.parent(img);
            if (p.src && RE_IMG_SRC.test(p.src)) {
                config.bigImageSrc = p.src;
                self._imageLink = p; // 保存起来，renderUI 时需要用
            }
        }

        /**
         * 小图外层
         * @type HTMLElement
         */
        //self.origin = null;

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
            // 预加载大图
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
                img = self._imageLink || self.image,
                origin, lens, size, icon;

            // 构建小图外层
            origin = DOM.create(DIV, { 'class': IMGZOOM_ORIGIN_CLS });
            DOM.parent(img).insertBefore(origin, img);
            origin.appendChild(img);
            self.origin = origin;

            // 标准模式，添加镜片
            if (cfg.type === STANDARD) {
                size = cfg.lensSize;
                lens = DOM.create(DIV, { 'class': IMGZOOM_LENS_CLS });
                DOM.css(lens, WIDTH, size[0]);
                DOM.css(lens, HEIGHT, size[1]);
                hide(lens);
                origin.appendChild(lens);
                self.lens = lens;
            }

            // 放大镜图标
            if (cfg.lensIcon) {
                icon = DOM.create(DIV, { 'class': IMGZOOM_ICON_CLS });
                origin.appendChild(icon);
                self.lensIcon = icon;
            }
        },

        _bindUI: function() {
            var self = this, cfg = self.config,
                lens = self.lens, lensIcon = self.lensIcon,
                viewer = self.viewer;

            EVENT.on(self.origin, 'mouseenter', function(ev) {
                show(lens);
                hide(lensIcon);

                if (!viewer) {
                    self._createViewer(ev);
                    //self.fire('firstHover'); // 暂时不暴露该事件，等有真实需求时，再开启
                } else {
                    show(viewer);
                }
            });

            EVENT.on(self.origin, 'mouseleave', function() {
                hide(lens);
                show(lensIcon);
                hide(viewer);
            });
        },

        _createViewer: function(ev) {
            var self = this, cfg = self.config, v, bImg, p, timer;

            // 创建 viewer 的 DOM 结构
            v = DOM.create(DIV, { 'class': IMGZOOM_VIEWER_CLS + ' ' + IMGZOOM_LOADING_CLS });
            bImg = DOM.create(IMG, { src: cfg.bigImageSrc });
            v.appendChild(bImg);

            // 将 viewer 添加到 DOM 树中
            p = cfg.type === FOLLOW ? self.origin : DOM.get('body');
            p.appendChild(v);

            // 添加引用到 self
            self.bigImage = bImg;
            self.viewer = v;

            self._updateViewer(ev, false);
            self._zoom();

            // 大图加载完毕后更新显示区域
            imgOnLoad(bImg, function() {
                self._updateViewer(ev, true);
            });

            // 设置大图加载的超时定时器
            if (!bImg.complete) {
                timer = S.later(function() {
                    if (!bImg.complete) self._showTimeoutMsg();
                    timer.cancel();
                }, cfg.timeout * 1000);
            }
        },

        /**
         * 设置放大图片显示的偏移量
         */
        _zoom: function() {
            var self = this,
                cfg = self.config,
                g = self.glass,
                v = self.viewer;
            /**
             * 移动鼠标时更新大图偏移量
             */
            EVENT.on(self.origin, 'mousemove', function(ev) {
                // 镜片偏移量并更新
                var glassOffset = self.getGlassOffset(ev);
                if (g) {
                    DOM.css(g, LEFT, glassOffset.left + 'px');
                    DOM.css(g, TOP, glassOffset.top + 'px');
                }
                // 计算大图偏移量并更新
                var imageSize = self.getSize(self.image),
                    zoom = self.getSize(self.bigImage),
                    i = 0,
                    j = 0,
                    scrollx = Math.round(glassOffset.left * zoom.width / imageSize.width),
                    scrolly = Math.round(glassOffset.top * zoom.height / imageSize.height);
                if (TYPE[2] == cfg.type) {
                    var glassSize = self.getSize(g);
                    i = glassSize.width / 2;
                    j = glassSize.height / 2
                }
                v.scrollLeft = scrollx + i;
                v.scrollTop = scrolly + j;

                // 跟随模式下更新显示区域位置
                if (TYPE[2] == cfg.type) {
                    DOM.css(v, LEFT, glassOffset.left + 'px');
                    DOM.css(v, TOP, glassOffset.top + 'px');
                }
            });
        },

        /**
         * 更新显示区域大小及位置
         */
        _updateViewer: function(ev, ready) {
            var self = this;
            if (ready) {
                if (self.timer) clearTimeout(self.timer);
                self.hideMsg();
            }
            var i = self.image,
                v = self.viewer,
                cfg = self.config,
                imageOffset = DOM.offset(i),
                glassSize = self.getSize(self.glass);


            // 计算显示区域位置
            var leftPos, topPos, vHeight, vWidth;
            if (TYPE[2] == cfg.type) {
                // 跟随模式下, 设置显示区域初始位置
                var mousePoint = self.getMousePoint(ev),
                    cursorX = mousePoint.x - imageOffset.left,
                    cursorY = mousePoint.y - imageOffset.top;
                topPos = cursorX - glassSize.width / 2;
                leftPos = cursorY - glassSize.height / 2;
                // 跟随模式下, 显示区域宽高度由用户设定的glass宽高度决定
                vHeight = glassSize.height;
                vWidth = glassSize.width;
            } else {
                // 区域显示在不同位置上计算left和top值
                var bigImageSize,
                    imageSize = self.getSize(i),
                    o = self.origin,
                    btw = parseInt(DOM.css(v, 'borderTopWidth')),
                    blw = parseInt(DOM.css(v, 'borderLeftWidth'));
                if (!ready) {
                    bigImageSize = cfg.bigImageSize;
                } else {
                    bigImageSize = self.getSize(self.bigImage);
                }

                // 其他模式下, 显示区域宽高度由大小图的比例来定
                vHeight = Math.round(bigImageSize.height * glassSize.height / imageSize.height);
                vWidth = Math.round(bigImageSize.width * glassSize.width / imageSize.width);

                if (POSITION[0] == cfg.position) {
                    var mt = parseInt(DOM.css(o, 'marginTop'));
                    if (!mt) mt = 0;
                    topPos = imageOffset.top - vHeight - btw - cfg.offset + mt;
                    leftPos = imageOffset.left;
                } else if (POSITION[2] == cfg.position) {
                    topPos = imageSize.height + imageOffset.top + cfg.offset;
                    leftPos = imageOffset.left;
                } else if (POSITION[3] == cfg.position) {
                    var ml = parseInt(DOM.css(o, 'marginLeft'));
                    if (!ml) ml = 0;
                    topPos = imageOffset.top;
                    leftPos = imageOffset.left - vWidth - blw - cfg.offset + ml;
                } else {
                    topPos = imageOffset.top;
                    leftPos = imageOffset.left + imageSize.width + cfg.offset;
                }
            }
            DOM.css(v, HEIGHT, vHeight + 'px');
            DOM.css(v, WIDTH, vWidth + 'px');
            DOM.offset(v, { left: leftPos, top: topPos });
        },

        /**
         * 获取镜片的偏移量
         * @param ev    触发的事件
         * @return  offset 镜片在放大目标元素上的横纵向位置
         */
        getGlassOffset: function(ev) {
            var self = this,
                img = self.image,
                offset = {
                    left: 0,
                    top: 0
                };
            // 小图偏移量
            var imageOffset = DOM.offset(img);
            // 鼠标在页面上的位置
            var mousePoint = self.getMousePoint(ev);
            // 镜片实际尺寸
            var glassSize = self.getSize(self.glass);
            // 小图实际尺寸
            var imageSize = self.getSize(img);
            // 光标横向位置
            var cursorX = mousePoint.x - imageOffset.left;
            // 镜片横向偏移量
            offset.left = cursorX - glassSize.width / 2;
            var i = 0,
                j = 0;
            // 跟随模式下, 偏移限制不同
            if (TYPE[2] == self.config.type) {
                i = glassSize.width / 2;
                j = glassSize.height / 2;
            }
            if (offset.left < -i) {
                offset.left = 0;
            } else if (offset.left > imageSize.width - glassSize.width + i) {
                offset.left = imageSize.width - glassSize.width;
            }
            // 光标纵向位置
            var cursorY = mousePoint.y - imageOffset.top;
            // 镜片纵向偏移量
            offset.top = cursorY - glassSize.height / 2;
            if (offset.top < -j) {
                offset.top = 0;
            } else if (offset.top > imageSize.height - glassSize.height + j) {
                offset.top = imageSize.height - glassSize.height;
            }
            return offset;
        },

        /**
         * 获取元素的宽高度(不包括边线和滚动条)
         */
        getSize: function(elm) {
            if (!elm) return this.config.glassSize;
            return {
                width: elm.clientWidth,
                height: elm.clientHeight
            };
        },

        /**
         * 获取鼠标在页面上的位置
         * @param ev        触发事件
         * @return offset   鼠标在页面上的横纵向位置
         */
        getMousePoint: function(ev) {
            return {x: ev.pageX, y: ev.pageY}
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
                DOM.removeClass(v, IMGZOOM_LOADING_CLS);
            }

            DOM.html(p, cfg.timeoutMsg);
        },
        
        hideMsg: function() {
            var b = S.get('b', this.viewer);
            DOM.html(b, '');
            DOM.addClass(this.viewer, IMGZOOM_LOADING_CLS);
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
        if(elem) DOM.css(elem, DISPLAY, 'none');
    }

    function show(elem) {
        if(elem) DOM.css(elem, DISPLAY, '');
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
 *  TODO:
 *      - 加入 Zazzle 的 follow 效果
 *      - 仿照 Zazzle 的效果，在大图加载过程中显示进度条和提示文字
 */
