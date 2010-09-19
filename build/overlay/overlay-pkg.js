/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 19 17:41
*/
/**
 * KISSY Mask
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('mask', function(S, undefined) {

    var DOM = S.DOM,
        DISPLAY = 'display',
        ie = S.UA.ie,
        ie6 = ie === 6,

        MASK_STYLE = 'position:absolute;left:0;top:0;width:100%;border:0;background:black;z-index:9998;display:none;',
        SHIM_STYLE = 'position:absolute;z-index:9997;border:0;display:none;',

        defaultConfig = {
            shim: false,
            opacity: .6,
            style: ''
        };
    /*
     * Mask Class
     * @constructor
     * attached members：
     *   - this.iframe
     *   - this.config
     *   - this.layer
     */
    function Mask(config){

        if (!(this instanceof Mask)) {
            return new Mask(config);
        }

        config = S.merge(defaultConfig, config);

        var isShim = config.shim,
            style = isShim ? SHIM_STYLE : MASK_STYLE + config.style,
            opacity = isShim ? 0 : config.opacity,
            ifr = createMaskElem('<iframe>', style, opacity, !isShim);

        if (!isShim && ie) this.layer = createMaskElem('<div>', style, opacity, true);

        this.config = config;
        this.iframe = ifr;
    }

    S.augment(Mask, {

        show: function() {
            DOM.show([this.iframe, this.layer]);
        },

        hide: function() {
            DOM.hide([this.iframe, this.layer]);
        },

        toggle: function() {
            var isVisible = DOM.css(this.iframe, DISPLAY) !== 'none';
            this[isVisible ? 'hide' : 'show']();
        },

        setSize: function(w, h) {
            setSize(this.iframe, w, h);
            setSize(this.layer, w, h);
        },

        setOffset: function(x, y) {
            var offset = x;

            if (y !== undefined) {
                offset = {
                    left: x,
                    top: y
                }
            }
            DOM.offset([this.iframe, this.layer], offset);
        }
    });

    function createMaskElem(tag, style, opacity, setWH) {
        var elem = DOM.create(tag);

        DOM.attr(elem, 'style', style);
        DOM.css(elem, 'opacity', opacity);

        if (setWH) {
            DOM.height(elem, DOM.docHeight());
            if (ie6) {
                DOM.width(elem, DOM.docWidth());
            }
        }

        document.body.appendChild(elem);
        return elem;
    }

    function setSize(elem, w, h) {
        if (elem) {
            DOM.width(elem, w);
            DOM.height(elem, h);
        }
    }

    S.Mask = Mask;
});
/**
 * KISSY Overlay
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, Event = S.Event,
        ie6 = S.UA.ie === 6,

        DOT = '.', KEYDOWN = 'keydown',
        POSITION_ALIGN = {
            TL: 'tl',
            TC: 'tc',
            TR: 'tr',
            LC: 'cl',
            CC: 'cc',
            RC: 'cr',
            BL: 'bl',
            BC: 'bc',
            BR: 'br'
        },

        CLS_CONTAINER = 'ks-overlay',
        CLS_PREFIX = CLS_CONTAINER + '-',

        EVT_SHOW = 'show',
        EVT_HIDE = 'hide',

        /**
         * 默认设置
         */
        defaultConfig = {
            /*
             * DOM 结构
             *  <div class="ks-overlay-container">
             *      <div class="ks-overlay-bd"></div>
             *  </div>
             */
            container: null,
            containerCls: CLS_CONTAINER,
            //content: undefined,      // 默认为 undefined, 不设置
            bdCls: CLS_PREFIX + 'bd',

            trigger: null,
            triggerType: 'click',   // 触发类型

            width: 0,
            height: 0,
            zIndex: 9999,

            xy: null,               // 相对 page 定位, 有效值为 [n, m]
            align: {                // 相对指定 node or viewport 定位
                node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
                points: [POSITION_ALIGN.CC, POSITION_ALIGN.CC], // ['tl', 'tr'] 表示 overlay 的 tl 与参考节点的 tr 对齐
                offset: [0,0]       // 有效值为 [n, m]
            },

            mask: false,            // 是否显示蒙层, 默认不显示
            shim: ie6
        },

        DEFAULT_STYLE = 'visibility:hidden;position:absolute;',
        TMPL = '<div class="{containerCls}" style="' + DEFAULT_STYLE + '"><div class="{bdCls}">{content}</div></div>',

        mask;

    /*
     * Overlay Class
     * @constructor
     * attached members：
     *   - this.container
     *   - this.trigger
     *   - this.config
     *   - this.body
     *   - this.shim
     */
    function Overlay(container, config) {
        var self = this;
        config = config || { };

        // 支持 Overlay(config)
        if (S.isPlainObject(container)) {
            config = container;
        } else {
            config.container = container;
        }

        // 获取相关联的 DOM 节点
        self.container = S.get(config.container);
        
        self.trigger = S.get(config.trigger);

        // 合并配置信息
        config.align = S.merge(S.clone(defaultConfig.align), config.align);
        self.config = S.merge(defaultConfig, config);

        self._init();
    }

    S.augment(Overlay, S.EventTarget, {

        _init: function() {
            if (this.trigger) {
                this._bindTrigger();
            }
        },

        _bindTrigger: function() {
            var self = this;

            if (self.config.triggerType === 'mouse') {
                self._bindTriggerMouse();
            } else {
                self._bindTriggerClick();
            }
        },

        _bindTriggerMouse: function() {
            var self = this,
                trigger = self.trigger, timer;

            Event.on(trigger, 'mouseenter', function() {
                self._clearHiddenTimer();

                timer = S.later(function() {
                    self.show();
                    timer = undefined;
                }, 100);
            });

            Event.on(trigger, 'mouseleave', function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }

                self._setHiddenTimer();
            });
        },

        _bindContainerMouse: function() {
            var self = this;

            Event.on(self.container, 'mouseleave', function() {
                self._setHiddenTimer();
            });

            Event.on(self.container, 'mouseenter', function() {
                self._clearHiddenTimer();
            });
        },

        _setHiddenTimer: function() {
            var self = this;
            self._hiddenTimer = S.later(function() {
                self.hide();
            }, 120);
        },

        _clearHiddenTimer: function() {
            var self = this;
            if (self._hiddenTimer) {
                self._hiddenTimer.cancel();
                self._hiddenTimer = undefined;
            }
        },

        _bindTriggerClick: function() {
            var self = this;

            Event.on(self.trigger, 'click', function(e) {
                e.halt();
                self.show();
            });
        },

        show: function() {
            this._firstShow();
        },

        _firstShow: function() {
            var self = this;

            self._prepareMarkup();
            self._realShow();
            self._firstShow = self._realShow;
        },

        _realShow: function() {
            this._setPosition();
            this._toggle(false);
        },

        _toggle: function(isVisible) {
            var self = this;

            DOM.css(self.container, 'visibility', isVisible ? 'hidden' : '');

            if(self.shim) self.shim.toggle();
            if (self.config.mask) mask[isVisible ? 'hide' : 'show']();

            self[isVisible ? '_unbindUI' : '_bindUI']();
            self.fire(isVisible ? EVT_HIDE : EVT_SHOW);
        },


        hide: function() {
            this._toggle(true);
        },

        _prepareMarkup: function() {
            var self = this, config = self.config, container = self.container;

            // 多个 Overlay 实例共用一个 mask
            if (config.mask && !mask) {
                mask = new S.Mask();
            }
            if (config.shim) {
                self.shim = new S.Mask({ shim: true });
            }

            // 已有 Markup
            if (container) {
                // 已有 markup 可以很灵活，如果没有 bdCls, 就让 body 指向 container
                self.body = S.get(DOT + config.bdCls, container) || container;

                container.style.cssText += DEFAULT_STYLE;
            }
            // 构建 DOM
            else {
                container = self.container = DOM.create(S.substitute(TMPL, config));
                self.body = DOM.children(container)[0];
                doc.body.appendChild(container);
            }

            DOM.css(container, 'zIndex', config.zIndex);

            self.setBody(config.content);
            self._setSize();

            if (config.triggerType === 'mouse') self._bindContainerMouse();
        },

        _setSize: function(w, h) {
            var self = this,
                config = self.config;

            w = w || config.width;
            h = h || config.height;

            if (w) DOM.width(self.container, w);
            if (h) DOM.height(self.container, h);
            if (self.shim) self.shim.setSize(w, h);
        },

        _setDisplay: function(){
            var self = this;
            // 防止其他地方设置 display: none 后, 无法再次显示
            if (DOM.css(self.container, 'display') === 'none') {
                DOM.css(self.container, 'display', 'block');
            }
        },

        _setPosition: function() {
            var self = this, xy = self.config.xy;

            if (xy) {
                self.move(xy);
            } else {
                self._setDisplay();
                self.align();
            }
        },

        move: function(x, y) {
            var self = this, offset;

            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            offset = { left: x, top: y };

            DOM.offset(self.container, offset);
            if(self.shim) self.shim.setOffset(offset);
        },

        align: function(node, points, offset) {
            var self = this, alignConfig = self.config.align, xy, diff, p1, p2;

            node = node || alignConfig.node;
            if (node === 'trigger') node = self.trigger;
            else node = S.get(node);

            points = points || alignConfig.points;

            offset = offset === undefined ? alignConfig.offset : offset;
            xy = DOM.offset(self.container);

            // p1 是 node 上 points[0] 的 offset
            // p2 是 overlay 上 points[1] 的 offset
            p1 = self._getAlignOffset(node, points[0]);
            p2 = self._getAlignOffset(self.container, points[1]);
            diff = [p2.left - p1.left, p2.top - p1.top];

            self.move(xy.left - diff[0] + (+offset[0]), xy.top - diff[1] + (+offset[1]));
        },

        /**
         * 获取 node 上的 align 对齐点 相对 page 的坐标
         */
        _getAlignOffset: function(node, align) {
            var V = align.charAt(0),
                H = align.charAt(1),
                offset, w, h, x, y;

            if (node) {
                offset = DOM.offset(node);
                w = node.offsetWidth;
                h = node.offsetHeight;
            } else {
                offset = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
                w = DOM.viewportWidth();
                h = DOM.viewportHeight();
            }

            x = offset.left;
            y = offset.top;

            if (V === 'c') {
                y += h / 2;
            } else if (V === 'b') {
                y += h;
            }

            if (H === 'c') {
                x += w / 2;
            } else if (H === 'r') {
                x += w;
            }

            return { left: x, top: y };
        },

        center: function() {
            var self = this;

            self.move(
                (DOM.viewportWidth() - DOM.width(self.container)) / 2 + DOM.scrollLeft(),
                (DOM.viewportHeight() - DOM.height(self.container)) / 2 + DOM.scrollTop()
                );
        },

        _bindUI: function() {
            Event.on(doc, KEYDOWN, this._esc, this);
        },

        _unbindUI: function() {
            Event.remove(doc, KEYDOWN, this._esc, this);
        },
        
        _esc: function(e) {
            if (e.keyCode === 27) this.hide();
        },

        setBody: function(html) {
            this._setContent('body', html);
        },

        _setContent: function(where, html) {
            if(S.isString(html)) DOM.html(this[where], html);
        }
    });

    S.Overlay = Overlay;

});

