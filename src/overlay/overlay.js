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
            node: null,         // 参考元素, null为可视区域, ''为触发元素, 其他为指定元素
            x: POSITION.x[1],   // l, c, r, or interger
            y: POSITION.y[1],   // t, c, b, or interger
            inner: false,       // x,y参照容器内部还是外部, 单一值或 [x, y]
            offset: 0           // x,y方向上的偏移, 单一值或 [x, y]
        },
        
        /**
         * 所有自定义事件列表
         */
        EVENTS_AFTER_INIT          = "afterInit",        // 初始化之后
        EVENTS_AFTER_FIRST_RENDER  = "afterFirstRender", // 第一次填充内容后
        EVENTS_CHANGE_BODY         = "changeBody",       // 修改bg
        EVENTS_CENTER              = "center",           // center后
        EVENTS_CHANGE_POSITION     = "changePosition",   // 位置改变之后
        EVENTS_CHANGE_SIZE         = "changeSize",       // 大小改变之后
        EVENTS_SHOW                = "onShow",           // show
        EVENTS_HIDE                = "onHide",           // hide
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
            containerCls: KS_OVERLAY_CLS,
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
        
        // 配置信息
        if (cfg) cfg.align = S.merge(DEFAULT_ALIGN, cfg.align);
        self.config = S.merge(defaultConfig, cfg);
        // x,y轴方向上偏移, 支持 [x, y] or x  
        cfg.align.offset = S.makeArray(cfg.align.offset);
        cfg.align.inner = S.makeArray(cfg.align.inner);
        
        self._init();
    }
    
    S.augment(Overlay, S.EventTarget, {
        /**
         * Constructor
         */
        _init: function(){
            var self = this;
            lazyRun(self, '_preShow', '_realShow');
            
            // 处理不同的触发类型
            if (self.trigger) {
                var tt = self.config.triggerType;
                self['_trigger'+tt.charAt(0).toUpperCase()+tt.substring(1,tt.length)]();
            }
            self.fire(EVENTS_AFTER_INIT);
        },
        /**
         * 触发事件为mouse时
         */
        _triggerMouse: function(){
            var self = this, timer;
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
        },
        /**
         * 触发事件为点击
         */
        _triggerClick: function(){
            var self = this;
            Event.on(this.trigger, 'click', function(){
                self.show();
            });
        },
        /**
         * 初次显示时, 构建DOM
         */
        _preShow: function() {
            var self = this,
                cfg = self.config,
                tmp,
                bd = document.body;
            
            // IE6或者需要shim时 增加对应iframe
            if (cfg.shim) self._shim();
            // 生成mask
            if (cfg.mask&&!mask) try{mask = new S.Mask();}catch(e){S.log('need S.Mask');}
            
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
                tmp = [['overlay', cfg.containerCls], ['body', cfg.bdCls]];
                S.each(tmp, function(t,i){
                    self[t[0]] = DOM.create(DIV, { 'class': t[1] });
                    DOM.html(self[t[0]], cfg[t[0]]||'');
                });
                
                self.overlay.appendChild(self.body);
                
                bd.appendChild(self.overlay);
                
                self._extraContent();
                // 调整位置
                self.setPosition();
            }
            self.fire(EVENTS_AFTER_FIRST_RENDER);
        },
        /** 在设施大小之前, 如果需要添加其他内容的话, 这里加入, 然后再设置大小
         */
        _extraContent: function(){
            // 设置大小
            this.setSize();
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
        },
        
        /*
         * 调整Overlay位置
         * 优先级 传递参数 {left: 10, top: 10} > cfg.align.x, cfg.align.y
         */
        setPosition: function() {
            var self = this,
                leftTop = arguments[0];
            if (!leftTop) {
                var align = self.config.align,
                    align_node = align.node,
                    align_offset_x = align.offset[0]||0,
                    align_offset_y = align.offset[1]||0,
                    align_inner_x = align.inner[0]||false,
                    align_inner_y = align.inner[1]||false,
                    w = DOM.width(self.overlay),
                    h = DOM.height(self.overlay),
                    offset, tw, th, l = 0, t = 0, tmp;
                
                if (S.isPlainObject(align_node)) tmp = align_node; // 节点元素
                else if (S.isString(align_node)) tmp = DOM.get(align_node) || self.trigger; // 容器元素, 如果不存在, 使用触发元素
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
                    l = offset.left - w - align_offset_x;
                    if (align_inner_x) l += w + align_offset_x;
                } else if (align.x === POSITION.x[1]) {
                    l = offset.left + (tw-w)/2;
                } else if (align.x === POSITION.x[2]) {
                    l = offset.left + tw + align_offset_x;
                    if (align_inner_x) l -= w - align_offset_x;
                } else if (S.isNumber(align.x)) {
                    if (align_inner_x) l = offset.left + align.x + align_offset_x;
                    else l = offset.left - w - align.x - align_offset_x;
                }
                if (align.y === POSITION.y[0]) {
                    t = offset.top - h - align_offset_y;
                    if (align_inner_y) t += h + align_offset_y;
                } else if (align.y === POSITION.y[1]) {
                    t = offset.top + (th-h)/2;
                } else if (align.y === POSITION.y[2]) {
                    t = offset.top + th + align_offset_y;
                    if (align_inner_y) t -= h - align_offset_y;
                } else if (S.isNumber(align.y)) {
                    if (align_inner_y) t = offset.top + align.y + align_offset_y;
                    else t = offset.top - h - align.y - align_offset_y;
                }
                // 当可视区域宽高小于元素宽高时或者其他情况导致left, top为负值时, 取0 ? 是否需要置0还是保持原样
                //if (l<0) l = 0;
                //if (t<0) t = 0;
                // 如果是相对于可视区域, 滚动时加上滚动的距离
                if (!tmp) {
                    l += DOM.scrollLeft();
                    t += DOM.scrollTop();
                }
                leftTop = {left: l, top: t};
            }
            DOM.offset(self.overlay, leftTop);
            // 改变overlay位置时, 同时改变overlayIfm的位置
            if (self.overlayIfm) DOM.offset(self.overlayIfm, leftTop);
            
            self.fire(EVENTS_CHANGE_POSITION);
        },
        
        /*
         * 居中Overlay, 相对于可视区域
         */
        center: function(){
            var self = this,
                oft = {
                    left: (DOM.viewportWidth() - DOM.width(self.overlay)) / 2,
                    top: (DOM.viewportHeight() - DOM.width(self.overlay)) / 2
                };
            //if (oft.left<0) oft.left = 0;
            //if (oft.top<0) oft.top = 0;
            oft.left += DOM.scrollLeft(); 
            oft.top += DOM.scrollTop();
            self.setPosition(oft);
            self.fire(EVENTS_CENTER);
        },
        
        /*
         * 设置overlay宽高时, 同时改变overlayIfm的宽高
         * 优先级 传递参数 w, h > cfg.width, cfg.height
         */
        setSize: function(w, h) {
            var self = this,
                cfg = self.config,
                w = arguments[0]||cfg.width,
                h = arguments[1]||cfg.height;
            if (w) DOM.width(self.overlay, w);
            if (h) DOM.height(self.overlay, h);
            
            if (self.overlayIfm) {
                DOM.width(self.overlayIfm, w);
                DOM.height(self.overlayIfm, h);
            }
            self.fire(EVENTS_CHANGE_SIZE);
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
        
        
        /**
         * 绑定Overlay上的事件, 包含ESC, 滚动和窗口变化时
         */
        _bindUI: function(){
            var self = this,
                cfg = self.config;
            
            if (cfg.scroll) {
                if (isIe6) Event.on(window, 'scroll', self._position, self);
                else DOM.addClass(self.overlay, KS_OVERLAY_FIXED);
            }
            //Event.on(window, 'resize', self._position, self); 暂时去掉resize
            Event.on(document, 'keydown', self._esc, self);
        },
        _esc: function(e){
            if (e.keyCode === 27)  this.hide();
        },
        _position: function(e){
            this.setPosition();
        },
        /**
         * 窗口隐藏时删除事件
         */
        _unbindUI: function(){
            var self = this,
                cfg = self.config;
            
            if (cfg.scroll&&isIe6) Event.remove(window, 'scroll', self._position, self);
            //Event.remove(window, 'resize', self._position, self);
            Event.remove(document, 'keydown', self._esc, self);
        },

        /*
         * 
         */ 
        show: function() {
            this._preShow();
            if (this.config.mask&&mask) mask.show();
            this._bindUI();
            this.fire(EVENTS_SHOW);
        },
        
        /*
         * 
         */ 
        hide: function() {
            this._toggle(DOM.addClass);
            if (this.config.mask&&mask) mask.hide();
            this._unbindUI();
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
    
    /**
     * 提供批量生成
     */
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

/**
 * NOTES:
 *  201008
 *      - 基本功能完成
 *  201009
 *      - 分离不同逻辑
 *      - 完善位置计算
 *      - 
 *  TODO:
 *      - resize加入
 *      - 
 */
