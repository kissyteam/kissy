/**
 * 图片放大效果 ImageZoom
 * @creator     乔花<qiaohua@taobao.com>
 * @date        2010.09.01
 * @version     1.0
 */
KISSY.add('imagezoom', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,

        KS_HIDE_CLS = 'ks-hidden',
        CLS_PREFIX = 'ks-imagezoom-',
        IMGZOOM_VIEWER_CLS = CLS_PREFIX + 'viewer',
        IMGZOOM_LENS_CLS = CLS_PREFIX + 'lens',
        IMGZOOM_ICON_CLS = CLS_PREFIX + 'icon',

        DIV = '<div>', IMG = '<img>',
        STANDARD = 'standard', FOLLOW = 'follow',
        RE_IMG_SRC = /^.+\.(jpg|png|gif)$/i,
        round = Math.round,

        /**
         * 默认设置
         */
        defaultConfig = {
            //type: STANDARD,            // 显示类型

            bigImageSrc: '',           // 大图路径，为 '' 时，会先取原图上一级 a 的图片 src
            bigImageSize: [900, 900],  // 大图高宽
            preload: true,             // 是否预加载大图
            timeout: 120,              // 等待大图加载的最大时间, 单位: s  默认 2 min
            timeoutMsg: '图片暂不可用',

            lensSize: [200, 200],      // 镜片高宽
            lensIcon: true,            // 是否显示放大镜提示图标
            
            containerCls:  IMGZOOM_VIEWER_CLS,
            triggerType: 'mouse',      // Overlay配置参数
            align: {
                node: '', 
                x: 'l', 
                y: 'b', 
                inner: [true, false], 
                offset: 10
            }
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
        
        config = S.merge(defaultConfig, config);
        // 设置大图路径, 默认去取img上的data-src
        if (!config.bigImageSrc) {
            tmp = DOM.attr(img, 'data-src');
            if (tmp && RE_IMG_SRC.test(tmp)) config.bigImageSrc = tmp;
        }
        
        // 预加载大图
        if (config.preload) {
            new Image().src = config.bigImageSrc;
        }
        // 在小图加载完毕时初始化
        imgOnLoad(img, function() {
            self.on('afterInit', function() { 
                /**
                 * 小图宽高及位置, 用到多次, 先保存起来
                 */
                self.imgSize = S.merge(DOM.offset(img), getSize(img));
                // 放大镜图标
                if (config.lensIcon) self._renderIcon();
            });
            ImageZoom.superclass.constructor.call(self, img, config);
        });
    }
    
    S.extend(ImageZoom, S.Overlay);
    S.ImageZoom = ImageZoom;
    
    S.augment(ImageZoom, {
        /**
         * 
         
        _preShow: function() {
            var self = this;
            
            ImageZoom.superclass._preShow.call(self);
            
        },*/
        _extraContent: function(){
            var self = this, bImg, cfg = self.config, timer;
            // 标准模式，添加镜片   
            //if (cfg.type === STANDARD) {
            self._renderLens();
            
            // 创建 img 的 DOM 结构
            bImg = DOM.create(IMG, { src: cfg.bigImageSrc });
            self.body.appendChild(bImg);
            
            // 添加引用
            self.bigImage = bImg;
            self.viewer = self.overlay;
            
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
            self._setViewerRegion();
        },
        
        /** 创建镜片
         */
        _renderLens: function() {
            var self = this,
                lens = DOM.create(DIV, { 'class': IMGZOOM_LENS_CLS }),
                cfg = self.config,
                is = self.imgSize;
            document.body.appendChild(lens);
            DOM.width(lens, cfg.lensSize[0]);
            DOM.height(lens,cfg.lensSize[1]);
            // 第一次镜片显示在小图中间
            DOM.offset(lens, {left:is.left+is.width/2-cfg.lenSize[0]/2, top:is.top+is.height/2-cfg.lenSize[1]/2});
            self.lens = lens;
            hide(lens);
        },
        /** 创建放大镜图标
         */
        _renderIcon: function() {
            var self = this,
                is = self.imgSize,
                icon = DOM.create(DIV, { 'class': IMGZOOM_ICON_CLS });
            document.body.appendChild(icon);
            
            var s = getSize(icon);
            DOM.offset(icon, {left: is.left + is.width - s.width/* - parseInt(DOM.css(icon, 'borderRightWidth'))*/, top: is.top + is.height - s.height/* - parseInt(DOM.css(icon, 'borderBottomWidth'))*/});
            self.lensIcon = icon;
        },
        
        /**
         * 设置显示区域大小
         */
        _setViewerRegion: function() {
            var self = this, cfg = self.config,
                is = self.imgSize,
                lensSize = cfg.lensSize,
                width, height,
                bigImage = self.bigImage, bigImageSize;

            // 标准模式
            bigImageSize = bigImage ? {width:cfg.bigImageSize[0], height: cfg.bigImageSize[1]} : getSize(bigImage);
            
            // vH / bigImageH = lensH / imageH
            height = round(bigImageSize.height * lensSize[1] / is.height);
            width = round(bigImageSize.width * lensSize[0] / is.width);
            
            // set it
            ImageZoom.superclass.setSize.call(self, width, height);
        },
        
        _triggerMouse: function() {
            var self = this, timer;
            Event.on(self.trigger, 'mouseenter', function(e){
                timer = S.later(function(){
                    self.show();
                    timer.cancel();
                }, 300);
            });
            Event.on(self.trigger, 'mouseleave', function(e){
                if (timer) timer.cancel();
            });
        },
        
        /** 鼠标移动时, 更改显示区域
         */
        _onMouseMove: function(ev) {
            var self = this,
                is = self.imgSize;
            
            if (ev.pageX>is.left&&ev.pageX<is.left+is.width&&ev.pageY>is.top&&ev.pageY<is.top+is.height) {
                var cfg = self.config,
                    viewer = self.viewer, lens = self.lens,
                    is = self.imgSize,
                    lensSize = cfg.lensSize,
                    lensOffset = {
                        left: ev.pageX - lensSize[0]/2,
                        top: ev.pageY - lensSize[1]/2
                    };
                
                if (lensOffset.left <= is.left) lensOffset.left = is.left;
                else if (lensOffset.left >= is.width + is.left - lensSize[0]) lensOffset.left = is.width + is.left - lensSize[0];
                
                if (lensOffset.top <= is.top) lensOffset.top = is.top;
                else if (lensOffset.top >= is.height + is.top - lensSize[1]) lensOffset.top = is.height + is.top - lensSize[1];
                
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
                v = self.viewer, p = S.get('p', v);

            if (!p) {
                p = DOM.create('<p>');
                v.appendChild(p);
            }
            DOM.html(p, cfg.timeoutMsg);
        },
        show: function(){
            ImageZoom.superclass.show.call(this);
            show(this.lens);
            hide(this.lensIcon);
            Event.on(document.body, 'mousemove', this._onMouseMove, this);
        },
        hide: function(){
            ImageZoom.superclass.hide.call(this);
            hide(this.lens);
            show(this.lensIcon);
            Event.remove(document.body, 'mousemove', this._onMouseMove, this);
        }
    });


    function imgOnLoad(img, callback) {
        if (img.complete)  callback();
        else  Event.on(img, 'load', callback);
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

}, { host: 'overlay' } );


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
 *      - 扩展 Overlay
 *  TODO:
 *      - 加入 Zazzle 的 follow 效果
 *      - 仿照 Zazzle 的效果，在大图加载过程中显示进度条和提示文字
 */
