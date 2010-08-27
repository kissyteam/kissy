/**
 * KISSY.Overlay 
 *
 * @creator     乔花<qiaohua@taobao.com>
 * @date        2010.08.25
 * @version     1.0
 */

KISSY.add('overlay', function(S, undefined) {
    var DOM = S.DOM,
        Event = S.Event,
        isIe6 = S.UA.ie === 6,
        DOT = '.',
        DIV = '<div>',
        IFRAME = '<iframe>',
        KS_HIDE_CLS = 'ks-hidden',
        KS_VISIBILITY_CLS = 'ks-invisible',
        CLS_PREFIX = 'ks-overlay-',
        KS_OVERLAY_CLS = CLS_PREFIX+'container',
        KS_OVERLAY_BODY_CLS = CLS_PREFIX+'bd',
        KS_OVERLAY_MASK_CLS = CLS_PREFIX+'mask',
        KS_OVERLAY_MASK_IFM_CLS = CLS_PREFIX+'mask-iframe',
        KS_OVERLAY_IFM_CLS = CLS_PREFIX+'iframe',
        KS_OVERLAY_FIXED = CLS_PREFIX+'fixed',
        KS_OVERLAY_LOADING = CLS_PREFIX+'loading',
        /**
         * 位置信息
         */
        POSITION = {
            x:['l', 'c', 'r'], 
            y:['t', 'c', 'b']
        },
        DEFAULT_ALIGN = {
            node: null, 
            x: POSITION.x[1], 
            y: POSITION.y[1], 
            inner: false, 
            offset: 0
        },
        
        /**
         * 所有自定义事件列表
         */
        EVENTS = {
            AFTER_INIT          : "afterInit",        // 初始化之后
            AFTER_FIRST_RENDER  : "afterFirstRender", // 第一次填充内容后
            CHANGE_BODY         : "changeBody",       // 修改bg
            CENTER              : "center",           // center后
            CHANGE_POSITION     : "changePosition",   // 位置改变之后
            SHOW                : "onShow",           // show
            HIDE                : "onHide"            // hide
        },
        /**
         * 默认设置
         */
        defaultConfig = {
            // 结构
            srcNode: null,          // 元素节点, 默认为null, 新建一个节点
            body: '',               // 主体
            
            // 内容, 数据
            url: '',                // 不设置时为静态数据, 设置时请求数据后替换body
            
            // 其他
            triggerType: 'click',   // 触发事件
            
            // 样式
            overlayCls: KS_OVERLAY_CLS,
            bodyCls: KS_OVERLAY_BODY_CLS,
            width: 0,             // 宽度
            height: 0,            // 高度
            align: DEFAULT_ALIGN, // 对齐
            mask: false,             // 显示低层覆盖, 默认不显示
            shim: isIe6,             // 
            scroll: false            // 滚动时固定在可视区域
        };
    
    /*
     * DOM 结构
     * <body>
     *  <div class="{{KS_OVERLAY_CLS}}">
     *      <div class="{{KS_OVERLAY_BODY_CLS}}"></div>
     *  </div>
     *  <div class="{{KS_OVERLAY_MASK_CLS}}"></div>
     *  <div class="{{KS_OVERLAY_MASK_IFM_CLS}}"></div>
     *  <div class="{{KS_OVERLAY_IFM_CLS}}"></div>
     * </body>
     */
    
    function lazyRun(obj, before, after) {
        var b = obj[before],
            a = obj[after];
        obj[before] = function(){
            b.apply(obj, arguments);
            a.apply(obj, arguments);
            obj[before] = obj[after];
        };
    }

    /**
     * Mask 
     * 只有页面上需要覆盖层时才生成
     */
    function Mask(){
        this._init();
    }
    S.augment(Mask, {
        _init: function(){
            lazyRun(this, '_preShow', '_realShow');
        },
        _preShow: function(){
            var self = this,
                bd = document.body,
                mask = DOM.get(DOT+KS_OVERLAY_MASK_CLS, bd),
                maskIfm = DOM.get(DOT+KS_OVERLAY_MASK_IFM_CLS, bd),
                docHeight = DOM.docHeight();
            if (!mask) {
                mask = DOM.create(DIV, { 'class':  KS_OVERLAY_MASK_CLS});
                bd.appendChild(mask);
            }
            self.mask = mask;
            DOM.css(self.mask, {
                'height': docHeight + 'px',
                'left':'0px',
                'top':'0px'
            });
            
            if (isIe6) {
                maskIfm = DOM.create(IFRAME, { 'class':  KS_OVERLAY_MASK_IFM_CLS});
                bd.appendChild(maskIfm);
                self.maskIfm = maskIfm;
                DOM.css(self.maskIfm, {
                    'height': docHeight + 'px',
                    'left':'0px',
                    'top':'0px'
                });
            }
        },
        _toggelShow: function(fn) {
            fn(this.mask, KS_HIDE_CLS);
            if (this.maskIfm) fn(this.maskIfm, KS_HIDE_CLS);
            
        },
        _realShow: function(){
            this._toggelShow(DOM.removeClass);
        },
        show: function(){
            this._preShow();
        },
        hide: function(){
            this._toggelShow(DOM.addClass);
        }
    });
    
    var mask;
    
    /* 
     * Overlay Class
     * @constructor
     */
    function Overlay(trigger, cfg){
        var self = this;
        
        if (S.isString(trigger)) self.trigger = DOM.get(trigger);
        else self.trigger = trigger;
        
        //if (!self.trigger) return;
        
        
        // 配置信息
        if (cfg) cfg.align = S.merge(DEFAULT_ALIGN, cfg.align);
        self.config = S.merge(defaultConfig, cfg);
        
        /**
         * overlay
         * @type HTMLElement
         */
        self.overlay = null;
        
        /**
         * body
         * @type HTMLElement
         */
        self.body = null;
        self._init();
        
    }
    
    S.augment(Overlay, S.EventTarget, {
        _init: function(){
            var self = this;
            lazyRun(self, '_preShow', '_realShow');
            // 处理不同的触发类型
            if (self.trigger){
                if (self.config.triggerType === 'mouse') {
                    self.timer = null;
                    Event.on(self.trigger, 'mouseenter', function(e){
                        self.timer = setTimeout(function(){
                            self.show();
                        }, 300);
                    });
                    Event.on(self.trigger, 'mouseleave', function(e){
                        clearTimeout(self.timer);
                        if (self.overlay&&!DOM.hasClass(self.overlay, KS_HIDE_CLS)) self.hide();
                    });
                    
                } else {
                    Event.on(self.trigger, 'click', function(e){
                        self.show();
                    });
                }
            }
            self.fire(EVENTS.AFTER_INIT, {});
        },
        _preShow: function() {
            var self = this,
                cfg = self.config,
                bd = document.body,
                tmp;
            
            // 现有节点 或 已有 DOM 结构基础上
            if (S.isPlainObject(cfg.srcNode)) {
                self.overlay = cfg.srcNode;
            } else if (S.isString(cfg.srcNode)) {
                self.overlay = DOM.get(cfg.srcNode);
            }
            if (self.overlay) {
                self.body = DOM.get(DOT+cfg.bodyCls, self.overlay);
                DOM.removeClass(self.overlay, KS_HIDE_CLS);
            } else {
                // 构建基本 DOM 
                tmp = [['overlay', cfg.overlayCls], ['body', cfg.bodyCls]];
                S.each(tmp, function(t,i){
                    self[t[0]] = DOM.create(DIV, { 'class': t[1] });
                    DOM.html(self[t[0]], cfg[t[0]]||'');
                });
                
                self.overlay.appendChild(self.body);
                
                bd.appendChild(self.overlay);
                
                
                // 设置大小
                if (cfg.width) {
                    DOM.width(self.overlay, cfg.width+'px');
                }
                if (cfg.height) {
                    DOM.height(self.overlay, cfg.height+'px');
                }
                // 调整位置
                self.setPosition();
            }
            
            
            
            // IE6或者需要shim时 增加对应iframe
            if (cfg.shim) {
                var overlayIfm = DOM.get(DOT+KS_OVERLAY_IFM_CLS, bd),
                    oft = DOM.offset(self.overlay);
                
                if (!overlayIfm) {
                    overlayIfm = DOM.create(IFRAME, { 'class': KS_OVERLAY_IFM_CLS });
                    bd.appendChild(overlayIfm);
                }
                self.overlayIfm = overlayIfm;
                // set overlay iframe height and position
                DOM.css(self.overlayIfm, {
                    'width': DOM.width(self.overlay) + 'px',
                    'height': DOM.height(self.overlay) + 'px',
                    'left': oft.left + 'px',
                    'top': oft.top + 'px'
                });
            }
            
            // 滚动和窗口变化时
            if (cfg.scroll) {
                tmp = 'resize';
                if (isIe6) {
                    tmp += ' scroll'
                } else {
                    DOM.addClass(self.overlay, KS_OVERLAY_FIXED);
                }
                Event.on(window, tmp, function(e){
                    self.setPosition();
                });
            }
            
            // Esc
            Event.on(document, 'keydown', function(e) {
                if (e.keyCode === 27) {
                    self.hide();
                }
            });
            
            // todo
            Event.on(self.overlay, 'click', function(e) {
                var t = e.target;
            
                switch (true) {
                    case false:
                        break;
                }
            });
            
            // 生成mask
            if (self.config.mask&&!mask) mask = new Mask();
            
            self.fire(EVENTS.AFTER_FIRST_RENDER, {});
        },
        
        _realShow: function() {
            this._toggle(DOM.removeClass);
        },
        
        /*
         * show or hide
         */ 
        _toggle: function(fn) {
            var self = this;
            fn(self.overlay, KS_HIDE_CLS);
            if (self.overlayIfm) fn(self.overlayIfm, KS_HIDE_CLS);
        },
        _setContent: function(obj, content, ev) {
            if (obj) {
                // todo: remove sth
                DOM.html(obj, content);
                this.fire(ev, {});
            }
        },
        
        /*
         * 调整位置
         * 优先级 传递参数 {left: 10, top: 10} > cfg.align
         */
        setPosition: function() {
            var self = this,
                cfg = self.config,
                leftTop = arguments[0],
                l = 0,
                t = 0,
                vW = DOM.viewportWidth(),
                vH = DOM.viewportHeight(),
                w = DOM.width(self.overlay),
                h = DOM.height(self.overlay);
            if (leftTop) {
                l = leftTop.left;
                t = leftTop.top;
            } else {
                var offset,tw,th;
                
                if (S.isPlainObject(cfg.align.node)) {
                    // 节点元素
                    offset = DOM.offset(cfg.align.node);
                    tw = DOM.width(cfg.align.node);
                    th = DOM.height(cfg.align.node);
                } else if (S.isString(cfg.align.node)) {
                    // 容器元素, 如果不存在, 使用触发元素
                    var trigger = DOM.get(cfg.align.node) || self.trigger;
                    offset = DOM.offset(trigger);
                    tw = DOM.width(trigger);
                    th = DOM.height(trigger);
                } else {
                    // 可视区域
                    offset = {left:0, top:0};
                    tw = vW;
                    th = vH;
                }
                switch (true) {
                    case cfg.align.x === POSITION.x[0]:
                        l = offset.left - w - cfg.align.offset;
                        if (cfg.align.inner) l += w + cfg.align.offset;
                        break;
                    case cfg.align.x === POSITION.x[1]:
                        l = offset.left + (tw-w)/2;
                        break;
                    case cfg.align.x === POSITION.x[2]:
                        l = offset.left + tw + cfg.align.offset;
                        if (cfg.align.inner) l -= w - cfg.align.offset;
                        break;
                    case S.isNumber(cfg.align.x):
                        if (cfg.align.inner) l = offset.left + cfg.align.x + cfg.align.offset;
                        else l = offset.left - w - cfg.align.x - cfg.align.offset;
                        break;
                }
                switch (true) {
                    case cfg.align.y === POSITION.y[0]:
                        t = offset.top - h - cfg.align.offset;
                        if (cfg.align.inner) t += h + cfg.align.offset;
                        break;
                    case cfg.align.y === POSITION.y[1]:
                        t = offset.top + (th-h)/2;
                        break;
                    case cfg.align.y === POSITION.y[2]:
                        t = offset.top + th + cfg.align.offset;
                        if (cfg.align.inner) t -= h - cfg.align.offset;
                        break;
                    case S.isNumber(cfg.align.y):
                        if (cfg.align.inner) t = offset.top + cfg.align.y + cfg.align.offset;
                        else t = offset.top - h - cfg.align.y - cfg.align.offset;
                        break;
                }
            }
            //if (l<0) l = 0;
            //if (l>vW-w) l = vW-w;
            //if (t<0) t = 0;
            //if (t>vH-h) t = vH-h;
            DOM.css(self.overlay, {
                    left: l + 'px',
                    top: t + 'px'
                    });
            if (self.overlayIfm) {
                DOM.css(this.overlayIfm, {
                    left: l + 'px',
                    top: t + 'px'
                });
            }
            self.fire(EVENTS.CHANGE_POSITION, {});
        },
        /*
         * 居中Overlay, 相对于可视区域
         */
        center: function(){
            var w = DOM.width(this.overlay),
                h = DOM.width(this.overlay),
                vw = DOM.viewportWidth(),
                vh = DOM.viewportHeight(),
                bl = (vw - w) / 2 + DOM.scrollLeft(),
                bt = (vh - w) / 2 + DOM.scrollTop();
            if (bt<0) bt = 0;
            if (bl<0) bl = 0;
            DOM.css(this.overlay, {
                left: bl + 'px',
                top: bt + 'px'
            });
            if (this.overlayIfm) {
                DOM.css(this.overlayIfm, {
                    left: bl + 'px',
                    top: bt + 'px'
                });
            }
            this.fire(EVENTS.CENTER, {});
        },

        /*
         * 
         */ 
        show: function() {
            this._preShow();
            if (this.config.mask) mask.show();
            this.fire(EVENTS.AFTER_SHOW, {});
        },
        
        /*
         * 
         */ 
        hide: function() {
            this._toggle(DOM.addClass);
            if (this.config.mask) mask.hide();
            this.fire(EVENTS.AFTER_HIDE, {});
        },
        

        /*
         * 
         */ 
        setBody: function(content) {
            this._setContent(this.body, content, EVENTS.CHANGE_BODY);
        },
        
        /*
         * 
         */
        bringToTop: function(){
            
        }
        
    });
    S.Overlay = Overlay;
    

});