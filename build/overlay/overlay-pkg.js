/*
Copyright 2010, KISSY UI Library v1.1.3
MIT Licensed
build time: Sep 13 10:15
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

    function Mask(config){

        if (!(this instanceof Mask)) {
            return new Mask(config);
        }

        config = S.merge(defaultConfig, config);

        var isShim = config.shim,
            ifr = DOM.create('<iframe>');

        DOM.attr(ifr, 'style', isShim ? SHIM_STYLE : MASK_STYLE + config.style);

        var tmp;
        if(isShim) config.opacity = 0;
        else {
            DOM.height(ifr, DOM.docHeight());
            if (ie6) {
                DOM.width(ifr, DOM.docWidth());
            }
            if (ie){
                tmp = DOM.create('<div>');
                DOM.attr(tmp, 'style', MASK_STYLE + config.style);
                DOM.height(tmp, DOM.docHeight());
                if (ie6) {
                    DOM.width(tmp, DOM.docWidth());
                }
            }
        }
        DOM.css(ifr, 'opacity', config.opacity);
        document.body.appendChild(ifr);

        if (tmp) {
            DOM.css(tmp, 'opacity', config.opacity);
            document.body.appendChild(tmp);
            this.div = tmp;
        }

        this.config = config;
        this.iframe = ifr;
    }

    S.augment(Mask, {

        show: function() {
            DOM.css(this.iframe, DISPLAY, 'block');
            if (ie) DOM.css(this.div, DISPLAY, 'block');
        },

        hide: function() {
            DOM.css(this.iframe, DISPLAY, 'none');
            if (ie) DOM.css(this.div, DISPLAY, 'none');
        },

        toggle: function() {
            var isVisible = DOM.css(this.iframe, DISPLAY) !== 'none';
            this[isVisible ? 'hide' : 'show']();
        },

        setSize: function(w, h) {
            DOM.width(this.iframe, w);
            DOM.height(this.iframe, h);
            if (ie) {
                DOM.width(this.div, w);
                DOM.height(this.div, h);
            }
        },

        setOffset: function(x, y) {
            var offset = x;

            if (y !== undefined) {
                offset = {
                    left: x,
                    top: y
                }
            }
            DOM.offset(this.iframe, offset);
            if (ie) {
                DOM.offset(this.div, offset);
            }
        }
    });

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

            xy: null,               // 相对 page 定位，有效值为 [n, m]
            align: {                // 相对指定 node or viewport 定位
                node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
                points: [POSITION_ALIGN.CC, POSITION_ALIGN.CC], // ['tl', 'tr'] 表示 overlay 的 tl 与参考节点的 tr 对齐
                offset: [0,0]       // 有效值为 [n, m]
            },

            mask: false,            // 是否显示蒙层, 默认不显示
            shim: ie6
        },

        DEFAULT_STYLE = 'position:absolute;visibility:hidden',
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
            var self = this, trigger = self.trigger, timer;

            Event.on(trigger, 'mouseenter', function() {
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
                self.hide();
            });
        },

        _bindTriggerClick: function() {
            var self = this;

            Event.on(self.trigger, 'click', function() {
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
            DOM.css(container, 'display', 'block'); // 强制去除内联 style 中的 display: none

            self.setBody(config.content);
            self._setSize();
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

        _setPosition: function() {
            var self = this, xy = self.config.xy;

            if (xy) {
                self.move(xy);
            } else {
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
            if(S.isString(html)) DOM.html(this.body, html);
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
        triggerType: 'mouse',
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
