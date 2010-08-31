/**
 * Dialog
 * @creator     乔花<qiaohua@taobao.com>
 * @date        2010.08.25
 * @version     1.0
 */
KISSY.add('dialog', function(S) {

    var DOM = S.DOM,
        Event = S.Event,
        Overlay = S.Overlay,
        DOT = '.',
        DIV = '<div>',
        KS_CLEAR_CLS = 'ks-clear',
        CLS_PREFIX = 'ks-dialog-',
        KS_OVERLAY_CLOSE = CLS_PREFIX+'close',
        KS_OVERLAY_HEAD_CLS = CLS_PREFIX+'hd',
        KS_OVERLAY_FOOT_CLS = CLS_PREFIX+'fd',
        
        /**
         * 自定义事件列表
         */
        EVENTS_CHANGE_HEADER    = "changeHeader",     // 修改hd
        EVENTS_CHANGE_FOOTER    = "changeFooter",     // 修改ft
        
        /**
         * Dialog 默认配置: 含有head, ft 包含关闭按钮, 在可视区域居中对齐, 显示背景层, 固定滚动
         */
        defaultConfig = {
            head: '',         // 头部内容, 为空时, 表示不需要这部分
            body: '正在加载...', 
            foot: '',               // 尾部, 为空时, 表示不需要这部分
            
            width: 400,
            height: 300,
            close: true,            // 显示关闭按钮
            closeCls: KS_OVERLAY_CLOSE,
            hdCls: KS_OVERLAY_HEAD_CLS,
            ftCls: KS_OVERLAY_FOOT_CLS,
            //align: {
            //    inner: true 
            //},
            mask: true,
            scroll: true
        };
    
    /*
     * DOM 
     * <body>
     *  <div class="{{KS_OVERLAY_CLS}}">
     *      <div class="{{KS_OVERLAY_HEAD_CLS}}"></div>
     *      <div class="{{KS_OVERLAY_BODY_CLS}}"></div>
     *      <div class="{{KS_OVERLAY_FOOT_CLS}}"></div>
     *  </div>
     *  <div class="{{KS_OVERLAY_MASK_CLS}}"></div>
     *  <div class="{{KS_OVERLAY_MASK_IFM_CLS}}"></div>
     *  <div class="{{KS_OVERLAY_IFM_CLS}}"></div>
     * </body>
     */
    
    /**
     * Dialog Class
     * @constructor
     */
    function Dialog(trigger, cfg) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Dialog)) {
            return new Dialog(trigger, cfg);
        }
        Dialog.superclass.constructor.call(self, trigger, S.merge(defaultConfig, cfg));
    }
    
    S.extend(Dialog, S.Overlay);
    S.Dialog = Dialog;
    
    S.augment(Dialog, S.EventTarget, {
        _preShow: function(){
            var self = this,
                cfg = self.config;
            
            Dialog.superclass._preShow.call(self);
            
            self.head = DOM.get(DOT+cfg.hdCls, self.overlay);
            self.foot = DOM.get(DOT+cfg.ftCls, self.overlay);
            
            if (cfg.head||cfg.close) {
                if (!self.head) {
                    self.head = DOM.create(DIV, { 'class': cfg.hdCls });
                }
                DOM.insertBefore(self.head, self.body);
                
                if (cfg.head) self.setHeader(cfg.head);
                if (cfg.close) self.head.appendChild(DOM.create(DIV, { 'class': cfg.closeCls }));
            }
            
            if (cfg.foot) {
                if (!self.foot) {
                    self.foot = DOM.create(DIV, { 'class': cfg.ftCls });
                }
                self.overlay.appendChild(self.foot);
            }
            
            Event.on(self.overlay, 'click', function(e) {
                var t = e.target;
            
                switch (true) {
                    case DOM.hasClass(t, cfg.closeCls):
                        e.halt();
                        self.hide();
                        break;
                }
            });
        },
        
        /*
         * 
         */ 
        setHeader: function(content) {
            if (this.head) {
                DOM.html(this.head, content);
                this.fire(EVENTS_CHANGE_HEADER);
            }
        },
        
        /*
         * 
         */ 
        setFooter: function(content) {
            if (this.foot) {
                DOM.html(this.foot, content);
                this.fire(EVENTS_CHANGE_FOOTER);
            }
        }
    });
}, { host: 'overlay' } );
