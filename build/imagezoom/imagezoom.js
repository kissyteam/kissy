/*
Copyright 2010, KISSY UI Library v1.1.0pre
MIT Licensed
build time: ${build.time}
*/
/**
 * ͼƬ�Ŵ����
 * @creater     qiaohua@taobao.com
 * @depends     ks-core
 */
KISSY.add('imagezoom', function(S) {

    var DOM = S.DOM, EVENT = S.Event,

        IMGZOOM_MAGNIFIER_CLS = 'ks-imagezoom-magnifier',
        IMGZOOM_VIEWER_CLS = 'ks-imagezoom-viewer',
        IMGZOOM_GLASS_CLS = 'ks-imagezoom-glass',
        IMGZOOM_ICON_CLS = 'ks-imagezoom-icon',
        IMGZOOM_VIEWER_BK_CLS = 'ks-imagezoom-viewer-bk',

        POSITION = ['top', 'right', 'bottom', 'left'],
        TYPE = ['default', 'glass', 'follow'],

        DIV = '<div>', IMG = '<img>', B = '<b>',

        HIDDEN = 'hidden',
        HEIGHT = 'height', WIDTH = 'width',
        TOP = 'top', LEFT = 'left',
        
        /**
         * Ĭ������
         */
        defaultConfig = {
            type: 'default',    // ��ʾģʽ, ��ѡֵ: TYPE

            bigImageSrc: '',    // ��ͼ·��, Ϊ '' ʱȡԭͼ·��
            bigImageSize: { height: 900, width:900 }, // ��ͼ�߿�
            position: 'right',  // ��ͼ��ʾλ��, ��ѡֵ: POSITION
            offset: 10,         // ��ͼλ�õ�ƫ����
            preload: true,      // �Ƿ�Ԥ���ش�ͼ
            timeout: 6000,      // �ȴ��ͼ���ص����ʱ��, ��λ: ms

            glassSize: { height: 100, width: 100 }, // ��Ƭ�߿�
            zoomIcon: true      // �Ƿ���ʾ�Ŵ���ʾͼ��
        };
        
        /** 
         * ͼƬ�Ŵ����
         * @class ImageZoom
         * @constructor
         */
        function ImageZoom(img, cfg) {
            var self = this;
            
            if (!(self instanceof ImageZoom)) {
                return new ImageZoom(img, cfg);
            }
            
            /**
             * ��Ҫ���ŵ�ͼƬ
             * @type HTMLElement
             */
            if (typeof(img) === typeof('')) self.image = S.get(img);
            else self.image = img;
            
            if (!self.image) {
                return;
            }
            
            /**
             * Сͼ���
             * @type HTMLElement
             */
            self.origin = null;
            
            /**
             * �Ŵ���ʾ��ͼƬ���
             * @type HTMLElement
             */
            self.viewer = null;
            
            /**
             * �Ŵ���ʾ��ͼƬ
             * @type HTMLElement
             */
            self.bigImage = null;
            
            /**
             * ���ò���
             * @type Object
             */
            self.config = S.merge(defaultConfig, cfg);
            
            /**
             * ��Ƭ
             * @type HTMLElement
             */
            self.glass = null;
            
            /**
             * �Ŵ�ͼ��
             * @type HTMLElement
             */
            self.zoomIcon = null;
            
            /**
             * Сͼ����״̬
             */
            self.imageReady = false;
            
            /**
             * ��ͼ����״̬
             */
            self.bigImageReady = false;
            
            /**
             * ��Ϣ��ʾ��ʱ
             */
            self.timer = null;
            
            // ��Сͼ�������֮��, ��ʼ��
            self.image.onload = function(){
                if (!self.imageReady) {
                    self.imageReady = !self.imageReady;
                    self._init();
                }
            };
            if (!self.imageReady && self.image.complete && self.getSize(self.image).height) { 
                self.imageReady = !self.imageReady;
                self._init();
            }
        }
        
        S.augment(ImageZoom, {
            /**
             * ��ʼ������
             * @protected
             */
            _init: function() {
                var self = this,
                    i = self.image;
                
                self._initContainer();
                
                /**
                 * ��������DOM
                 */
                var cfg = self.config,
                    g = self.glass,
                    z = self.zoomIcon;
                
                // ���ô�ͼ·��, ���û���趨��ͼͼƬ����ԭͼ·��
                if (!cfg.bigImageSrc) cfg.bigImageSrc = DOM.attr(i, 'src');
                else if (cfg.preload) {
                    // Ԥ���ش�ͼ
                    new Image().src = cfg.bigImageSrc;
                }
                
                /**
                 * ������Сͼʱ, ��ʾ��ͼ
                 */
                EVENT.on(self.origin, 'mouseenter', function(ev) {
                    // ��ʾ��Ƭ
                    if (g) DOM.removeClass(g, HIDDEN);
                    // ���طŴ�ͼ��
                    if (z) DOM.addClass(z, HIDDEN);
                    
                    // ����/��ʾ��ͼ
                    if (!self.viewer) {
                        self._createZoom(ev);
                        self.fire('firstHover');
                    } else DOM.removeClass(self.viewer, HIDDEN);
                    // ���ô�ͼ���س�ʱ��ʱ��
                    self.timer = setTimeout(function(){
                        if (!self.bigImageReady) self.showMsg();
                    }, self.config.timeout);
                });
                
                /**
                 * ����뿪Сͼʱ, ���ش�ͼ
                 */
                EVENT.on(self.origin, 'mouseleave', function(ev) {
                    // ���ؾ�Ƭ
                    if (g) DOM.addClass(g, HIDDEN);
                    // ��ʾ�Ŵ�
                    if (z) DOM.removeClass(z, HIDDEN);
                    
                    // ���ش�ͼ
                    if (self.viewer) DOM.addClass(self.viewer, HIDDEN);
                    if (self.timer) clearTimeout(self.timer);
                });
                
                /**
                 * ����һ���Ƶ���ͼ��ʱ
                 */
                EVENT.on(self, 'firstHover', function(){
                    // do sth
                });
            },
            
            /**
             * ���config��������DOM
             */
            _initContainer: function() {
                var self = this,
                    cfg = self.config,
                    o,
                    i = self.image,
                    g, z;
                
                // ���img�����a, ��ѡ��a��parent
                if (DOM.parent(i).nodeName.toLowerCase() === 'a')  i = DOM.parent(i);
                
                // ����Сͼ���
                o = DOM.create(DIV);
                DOM.addClass(o, IMGZOOM_MAGNIFIER_CLS);
                DOM.parent(i).insertBefore(o, i);
                o.appendChild(i);
                self.origin = o;
                
                // ��Ƭģʽ��
                if (TYPE[1] == cfg.type) {
                    g = DOM.create(DIV);
                    DOM.addClass(g, IMGZOOM_GLASS_CLS);
                    DOM.addClass(g, HIDDEN);
                    DOM.css(g, HEIGHT, cfg.glassSize.height+'px');
                    DOM.css(g, WIDTH, cfg.glassSize.width+'px');
                    o.appendChild(g);
                    self.glass = g;
                }
                // ��Ҫ��ʾ�Ŵ�ͼ��
                if (cfg.zoomIcon) {
                    z = DOM.create(DIV);
                    DOM.addClass(z, IMGZOOM_ICON_CLS);
                    o.appendChild(z);
                    self.zoomIcon = z;
                }
            },
            
            /**
             * ������ͼ����ʾDOM
             */
            _createZoom: function(ev) {
                var self = this,
                    cfg = self.config,
                    v;
                
                // ������ʾ�����DOM�ṹ
                v = DOM.create(DIV);
                DOM.addClass(v, IMGZOOM_VIEWER_CLS);
                DOM.addClass(v, IMGZOOM_VIEWER_BK_CLS);
                var bimg = DOM.create(IMG);
                DOM.attr(bimg, 'src', cfg.bigImageSrc);
                v.appendChild(bimg);
                // �����ʾ����ԭ��DOM��, ����ģʽ�е����
                if (TYPE[2] == cfg.type) {
                    self.origin.appendChild(v);
                } else {
                    DOM.get('body').appendChild(v);
                }
                self.bigImage = bimg;
                self.viewer = v;
                
                self._updateViewer(ev, false);
                self._zoom();
                // ��ͼ������Ϻ������ʾ����
                self.bigImage.onload = function() {
                    if (!self.bigImageReady) {
                        self.bigImageReady = !self.bigImageReady;
                        self._updateViewer(ev, true);
                    }
                }
                if (!self.bigImageReady && self.bigImage.complete && self.getSize(self.bigImage).height) {
                    self.bigImageReady = !self.bigImageReady;
                    self._updateViewer(ev, true);
                }
            },
            
            /**
             * ���÷Ŵ�ͼƬ��ʾ��ƫ����
             */
            _zoom: function() {
                var self = this,
                    cfg = self.config,
                    g = self.glass,
                    v = self.viewer;
                /**
                 * �ƶ����ʱ���´�ͼƫ����
                 */
                EVENT.on(self.origin, 'mousemove', function(ev) {
                    // ��Ƭƫ����������
                    var glassOffset = self.getGlassOffset(ev);
                    if (g) {
                        DOM.css(g, LEFT, glassOffset.left + 'px');
                        DOM.css(g, TOP, glassOffset.top + 'px');
                    }
                    // �����ͼƫ����������
                    var imageSize = self.getSize(self.image),
                        zoom = self.getSize(self.bigImage),
                        i = 0,
                        j = 0,
                        scrollx = Math.round(glassOffset.left*zoom.width/imageSize.width),
                        scrolly = Math.round(glassOffset.top*zoom.height/imageSize.height);
                    if (TYPE[2] == cfg.type) {
                        var glassSize = self.getSize(g);
                        i = glassSize.width/2;
                        j = glassSize.height/2
                    }
                    v.scrollLeft = scrollx + i;
                    v.scrollTop = scrolly + j;
                    
                    // ����ģʽ�¸�����ʾ����λ��
                    if (TYPE[2] == cfg.type) {
                        DOM.css(v, LEFT, glassOffset.left + 'px');
                        DOM.css(v, TOP, glassOffset.top + 'px');
                    }
                });
            },
            
            /**
             * ������ʾ�����С��λ��
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
                
                
                // ������ʾ����λ��
                var leftPos, topPos, vHeight, vWidth;
                if (TYPE[2] == cfg.type) {
                    // ����ģʽ��, ������ʾ�����ʼλ��
                    var mousePoint = self.getMousePoint(ev),
                        cursorX = mousePoint.x - imageOffset.left,
                        cursorY = mousePoint.y - imageOffset.top;
                    topPos = cursorX - glassSize.width/2;
                    leftPos = cursorY - glassSize.height/2;
                    // ����ģʽ��, ��ʾ�����߶����û��趨��glass��߶Ⱦ���
                    vHeight = glassSize.height;
                    vWidth =  glassSize.width;
                } else {
                    // ������ʾ�ڲ�ͬλ���ϼ���left��topֵ
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
                    
                    // ����ģʽ��, ��ʾ�����߶��ɴ�Сͼ�ı�������
                    vHeight = Math.round(bigImageSize.height*glassSize.height/imageSize.height);
                    vWidth = Math.round(bigImageSize.width*glassSize.width/imageSize.width);
                    
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
                //DOM.css(v, TOP, topPos + 'px');
                //DOM.css(v, LEFT, leftPos + 'px');
            },
            
            /**
             * ��ȡ��Ƭ��ƫ����
             * @param ev    �������¼�
             * @return  offset ��Ƭ�ڷŴ�Ŀ��Ԫ���ϵĺ�����λ��
             */
            getGlassOffset: function(ev) {
                var self = this,
                    i = self.image,
                    offset = {
                        left: 0,
                        top: 0
                    };
                // Сͼƫ����
                var imageOffset = DOM.offset(i);
                // �����ҳ���ϵ�λ��
                var mousePoint = self.getMousePoint(ev);
                // ��Ƭʵ�ʳߴ�
                var glassSize = self.getSize(self.glass);
                // Сͼʵ�ʳߴ�
                var imageSize = self.getSize(i);
                // ������λ��
                var cursorX = mousePoint.x - imageOffset.left;
                // ��Ƭ����ƫ����
                offset.left = cursorX - glassSize.width/2;
                var i = 0,
                    j = 0;
                // ����ģʽ��, ƫ�����Ʋ�ͬ
                if (TYPE[2] == self.config.type) {
                    i = glassSize.width/2;
                    j = glassSize.height/2;
                }
                if (offset.left < -i) {
                    offset.left = 0;
                } else if (offset.left > imageSize.width - glassSize.width + i) {
                    offset.left = imageSize.width - glassSize.width;
                }
                // �������λ��
                var cursorY = mousePoint.y - imageOffset.top;
                // ��Ƭ����ƫ����
                offset.top = cursorY - glassSize.height/2;
                if (offset.top < -j) {
                    offset.top = 0;
                } else if (offset.top > imageSize.height - glassSize.height + j) {
                    offset.top = imageSize.height - glassSize.height;
                }
                return offset;
            },
            
            /**
             * ��ȡԪ�صĿ�߶�(���������ߺ͹�����)
             * @param   HTMLElement
             * @return  Ԫ�ؿɼ�ߴ�
             */
            getSize: function(elm) {
                if (!elm) return this.config.glassSize;
                return {
                    width: elm.clientWidth,
                    height: elm.clientHeight
                };
            },
            
            /**
             * ��ȡ�����ҳ���ϵ�λ��
             * @param ev        �����¼�
             * @return offset   �����ҳ���ϵĺ�����λ��
             */
            getMousePoint: function(ev) {
                return {x: ev.pageX, y: ev.pageY}
            },
           
            /**
             * ��ͼƬ������ʱ��ʾ��ʾ��Ϣ
             */
            showMsg: function(){
                var b = S.get('b', this.viewer);
                if (!b) {
                    b = DOM.create(B);
                    this.viewer.appendChild(b);
                    DOM.removeClass(this.viewer, IMGZOOM_VIEWER_BK_CLS);
                }
                DOM.html(b, 'ͼƬ�ݲ�����');
            },
            hideMsg: function(){
                var b = S.get('b', this.viewer);
                DOM.html(b, '');
                DOM.addClass(this.viewer, IMGZOOM_VIEWER_BK_CLS);
            }
        }, S.EventTarget);
        
        S.ImageZoom = ImageZoom;
    
});

/**
 * NOTES:
 *  2010.6
 *      - ����positionѡ��, ��̬��������dom;
 *      - Сͼ����;
 *      - ��ͼ����֮�������ʾ;
 *      - �������ģʽ
 *      - ����Timeout
 *      - 6. 24  ȥ��yahoo-dom-event����
 *  2010.7
 *      - ȥ��getStyle, ʹ��DOM.css()
 *      - firstHover
 *      - ������ʾ����λ�ü������
 *      - ����DOM�ṹ, ȥ���Ҫ�Ĵ���
 *  TODO:
 *      - ���뷴תģʽ;
 *      - 
 */
