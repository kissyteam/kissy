/**
 * 放大镜效果
 * @module      imagezoom
 * @creater     qiaohua@taobao.com
 * @depender    kissy-core, yahoo-dom-event
 */

KISSY.add("imagezoom", function(S, undefined) {
    var DOM = S.DOM,
        EVENT = S.Event,
        YDOM = YAHOO.util.Dom,
        HIDDEN = 'hidden',
        IMGZOOM_CONTAINER_CLS = 'ks-imagezoom-container',
        IMGZOOM_MAGNIFIER_CLS = 'ks-imagezoom-magnifier',
        IMGZOOM_VIEWER_CLS = 'ks-imagezoom-viewer',
        IMGZOOM_GLASS_CLS = 'ks-imagezoom-glass',
        IMGZOOM_ICON_CLS = 'ks-imagezoom-icon',
        POSITION = ['top', 'right', 'bottom', 'left'],
        TYPE = ['default', 'glass', 'overlay'],
        /**
         * imagezoom的默认设置
         */
        defaultConfig = {
            /**
             * 默认设置
             */
            bigImageSrc: '',    // 大图片路径, 为''时取原图路径
            offset: 10,         // 大图偏移量
            
            glassSize: [100, 100],      // 镜片高,宽度
            
            useZoomIcon: true,          // 是否需要zoomicon
            type: 'glass',            // 选择显示模式, 可选值: TYPE
            position: 'top',          // 大图显示位置, 可选值: POSITION
            preload: true               // 是否预加载
        };
        
        /** 
         * 放大镜组件
         * @class ImageZoom
         * @constructor
         * @param {String|HTMLElement} image
         * @param {Object} config
         */
        function ImageZoom(img, cfg) {
            var self = this;
            
            if (!(self instanceof ImageZoom)) {
                return new ImageZoom(img, cfg);
            }
            
            /**
             * 需要缩放的图片
             * @type HTMLElement
             */
            self.image = S.get(img);
            if (!self.image) {
                return;
            }
            /**
             * 整体容器
             * @type HTMLElement
             */
            self.container = null;
            
            /**
             * 小图外层
             * @type HTMLElement
             */
            self.origin = null;
            
            /**
             * 放大显示的图片外层
             * @type HTMLElement
             */
            self.viewer = null;
            
            /**
             * 放大显示的图片
             * @type HTMLElement
             */
            self.bigImage = null;
            
            /**
             * 配置参数
             * @type Object
             */
            self.config = S.merge(defaultConfig, cfg);
            
            /**
             * 镜片
             * @type HTMLElement
             */
            self.glass = null;
            
            /**
             * 放大镜图标
             * @type HTMLElement
             */
            self.zoomIcon = null;
            
            // 当小图加载完毕之后, 初始化
            self.image.onload = function(){
                self._init();
            }
            if (self.image.complete) {
                self._init();
            }
        }
        
        S.augment(ImageZoom, {
            /**
             * 初始化方法
             * @protected
             */
            _init: function() {
                /**
                 * 构建所需DOM
                 */
                this._initContainer();
                
                var self = this,
                    cfg = self.config,
                    i = self.image,
                    g = self.glass,
                    z = self.zoomIcon;
                
                // 设置大图路径, 如果没有设定大图图片则用原图路径
                if (!cfg.bigImageSrc) cfg.bigImageSrc = DOM.attr(i, 'src');
                else if (cfg.preload) {
                    // 预加载大图
                    new Image().src = cfg.bigImageSrc;
                }
                
                /**
                 * 鼠标进入小图时, 显示大图
                 */
                EVENT.on(self.origin, 'mouseenter', function(ev) {
                    // 显示镜片
                    if (g) DOM.removeClass(g, HIDDEN);
                    // 隐藏放大镜图标
                    if (z) DOM.addClass(z, HIDDEN);
                    
                    // 创建/显示大图
                    self._zoom(ev);
                });
                
                /**
                 * 鼠标离开小图时, 隐藏大图
                 */
                EVENT.on(self.origin, 'mouseleave', function(ev) {
                    // 隐藏镜片
                    if (g) DOM.addClass(g, HIDDEN);
                    // 显示放大镜
                    if (z) DOM.removeClass(z, HIDDEN);
                    
                    // 隐藏大图
                    DOM.addClass(self.viewer, HIDDEN);
                });
            },
            
            /**
             * 根据config创建所需DOM
             */
            _initContainer: function() {
                var self = this,
                    cfg = self.config,
                    c, o,
                    i = self.image,
                    g, z;
                
                // 构建整个容器
                c = DOM.create('div');
                DOM.addClass(c, IMGZOOM_CONTAINER_CLS);
                DOM.parent(i).insertBefore(c, i);
                self.container = c;
                
                // 构建小图外层
                o = DOM.create('div');
                DOM.addClass(o, IMGZOOM_MAGNIFIER_CLS);
                o.appendChild(i);
                c.appendChild(o);
                self.origin = o;
                
                // 需要显示镜片
                if (TYPE[1] == cfg.type) {
                    g = DOM.create('div');
                    DOM.addClass(g, IMGZOOM_GLASS_CLS);
                    DOM.addClass(g, HIDDEN);
                    g.style.height = cfg.glassSize[0]+'px';
                    g.style.width = cfg.glassSize[1]+'px';
                    o.appendChild(g);
                    self.glass = g;
                }
                // 需要显示放大图标
                if (cfg.useZoomIcon) {
                    z = DOM.create('div');
                    DOM.addClass(z, IMGZOOM_ICON_CLS);
                    o.appendChild(z);
                    self.zoomIcon = z;
                }
                
                // 调整容器大小及位置
                self.container.style.height = parseInt(self.getStyle(o, 'marginTop')) + parseInt(self.getStyle(o, 'marginBottom')) + self.getSize(o).height + 'px';
                if (POSITION[0] == cfg.position) {
                    self.container.style.marginTop = self.getSize(i).height + parseInt(self.getStyle(i, 'borderTopWidth')) + cfg.offset + "px";
                } else if (POSITION[3] == cfg.position) {
                    self.container.style.marginLeft = self.getSize(i).width + parseInt(self.getStyle(i, 'borderLeftWidth')) + cfg.offset + "px";
                }
            },
            
            /**
             * 设置放大图片显示的偏移量
             * @param ev    触发的事件
             */
            _zoom: function(ev) {
                var self = this;
                
                // 如果没有大图显示层, 创建之, 否则就显示
                if (!self.viewer) {
                    self._createZoom();
                } else DOM.removeClass(self.viewer, HIDDEN);
                
                /**
                 * 移动鼠标时更新大图偏移量
                 */
                EVENT.on(self.origin, 'mousemove', function(ev) {
                    // 镜片偏移量并更新
                    var glassOffset = self.getGlassOffset(ev);
                    if (self.glass) {
                        self.glass.style.left = glassOffset.left + 'px';
                        self.glass.style.top = glassOffset.top + 'px';
                    }
                    // 计算大图偏移量并更新
                    var imageSize = self.getSize(self.image);
                    var zoom = self.getSize(self.bigImage);
                    var scrollx = Math.round(glassOffset.left*zoom.width/imageSize.width);
                    var scrolly = Math.round(glassOffset.top*zoom.height/imageSize.height);
                    self.viewer.scrollLeft = scrollx;
                    self.viewer.scrollTop = scrolly;
                });
            },
            
            /**
             * 创建大图显示DOM
             */
            _createZoom: function() {
                var self = this,
                    cfg = self.config,
                    i = self.image, v;
                
                // 创建大图显示DOM结构
                v = DOM.create('div');
                DOM.addClass(v, IMGZOOM_VIEWER_CLS);
                var bimg = DOM.create('img');
                DOM.attr(bimg, 'src', cfg.bigImageSrc);
                v.appendChild(bimg);
                // 添加到原有DOM中
                self.container.appendChild(v);
                self.bigImage = bimg;
                self.viewer = v;
                
                // 获取小图片偏移量, 实际尺寸, 镜片实际尺寸
                var imageOffset = self.getOffset(i),
                    imageSize = self.getSize(i),
                    glassSize = self.getSize(self.glass);
                
                // 计算大图偏移量
                var leftpos, toppos;
                
                // 计算大图宽度高度
                var bigImgWidth = Math.round(imageSize.height/glassSize.height*glassSize.width);
                
                if (POSITION[0] == cfg.position) {
                    toppos = - (imageSize.height + parseInt(self.getStyle(i, 'borderTopWidth')) + cfg.offset - parseInt(self.getStyle(self.origin, 'marginTop')));
                    leftpos = imageOffset.left;
                } else if (POSITION[2] == cfg.position) {
                    toppos = imageSize.height + imageOffset.top + cfg.offset;
                    leftpos = imageOffset.left;
                } else if (POSITION[3] == cfg.position) {
                    toppos = imageOffset.top;
                    leftpos = - (imageSize.width + parseInt(self.getStyle(i, 'borderLeftWidth')) + cfg.offset - parseInt(self.getStyle(self.origin, 'marginLeft')));
                } else {
                    toppos = imageOffset.top;
                    leftpos = imageOffset.left + imageSize.width + cfg.offset;
                }

                self.viewer.style.top = toppos + 'px';
                self.viewer.style.left = leftpos + 'px';
                
                self.viewer.style.height = imageSize.height + 'px';
                self.viewer.style.width = bigImgWidth + 'px';
                DOM.removeClass(v, HIDDEN);
            },
            
            /**
             * 获取镜片的偏移量
             * @param ev    触发的事件
             * @return  x/y: 镜片在放大目标元素上的横/纵向位置
             */
            getGlassOffset: function(ev) {
                var self = this,
                    i = self.image,
                    offset = {
                        left: 0,
                        top: 0
                    };
                // 小图偏移量
                var imageOffset = self.getOffset(i);
                // 鼠标在页面上的位置
                var mousePoint = self.getMousePoint(ev);
                // 镜片实际尺寸
                var glassSize = self.getSize(self.glass);
                // 小图实际尺寸
                var imageSize = self.getSize(i);
                // 光标横向位置
                var cursorX = mousePoint.x - imageOffset.left;
                // 镜片横向偏移量
                offset.left = cursorX - glassSize.width/2;
                
                if (offset.left < 0) {
                    offset.left = 0;
                } else if (offset.left > imageSize.width - glassSize.width) {
                    offset.left = imageSize.width - glassSize.width;
                }
                // 光标纵向位置
                var cursorY = mousePoint.y - imageOffset.top;
                // 镜片纵向偏移量
                offset.top = cursorY - glassSize.height/2;
                if (offset.top < 0) {
                    offset.top = 0;
                } else if (offset.top >= imageSize.height - glassSize.height) {
                    offset.top = imageSize.height - glassSize.height;
                }
                return offset;
            },
            
            /**
             * 获取元素的宽高度(不包括边线和滚动条)
             * @param   HTMLElement
             * @return  元素可见尺寸
             */
            getSize: function(elm) {
                var cfg = this.config;
                if (!elm) return {height: cfg.glassSize[0], width: cfg.glassSize[1]};
                return {
                    width: elm.offsetWidth,
                    height: elm.offsetHeight
                };
            },
            
            /**
             * 获取累计偏移量, 即元素到页面左上角的横行和纵向距离
             * @param   elm    目标元素
             * @return  left:  横行偏移距离, top:纵向偏移距离
             */
            getOffset: function(elm) {
                return {
                    left: YDOM.getXY(elm)[0],
                    top: YDOM.getXY(elm)[1]
                };
            },
            
            /**
             * 获取鼠标在页面上的位置
             * @param ev    触发事件
             * @return  x/y: 鼠标在页面上的横/纵向位置
             */
            getMousePoint: function(ev) {
                return {x: ev.pageX, y: ev.pageY}
            },
            
            /**
             * 获取元素样式
             * @param elm 目标元素
             * @param p   样式名称
             * @return 元素对应的样式
             */
            getStyle: function(elm, p){
                if (typeof elm == 'string') {
                    elm = S.get(elm);
                }

                if (window.getComputedStyle) {
                    //document.defaultView 
                    var y = window.getComputedStyle(elm, '');
                } else if (elm.currentStyle) {
                    var y = elm.currentStyle;
                }
                return y[p];
            }
        });
        S.augment(ImageZoom, S.EventTarget);
        
        S.ImageZoom = ImageZoom;
    
});

/**
 * NOTES:
 *  2010.6.21
 *      - 加入position选项, 动态构建所需dom;
 *      - 小图加载之后才能继续;
 * TODO:
 *      - 加入跟随模式和反转模式;
 *      - 大图加载等待
 */
