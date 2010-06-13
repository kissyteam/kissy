/**
 * 放大镜效果
 * @module      zoomer
 * @creater     
 * @depender    kissy-core, yahoo-dom-event
 */

// yubo: 建议命名为 ImageZoom, 更能见名知意，功能也更单一
KISSY.add("zoomer", function(S, undefined) {
    var DOM = S.DOM,
        EVENT = S.Event,
        win = window, // yubo: 没用到，可以移除
        doc = document, // yubo: 同上
        YDOM = YAHOO.util.Dom,
        
        /**
         * zoomer的默认设置
         */
        defaultConfig = {
            /**
             * 默认设置
             * yubo: class 建议采用标准长命名格式：ks-imagezoom-container 这种形式，因为是类库，要
             *       尽量减少冲突的可能性
             *<div class="container">
             *   <div class="magnifier">
             *    <img id="smallimg" class="jqzoom" src="close1_small.jpg" />
             *   </div>
             *</div>
             */
            bigImageSrc: '',  // 大图片路径, 为null时取原图路径

            offset: 10,         // 大图偏移量
            //border: 1,          // 边框宽度
            //containerCls: "container",  // 容器类
            //originCls: "magnifier",     //
            //viewerCls: "viewer",        //

            glassSize: [100,100],            // 镜片宽度
            glassSizeH: 100,            // 镜片高度
            useGlass: true,             // 是否需要镜片
            glassCls: "glass",          // 镜片类

            useZoomIcon: true,          // 是否需要zoomicon
            zoomIconCls: "zoom-icon"   // 放大图标类  yubo: 最后的逗号，很不应该哦

            // yubo: 上面的配置，或许可以用 type: 'default', 'glass', 'overlay' 等方式，更易于扩展
            // position: 'right'
        };
        
        /** 
         * 放大镜组件
         * @class Zoomer
         * @constructor
         * @param {String|HTMLElement} image
         * @param {Object} config
         */
        function Zoomer(image, config) {
            var self = this;
            
            if (!(self instanceof Zoomer)) {
                return new Zoomer(image, config);
            }

            if(preload) {
                new Image().src = '';
            }
            
            /**
             * 需要缩放的图片
             * @type HTMLElement
             */
            self.image = S.get(image);
            
            /**
             * 放大显示的图片外层
             * @type HTMLElement
             */
            self.viewer = null;
            
            /**
             * 放大显示的图片
             * @type HTMLElement
             */
            self.Image = null; // yubo: image 和 Image, 这两个命名，有点混淆
            
            /**
             * 配置参数
             * @type Object
             */
            self.config = S.merge(defaultConfig, config || {}); // yubo: 后面的 {} 可以省略
            
            // TODO: 
            self.container = S.get("."+self.config.containerCls);
            self.origin = S.get("."+self.config.originCls);
            
            self._init();
        }

        // yubo: 可以用 S.augment(Zoomer, { ... });
        S.mix(Zoomer.prototype, {
            /**
             * 初始化方法
             * @protected
             */
            _init: function() {
                var self = this;
                
                self._initContainer();
                
                /**
                 * 鼠标进入小图时, 显示大图
                 */
                EVENT.on(self.origin, 'mouseenter', function(ev) {

                    // yubo: 可以定义 HIDDEN = 'hidden', config = self.config
                    // 显示镜片
                    if (self.config.useGlass) DOM.removeClass(self.glass, 'hidden');
                    // 隐藏放大镜图标
                    if (self.config.useZoomIcon) DOM.addClass(self.zoomIcon, 'hidden');
                    
                    // 创建/显示大图
                    self._zoom(ev);
                });
                
                /**
                 * 鼠标离开小图时, 隐藏大图
                 */
                EVENT.on(self.origin, 'mouseleave', function(ev) {
                    // 隐藏镜片
                    if (self.config.useGlass) DOM.addClass(self.glass, 'hidden');
                    // 显示放大镜
                    if (self.config.useZoomIcon) DOM.removeClass(self.zoomIcon, 'hidden');
                    
                    // 隐藏大图
                    DOM.addClass(self.viewer, 'hidden');
                });
            },
            
            /**
             * 根据config创建所需DOM
             */
            _initContainer: function() {
                var self = this;
                // yubo: 可以定义 glass = self.glass, 简化下面的代码
                
                // Todo: create original & contaner
                //var origin = DOM.create('div');
                //var container = DOM.create('div');
                //DOM.addClass(container, self.config.containerCls);
                //origin.appendChild(self.image);
                
                // 需要显示镜片
                if (self.config.useGlass) {
                    self.glass = DOM.create('div');
                    DOM.addClass(self.glass, self.config.glassCls + ' ' + HIDDEN);
                    //DOM.addClass(self.glass, 'hidden');
                    self.glass.style.height = self.config.glassSizeH+'px';
                    self.glass.style.width = self.config.glassSizeW+'px';
                    self.origin.appendChild(self.glass);
                }
                // 需要显示放大图标
                if (self.config.useZoomIcon) {
                    self.zoomIcon = DOM.create('div');
                    DOM.addClass(self.zoomIcon, self.config.zoomIconCls);
                    self.origin.appendChild(self.zoomIcon);
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
                } else DOM.removeClass(self.viewer, 'hidden');
                
                /**
                 * 移动鼠标时更新大图偏移量
                 */
                EVENT.on(self.origin, 'mousemove', function(ev) {
                    // 镜片偏移量并更新
                    var glassOffset = self.getGlassOffset(ev);
                    if (self.glass) {
                        self.glass.style.left = glassOffset.left +'px';
                        self.glass.style.top = glassOffset.top +'px';
                    }
                    // 计算大图偏移量并更新
                    var imageSize = self.getSize(self.image);
                    var zoom = self.getSize(self.Image);
                    var scrollx = Math.round(glassOffset.left*zoom.width/imageSize.width);
                    var scrolly = Math.round(glassOffset.top*zoom.height/imageSize.height);
                    self.viewer.scrollLeft = scrollx;
                    self.viewer.scrollTop = scrolly;
                });
            },
            
            /**
             * 创建大图DOM
             */
            _createZoom: function() {
                var self = this;
                
                // 设置大图路径, 如果没有设定大图图片则用原图路径
                if (!self.config.bigImageSrc) self.config.bigImageSrc = DOM.attr(self.image, 'src');
                
                // 创建大图显示DOM结构, ex：<div class='viewerCls'><img src='bigImageSrc'/></div>
                var vdiv = DOM.create('div');
                DOM.addClass(vdiv, self.config.viewerCls);
                var bimg = DOM.create('img');
                DOM.attr(bimg, 'src', self.config.bigImageSrc);
                vdiv.appendChild(bimg);
                self.viewer = vdiv;
                self.Image = bimg;
                
                // 添加到原有DOM中
                self.container.appendChild(self.viewer);
                
                // 获取小图片偏移量, 实际尺寸, 镜片实际尺寸
                var imageOffset = self.getOffset(self.image),
                    imageSize = self.getSize(self.image),
                    glassSize = self.getSize(self.glass);
                
                // 计算大图偏移量
                var leftpos = imageOffset.left + imageSize.width + self.config.offset;
                
                // 计算大图宽度高度
                var bigImgWidth = Math.round(imageSize.height/glassSize.height*glassSize.width);

                self.viewer.style.top = imageOffset.top - self.config.border + 'px';
                self.viewer.style.left = leftpos + 'px';
                self.viewer.style.height = imageSize.height - self.config.border*2 + 'px';
                self.viewer.style.width = bigImgWidth + 'px';
                DOM.removeClass(self.viewer, 'hidden');
            },
            
            /**
             * 获取镜片的偏移量
             * @param ev    触发的事件
             * @return  x/y: 镜片在放大目标元素上的横/纵向位置
             */
            getGlassOffset: function(ev) {
                var self = this;
                var offset = {
                    left: 0,
                    top: 0
                };
                // 小图偏移量
                var imageOffset = self.getOffset(self.image);
                // 鼠标在页面上的位置
                var mousePoint = self.getMousePoint(ev);
                // 镜片实际尺寸
                var glassSize = self.getSize(self.glass);
                // 小图实际尺寸
                var imageSize = self.getSize(self.image);
                // 光标横向位置
                var cursorX = mousePoint.x - imageOffset.left;
                // 镜片横向偏移量
                offset.left = cursorX - glassSize.width/2;
                
                if (offset.left < 0) {
                    offset.left = 0;
                } else if (offset.left > imageSize.width - glassSize.width) {
                    offset.left = imageSize.width - glassSize.width - self.config.border*2;
                }
                // 光标纵向位置
                var cursorY = mousePoint.y - imageOffset.top;
                // 镜片纵向偏移量
                offset.top = cursorY - glassSize.height/2;
                if (offset.top < 0) {
                    offset.top = 0;
                } else if (offset.top >= imageSize.height - glassSize.height) {
                    offset.top = imageSize.height - glassSize.height - self.config.border*2;
                }
                return offset;
            },
            
            /**
             * 获取元素的宽高度(不包括边线和滚动条)
             * @param   HTMLElement
             * @return  元素可见尺寸
             */
            getSize: function(elm) {
                var self = this;
                if (elm == undefined) return {height:self.config.glassSizeH, width: self.config.glassSizeW};
                return {
                    width: elm.clientWidth,
                    height: elm.clientHeight
                };
            },
            /**
             * 获取累计偏移量, 即元素到页面左上角的横行和纵向距离
             * @param   element 目标元素
             * @return  left:   横行偏移距离, top:纵向偏移距离
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
            }
        });
        
        
        S.mix(Zoomer.prototype, S.EventTarget);
        
        S.Zoomer = Zoomer;
    
});

/**
 * NOTES:
 *
 * TODO:
 *  - 替换行174,175, 不使用scrollLeft, 而是替换成更新大图的position方式
 *  - 大图预加载;
 *  - 加入放大系数;
 *  - 加入跟随模式和反转模式;
 */
