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
        EVENTS_AFTER_INIT          = "afterInit",        // 初始化之后
        EVENTS_AFTER_FIRST_RENDER  = "afterFirstRender", // 第一次填充内容后
        EVENTS_CHANGE_BODY         = "changeBody",       // 修改bg
        EVENTS_CENTER              = "center",           // center后
        EVENTS_CHANGE_POSITION     = "changePosition",   // 位置改变之后
        EVENTS_SHOW                = "onShow",           // show
        EVENTS_HIDE                = "onHide",            // hide
        /**
         * 默认设置
         */
        defaultConfig = {
            // 结构
            srcNode: null,          // 元素节点, 默认为null, 新建一个节点
            body: '',               // 主体
            
            // 内容, 数据
            //url: '',                // 不设置时为静态数据, 设置时请求数据后替换body
            
            // 其他
            triggerType: 'click',   // 触发事件
            
            // 样式
            overlayCls: KS_OVERLAY_CLS,
            bdCls: KS_OVERLAY_BODY_CLS,
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
        //self.overlay = null;
        
        /**
         * body
         * @type HTMLElement
         */
        //self.body = null;
        self._init();
        
    }
    
    S.augment(Overlay, S.EventTarget, {
        _init: function(){
            var self = this, timer;
            lazyRun(self, '_preShow', '_realShow');
            
            // 处理不同的触发类型
            if (self.trigger) {
                if (self.config.triggerType === 'mouse') {
                    Event.on(self.trigger, 'mouseenter', function(e){
                        timer = S.later(function(){
                            self.show();
                            timer.cancel();
                        }, 300);
                    });
                    Event.on(self.trigger, 'mouseleave', function(e){
                        if (timer) timer.cancel();
                        if (self.overlay&&!DOM.hasClass(self.overlay, KS_HIDE_CLS)) self.hide();
                    });
                    
                } else {
                    Event.on(self.trigger, 'click', function(e){
                        self.show();
                    });
                }
            }
            self.fire(EVENTS_AFTER_INIT);
        },
        _preShow: function() {
            var self = this,
                cfg = self.config,
                tmp,
                bd = document.body;
            
            // 现有节点 或 已有 DOM 结构基础上
            if (S.isPlainObject(cfg.srcNode)) {
                self.overlay = cfg.srcNode;
            } else if (S.isString(cfg.srcNode)) {
                self.overlay = DOM.get(cfg.srcNode);
            }
            if (self.overlay) {
                self.body = DOM.get(DOT+cfg.bdCls, self.overlay);
                DOM.removeClass(self.overlay, KS_HIDE_CLS);
            } else {
                // 构建基本 DOM 
                tmp = [['overlay', cfg.overlayCls], ['body', cfg.bdCls]];
                S.each(tmp, function(t,i){
                    self[t[0]] = DOM.create(DIV, { 'class': t[1] });
                    DOM.html(self[t[0]], cfg[t[0]]||'');
                });
                
                self.overlay.appendChild(self.body);
                
                bd.appendChild(self.overlay);
                
                // 设置大小
                if (cfg.width) DOM.width(self.overlay, cfg.width);
                if (cfg.height) DOM.height(self.overlay, cfg.height);
                // 调整位置
                self.setPosition();
            }
            
            // IE6或者需要shim时 增加对应iframe
            if (cfg.shim) self._shim();
            
            if (cfg.scroll) self._scrollOrResize();
            
            // Esc
            Event.on(document, 'keydown', function(e) {
                if (e.keyCode === 27)  self.hide();
            });
            
            // 生成mask
            if (cfg.mask&&!mask) try{mask = new S.Mask();}catch(e){S.log('need S.Mask');}
            
            self.fire(EVENTS_AFTER_FIRST_RENDER);
        },
        
        /**
         * 滚动和窗口变化时
         */
        _scrollOrResize: function(){
            var self = this, tmp = 'resize';
            if (isIe6) {
                tmp += ' scroll'
            } else {
                DOM.addClass(self.overlay, KS_OVERLAY_FIXED);
            }
            Event.on(window, tmp, function(e){
                self.setPosition();
            });
        },
        /**
         *  Add Shim Layer
         */
        _shim: function(){
            var self = this,
                overlayIfm;
            
            overlayIfm = DOM.create(IFRAME, { 'class': KS_OVERLAY_IFM_CLS });
            document.body.appendChild(overlayIfm);
            
            self.overlayIfm = overlayIfm;
            // set overlay iframe height and position
            DOM.width(self.overlayIfm, DOM.width(self.overlay));
            DOM.height(self.overlayIfm, DOM.height(self.overlay));
            DOM.offset(self.overlayIfm, DOM.offset(self.overlay));
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
        
        /*
         * 调整位置
         * 优先级 传递参数 {left: 10, top: 10} > cfg.align
         */
        setPosition: function() {
            var self = this,
                leftTop = arguments[0];
            if (!leftTop) {
                var align = self.config.align,
                    align_node = align.node,
                    align_offset = align.offset,
                    align_inner = align.inner,
                    w = DOM.width(self.overlay),
                    h = DOM.height(self.overlay),
                    offset, tw, th, l = 0, t = 0,
                    tmp;
                
                if (S.isPlainObject(align_node)) {
                    // 节点元素
                    tmp = align_node;
                } else if (S.isString(align_node)) {
                    // 容器元素, 如果不存在, 使用触发元素
                    tmp = DOM.get(align_node) || self.trigger;
                }
                if (tmp) {
                    offset = DOM.offset(tmp);
                    tw = DOM.width(tmp);//tmp.clientWidth;
                    th = DOM.height(tmp);//tmp.clientHeight;
                } else {
                    // 可视区域
                    offset = {left:0, top:0};
                    tw = DOM.viewportWidth();//document.body.clientWidth;
                    th = DOM.viewportHeight();
                }
                if (align.x === POSITION.x[0]) {
                    l = offset.left - w - align_offset;
                    if (align_inner) l += w + align_offset;
                } else if (align.x === POSITION.x[1]) {
                    l = offset.left + (tw-w)/2;
                } else if (align.x === POSITION.x[2]) {
                    l = offset.left + tw + align_offset;
                    if (align_inner) l -= w - align_offset;
                } else if (S.isNumber(align.x)) {
                    if (align_inner) l = offset.left + align.x + align_offset;
                    else l = offset.left - w - align.x - align_offset;
                }
                if (align.y === POSITION.y[0]) {
                    t = offset.top - h - align_offset;
                    if (align_inner) t += h + align_offset;
                } else if (align.y === POSITION.y[1]) {
                    t = offset.top + (th-h)/2;
                } else if (align.y === POSITION.y[2]) {
                    t = offset.top + th + align_offset;
                    if (align_inner) t -= h - align_offset;
                } else if (S.isNumber(align.y)) {
                    if (align_inner) t = offset.top + align.y + align_offset;
                    else t = offset.top - h - align.y - align_offset;
                }
                // 当可视区域宽高小于元素宽高时或者其他情况导致left, top为负值时, 取0
                //if (l<0) l = 0; if (t<0) t = 0;
                leftTop = {left: l+DOM.scrollLeft(), top: t+DOM.scrollTop()};
            }
            DOM.offset(self.overlay, leftTop);
            if (self.overlayIfm) DOM.offset(self.overlayIfm, leftTop);
            self.fire(EVENTS_CHANGE_POSITION);
        },
        /*
         * 居中Overlay, 相对于可视区域
         */
        center: function(){
            var self = this,
                oft = {
                    left: (DOM.viewportWidth() - DOM.width(self.overlay)) / 2 + DOM.scrollLeft(),
                    top: (DOM.viewportHeight() - DOM.width(self.overlay)) / 2 + DOM.scrollTop()
                };
            DOM.offset(self.overlay, oft);
            if (self.overlayIfm) DOM.css(self.overlayIfm, oft);
            self.fire(EVENTS_CENTER);
        },

        /*
         * 
         */ 
        show: function() {
            this._preShow();
            if (this.config.mask&&mask) mask.show();
            this.fire(EVENTS_SHOW);
        },
        
        /*
         * 
         */ 
        hide: function() {
            this._toggle(DOM.addClass);
            if (this.config.mask&&mask) mask.hide();
            this.fire(EVENTS_HIDE);
        },
        

        /*
         * 
         */ 
        setBody: function(content) {
            if (this.body) {
                DOM.html(this.body, content);
                this.fire(EVENTS_CHANGE_BODY);
            }
        },
        
        /*
         * 
         */
        bringToTop: function(){
            
        }
        
    });
    S.Overlay = Overlay;
    
    S.Overlay.all = function(trigger, cfg, type) {
        var ret = [];
        if (S.isString(trigger)) {
            trigger = DOM.query(trigger);
        }
        if (!type) type = 'Overlay';
        S.each(trigger, function(t) {
            ret.push(new S[type](t, cfg));
        });
        return ret;
    }
});