/**
 * TODO:
 *  - stackable ? 
 *  - constrain 支持可视区域或指定区域 ?
 *  - effect
 *  - draggable
 */
/**
 * KISSY Popup
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('popup', function(S) {

    var defaultConfig = {
        triggerType: 'mouse', // 触发类型, click, mouse
        align: {
            node: 'trigger',
            points: ['cr', 'ct'],
            offset: [10, 0]
        }
    };

    /**
     * Popup Class
     * @constructor
     */
    function Popup(container, config) {
        var self = this;

        if (!(self instanceof Popup)) {
            return new Popup(container, config);
        }

        config = config || { };
        if (S.isPlainObject(container)) config = container;
        else config.container = container;
        config.align = S.merge(S.clone(defaultConfig.align), config.align);

        Popup.superclass.constructor.call(self, S.merge(defaultConfig, config));
    }

    S.extend(Popup, S.Overlay);
    S.Popup = Popup;

}, { host: 'overlay' });
/**
 * KISSY.Dialog
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    var DOM = S.DOM, Event = S.Event,

        DOT = '.', DIV = '<div>',

        CLS_CONTAINER = 'ks-overlay ks-dialog',
        CLS_PREFIX = 'ks-dialog-',

        defaultConfig = {
            /*
             * DOM 结构
             *  <div class="ks-overlay ks-dialog">
             *      <div class="ks-dialog-hd">
             *          <div class="ks-dialog-close"></div>
             *      </div>
             *      <div class="ks-dialog-bd"></div>
             *      <div class="ks-dialog-ft"></div>
             *  </div>
             */
            header: '',
            footer: '',

            containerCls: CLS_CONTAINER,
            hdCls: CLS_PREFIX + 'hd',
            bdCls: CLS_PREFIX + 'bd',
            ftCls: CLS_PREFIX + 'ft',
            closeBtnCls: CLS_PREFIX + 'close',

            width: 400,
            height: 300,
            closable: true
        };

    /**
     * Dialog Class
     * @constructor
     * attached members：
     *  - this.header
     *  - this.footer
     *  - this.manager
     */
    function Dialog(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Dialog)) {
            return new Dialog(container, config);
        }

        config = config || { };
        if (S.isPlainObject(container)) config = container;
        else config.container = container;
        config.align = S.merge(S.clone(defaultConfig.align), config.align);
        
        Dialog.superclass.constructor.call(self, S.merge(defaultConfig, config));

        self.manager = S.DialogManager;
        self.manager.register(self);
    }

    S.extend(Dialog, S.Overlay);
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, {

        _prepareMarkup: function() {
            var self = this,
                config = self.config;

            Dialog.superclass._prepareMarkup.call(self);

            self.header = S.get(DOT + config.hdCls, self.container);
            if (!self.header) {
                self.header = DOM.create(DIV, { 'class': config.hdCls });
                DOM.insertBefore(self.header, self.body);
            }
            self.setHeader(config.header);

            if (config.footer) {
                self.footer = S.get(DOT + config.ftCls, self.container);
                if (!self.footer) {
                    self.footer = DOM.create(DIV, { 'class': config.ftCls });
                    self.container.appendChild(self.footer);
                }
                self.setFooter(config.footer);
            }

            if (config.closable) self._initClose();
        },

        _initClose: function() {
            var self = this, config = self.config,
                elem = DOM.create(DIV, { 'class': config.closeBtnCls });

            DOM.html(elem, 'close');
            
            Event.on(elem, 'click', function(e) {
                e.halt();
                self.hide();
            });

            self.header.appendChild(elem);
        },

        setHeader: function(html) {
            this._setContent('header', html);
        },

        setFooter: function(html) {
            this._setContent('footer', html);
        }
    });

    S.DialogManager = {

        register: function(dlg) {
            if (dlg instanceof Dialog) {
                this._dialog.push(dlg);
            }
        },

        _dialog: [],

        hideAll: function() {
            S.each(this._dialog, function(dlg) {
                dlg && dlg.hide();
            })
        }
    };

}, { host: 'overlay' });

/**
 * TODO:
 *  - S.guid() 唯一标识
 */


/**
 *  auto render
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('autorender', function(S) {

    /**
     * 自动渲染 container 元素内的所有 Overlay 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="Popup" data-widget-config="{...}">
     */
    S.Overlay.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        S.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;

            if (type && ('Dialog Popup'.indexOf(type) > -1)) {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new S[type](elem, S.JSON.parse(config));
                } catch(ex) {
                    S.log('Overlay.autoRender: ' + ex, 'warn');
                }
            }
        });
    }

}, { host: 'overlay' } );
