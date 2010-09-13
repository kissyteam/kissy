/**
 * 图片放大效果 ImageZoom
 * @creater  qiaohua@taobao.com
 */
KISSY.add('imagezoom', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,

        KS_HIDE_CLS = 'ks-hidden',
        CLS_PREFIX = 'ks-imagezoom-',
        CLS_VIEWER = CLS_PREFIX + 'viewer',
        CLS_LENS = CLS_PREFIX + 'lens',
        CLS_ICON = CLS_PREFIX + 'icon',

        DIV = '<div>', IMG = '<img>',
        STANDARD = 'standard', FOLLOW = 'follow',
        HEIGHT = 'height', WIDTH = 'width',
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
     *   - this.config      配置参数   @type Object
     *   - this.lens        镜片      @type HTMLElement
     *   - this.lensIcon    放大镜图标 @type HTMLElement
     *   - this.bigImage    大图      @type HTMLElement
     */
    function ImageZoom(img, config) {
        var self = this, tmp;

        if (!(self instanceof ImageZoom)) {
            return new ImageZoom(img, config);
        }

        self.image = img = S.get(img);
        if (!img) return;

        self.config = config = S.merge(defaultConfig, config);
        if (!config.bigImageSrc) {
            tmp = DOM.attr(img, 'data-src');
            if (tmp && RE_IMG_SRC.test(tmp)) config.bigImageSrc = tmp;
        }
        // 支持 [x, y] or x  <-- 只考虑 position 为 right
        config.offset = S.makeArray(config.offset);

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
            var self = this,
                img = self.image,
                cfg = self.config;

            /**
             * 小图宽高及位置, 用到多次, 先保存起来
             */
            self.imgSize = S.merge(DOM.offset(img), getSize(img));
            
            // 标准模式，添加镜片
            //if (cfg.type === STANDARD) {
            self._renderLens();
            // 放大镜图标
            if (cfg.lensIcon) self._renderIcon();
            
        },

        _renderLens: function() {
            var self = this,
                lens = DOM.create(DIV, { 'class': CLS_LENS }),
                cfg = self.config;
            DOM.width(lens, cfg.lensSize[0]);
            DOM.height(lens, cfg.lensSize[1]);
            document.body.appendChild(lens);
            self.lens = lens;
            // 添加之后先隐藏起来
            hide(lens);
        },

        _renderIcon: function() {
            var self = this,
                is = self.imgSize,
                icon = DOM.create(DIV, { 'class': CLS_ICON });
            document.body.appendChild(icon);
            
            DOM.offset(icon, {
                left: is.left + is.width - DOM.width(icon),
                top: is.top + is.height - DOM.height(icon)
            });
            self.lensIcon = icon;
        },
        
        _bindUI: function() {
            var self = this,
                timer;

            Event.on(self.image, 'mouseenter', function(ev) {
                timer = S.later(function(){
                    if (!self.viewer) self._createViewer();
                    self.show();
                    timer.cancel();
                }, 100);
            });
            Event.on(self.image, 'mouseleave', function(){
                if (timer) timer.cancel();
            });
        },

        _createViewer: function() {
            var self = this, cfg = self.config, v, bImg, timer;

            // 创建 viewer 的 DOM 结构
            v = DOM.create(DIV, { 'class': CLS_VIEWER });
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
            self._setViewerRegion();
        },

        _setViewerRegion: function() {
            var self = this, cfg = self.config,
                v = self.viewer,
                is = self.imgSize,
                lensSize = cfg.lensSize,
                left, top, width, height,
                bigImage = self.bigImage, bigImageSize;

            // 标准模式
            bigImageSize = bigImage ? {width:cfg.bigImageSize[0], height: cfg.bigImageSize[1]} : getSize(bigImage);
            
            // vH / bigImageH = lensH / imageH
            height = round(bigImageSize.height * lensSize[1] / is.height);
            width = round(bigImageSize.width * lensSize[0] / is.width);
            
            // 只考虑 position 为 right 的情形
            if (bigImage) {
                left = is.left + is.width + (cfg.offset[0]||0);
                top = is.top + (cfg.offset[1]||0);
            }
            
            // set it
            if (width) {
                DOM.width(v, width);
                DOM.height(v, height);
            }
            if (left !== undefined) DOM.offset(v, { left: left, top: top });
        },

        _onMouseMove: function(ev) {
            var self = this,
                is = self.imgSize;
            
            if ( ev.pageX>is.left && ev.pageX<is.left+is.width &&
                ev.pageY>is.top && ev.pageY<is.top+is.height ) {
                var cfg = self.config,
                    viewer = self.viewer, lens = self.lens,
                    is = self.imgSize,
                    lensSize = cfg.lensSize,
                    lensOffset = {
                        left: ev.pageX - lensSize[0]/2,
                        top: ev.pageY - lensSize[1]/2
                    };
                
                if (lensOffset.left <= is.left) lensOffset.left = is.left;
                else if (lensOffset.left >= is.width + is.left - lensSize[0])
                    lensOffset.left = is.width + is.left - lensSize[0];
                
                if (lensOffset.top <= is.top) lensOffset.top = is.top;
                else if (lensOffset.top >= is.height + is.top - lensSize[1])
                    lensOffset.top = is.height + is.top - lensSize[1];
                
                // 更新 lens 位置
                if (lens) DOM.offset(lens, lensOffset);
                
                // 计算大图偏移量
                var bigImgSize = getSize(self.bigImage);
                
                // 设置大图偏移
                viewer.scrollLeft = round((lensOffset.left - is.left) * bigImgSize.width / is.width);
                viewer.scrollTop = round((lensOffset.top - is.top) * bigImgSize.height / is.height);
                
            } else self.hide();
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
        show: function(){
            show(this.lens);
            hide(this.lensIcon);
            show(this.viewer);
            Event.on(document.body, 'mousemove', this._onMouseMove, this);
        },
        hide: function(){
            hide(this.lens);
            show(this.lensIcon);
            hide(this.viewer);
            Event.remove(document.body, 'mousemove', this._onMouseMove, this);
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
        if (elem) DOM.addClass(elem, KS_HIDE_CLS);
    }

    function show(elem) {
        if (elem) DOM.removeClass(elem, KS_HIDE_CLS);
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
 *      - 保留 标准模式+right, 镜片DOM移至body
 *  TODO:
 *      - 加入 Zazzle 的 follow 效果
 *      - 仿照 Zazzle 的效果，在大图加载过程中显示进度条和提示文字
 */
