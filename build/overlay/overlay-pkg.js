/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Nov 8 16:12
*/
/**
 * KISSY Mask
 * @creator   玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
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

        dispose: function() {
            this.iframe && DOM.remove(this.iframe);
            this.layer && DOM.remove(this.layer);
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
            DOM.width(elem, w+20);
            DOM.height(elem, h+20);
        }
    }

    S.Mask = Mask;

}, { host: 'overlay' } );
/**
 * KISSY Overlay
 * @author   玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, Event = S.Event,
        ie6 = S.UA.ie === 6,

        DOT = '.', KEYDOWN = 'keydown', EMPTY = '',
        TRIGGERTYPE = 'triggerType', MOUSE = 'mouse', MOUSEENTER = 'mouseenter', MOUSELEAVE = 'mouseleave', CLICK = 'click',
        MASK = 'mask', SHOW = 'show', HIDE = 'hide',
        BDCLS = 'bdCls', CONTENT = 'content', ZINDEX = 'zIndex', DISPLAY = 'display', WIDTH = 'width', HEIGHT = 'height',
        X = 'x', Y = 'y',

        CLS_CONTAINER = 'ks-overlay',
        CLS_PREFIX = CLS_CONTAINER + '-',

        EVENT_SHOW = SHOW,
        EVENT_HIDE = HIDE,
        EVENT_CREATE = 'create',

        DEFAULT_STYLE = 'visibility:hidden;position:absolute;',
        TMPL = '<div class="{containerCls}" style="' + DEFAULT_STYLE + '"><div class="{bdCls}">{content}</div></div>',

        mask;

    /*
     * DOM 结构
     *  <div class="ks-overlay-container">
     *      <div class="ks-overlay-bd"></div>
     *  </div>
     */

    /*
     * Overlay Class
     * @constructor
     * @param {Element=} container
     * @param {Object=} config
     * attached members：
     *  - this.container
     *  - this.trigger
     *  - this.currentTrigger
     *  - this.body
     *  - this.shim
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

        Overlay.superclass.constructor.call(self, config);

        /**
         * 获取相关联的 DOM 节点
         * @type {Element}
         */
        self.container = S.get(config.container);

        /**
         * 触发元素, 有可能多个
         * @type {Array.<Element>}
         */
        self.trigger = S.makeArray(S.query(config.trigger));

        /**
         * 当前触发元素, 默认为第一个
         * @type {Element}
         */
        self.currentTrigger = self.trigger[0];

        self._init();
    }

    S.extend(Overlay, S.Base);

    Overlay.ATTRS = {
        container: {            // 容器元素
            value: null
        },
        containerCls: {         // 容器的 class
            value: CLS_CONTAINER
        },
        bdCls: {                // 内容 class
            value: CLS_PREFIX + 'bd'
        },

        trigger: {              // 触发器, 可以是多个
            value: null
        },
        triggerType: {          // 触发类型
            value: CLICK
        },

        x: {                    // 水平方向绝对位置
            value: 0
        },
        y: {                    // 垂直方向绝对位置
            value: 0
        },
        xy: {                   // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            value: null,
            setter: function(v) {
                var self = this,
                    xy = S.makeArray(v);

                if (xy.length) {
                    xy[0] && self.set(X, xy[0]);
                    xy[1] && self.set(Y, xy[1]);
                }
                return v;
            }
        },
        width: {                // 宽度
            value: 0,
            setter: function(v) {
                return parseInt(v) || 0;
            }
        },
        height: {               // 高度
            value: 0,
            setter: function(v) {
                return parseInt(v) || 0;
            }
        },

        content: {              // 内容, 默认为 undefined, 不设置
            value: undefined
        },

        mask: {                 // 是否显示蒙层, 默认不显示
            value: false
        },
        shim: {                 // 是否需要垫片
            value: ie6
        },
        zIndex: {
            value: 9999
        }
    };

    Overlay.Plugins = [];

    S.augment(Overlay, {
        /**
         * initialize
         */
        _init: function() {
            var self = this;

            self._onAttrChanges();

            if (self.trigger.length > 0) {
                self._bindTrigger();
            }
            // init plugins
            S.each(Overlay.Plugins, function(plugin) {
                if (plugin.init) {
                    plugin.init(self);
                }
            });
        },

        _onAttrChanges: function() {
            var self = this;

            self.on('afterContainerChange', function(e) {
                /**
                 * 获取相关联的 DOM 节点
                 * @type {Element}
                 */
                self.container = S.get(e.newVal);
            });

            self.on('afterTriggerChange', function(e) {
                /**
                 * 触发元素, 有可能多个
                 * @type {Array.<Element>}
                 */
                self.trigger = S.makeArray(S.query(e.newVal));
                self.currentTrigger = self.trigger[0];
            });

            self.on('afterXChange', function(e) {
                var offset = {left: e.newVal};

                DOM.offset(self.container, offset);
                if (self.shim) self.shim.setOffset(offset);
            });

            self.on('afterYChange', function(e) {
                var offset = {top: e.newVal};

                DOM.offset(self.container, offset);
                if(self.shim) self.shim.setOffset(offset);
            });

            self.on('afterWidthChange', function(e) {
                var w = e.newVal;
                if (w) {
                    DOM.width(self.container, w);
                    self.shim && self.shim.setSize(w, self.get(HEIGHT));
                }
                // 当设置 0 时, 表示按照内容宽度
            });

            self.on('afterHeightChange', function(e) {
                var h = e.newVal;
                if (h) {
                    DOM.height(self.container, h);
                    self.shim && self.shim.setSize(self.get(WIDTH), h);
                }
            });

            self.on('afterContentChange', function(e) {
                DOM.html(self.body, e.newVal);
            });
        },

        /**
         * 绑定触发器上的响应事件
         */
        _bindTrigger: function() {
            var self = this;

            if (self.get(TRIGGERTYPE) === MOUSE) {
                self._bindTriggerMouse();
            } else {
                self._bindTriggerClick();
            }
        },

        /**
         * 触发器的鼠标移动事件
         */
        _bindTriggerMouse: function() {
            var self = this;

            S.each(self.trigger, function(trigger) {
                var timer;

                Event.on(trigger, MOUSEENTER, function() {
                    self._clearHiddenTimer();

                    timer = S.later(function() {
                        self.currentTrigger = trigger;
                        self.show();
                        timer = undefined;
                    }, 100);
                });

                Event.on(trigger, MOUSELEAVE, function() {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }

                    self._setHiddenTimer();
                });
            });
        },

        /**
         * 下面三个函数, 用于处理鼠标快速移出容器时是否需要隐藏的延时
         */
        _bindContainerMouse: function() {
            var self = this;

            Event.on(self.container, MOUSELEAVE, function() {
                self._setHiddenTimer();
            });

            Event.on(self.container, MOUSEENTER, function() {
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

        /**
         * 触发器点击事件
         */
        _bindTriggerClick: function() {
            var self = this;

            S.each(self.trigger, function(trigger) {
                Event.on(trigger, CLICK, function(e) {
                    e.halt();
                    self.currentTrigger = trigger;
                    self.show();
                });
            });
        },

        /**
         * 显示 Overlay
         */
        show: function() {
            this._firstShow();
        },

        /**
         * 第一次显示时, 需要构建 DOM, 设置位置
         */
        _firstShow: function() {
            var self = this;

            self._prepareMarkup();
            self._setDisplay();
            self._setSize();
            self._setPosition();
            
            self.fire(EVENT_CREATE);

            self._realShow();
            self._firstShow = self._realShow;
        },

        _realShow: function() {
            this._toggle(false);
        },

        /**
         * 切换显示/隐藏
         * @param {boolean} isVisible
         */
        _toggle: function(isVisible) {
            var self = this;

            DOM.css(self.container, 'visibility', isVisible ? 'hidden' : EMPTY);

            self.shim && self.shim.toggle();
            self.get(MASK) && mask[isVisible ? HIDE : SHOW]();

            self[isVisible ? '_unbindUI' : '_bindUI']();
            self.fire(isVisible ? EVENT_HIDE : EVENT_SHOW);
        },

        /**
         * 隐藏
         */
        hide: function() {
            this._toggle(true);
        },

        _prepareMarkup: function() {
            var self = this, container = self.container;

            // 多个 Overlay 实例共用一个 mask
            if (self.get(MASK) && !mask) {
                mask = new S.Mask();
            }
            if (self.get('shim')) {
                self.shim = new S.Mask({ shim: true });
            }

            // 已有 Markup
            if (container) {
                // 已有 markup 可以很灵活，如果没有 bdCls, 就让 body 指向 container
                self.body = S.get(DOT + self.get(BDCLS), container) || container;

                container.style.cssText += DEFAULT_STYLE;
                DOM.html(self.body, self.get(CONTENT));
            }
            // 构建 DOM
            else {
                container = self.container = DOM.create(S.substitute(TMPL, {
                    containerCls: self.get('containerCls'),
                    bdCls: self.get(BDCLS),
                    content: self.get(CONTENT)
                }));
                self.body = DOM.children(container)[0];
                doc.body.appendChild(container);
            }

            DOM.css(container, ZINDEX, self.get(ZINDEX));

            if (self.get(TRIGGERTYPE) === MOUSE) self._bindContainerMouse();
        },

        /**
         * 防止其他地方设置 display: none 后, 无法再次显示
         */
        _setDisplay: function(){
            var self = this;
            if (DOM.css(self.container, DISPLAY) === 'none') {
                DOM.css(self.container, DISPLAY, 'block');
            }
        },

        /**
         * 设置初始宽高
         */
        _setSize: function() {
            var self = this,
                w, h, container = self.container;

            w = self.get(WIDTH) || DOM.width(container);
            h = self.get(HEIGHT) || DOM.height(container);

            DOM.width(container, w);
            DOM.height(container, h);
            if (self.shim) self.shim.setSize(w, h);
        },
        /**
         * 设置初始位置
         */
        _setPosition: function() {
            var self = this,
                offset = {left: self.get(X), top: self.get(Y)};

            DOM.offset(self.container, offset);
            if (self.shim) self.shim.setOffset(offset);
        },

        /**
         * 移动到绝对位置上, move(x, y) or move(x) or move([x, y])
         * @param {number|Array.<number>} x
         * @param {number=} y
         */
        move: function(x, y) {
            var self = this;

            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set(X, x);
            y && self.set(Y, y);
        },

        /**
         * 显示/隐藏时绑定的事件
         */
        _bindUI: function() {
            Event.on(doc, KEYDOWN, this._esc, this);
        },

        _unbindUI: function() {
            Event.remove(doc, KEYDOWN, this._esc, this);
        },
        
        _esc: function(e) {
            if (e.keyCode === 27) this.hide();
        },

        /**
         * 设置内容
         * @param {string} html
         */
        setBody: function(html) {
            this.set(CONTENT, html);
        },

        /**
         * 删除自己, mask 删不了
         */
        dispose: function() {
            var self = this;

            self._toggle(true);
            self.detach();
            Event.remove(self.container);
            S.each(self.trigger, function(t) {
                Event.remove(t, self.get(TRIGGERTYPE) === MOUSE ? (MOUSEENTER + ' ' + MOUSELEAVE) : CLICK);
            });
            
            DOM.remove(self.container);
        }
    });

    S.Overlay = Overlay;

}, { requires: ['core'] });

/**
 * TODO:
 *  - stackable ? 
 *  - effect
 */
/**
 * KISSY Popup
 * @creator   玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('popup', function(S) {

    var defaultConfig = {
        triggerType: 'mouse', // 触发类型默认为 mouse
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

        Popup.superclass.constructor.call(self, S.merge(defaultConfig, config));
    }

    S.extend(Popup, S.Overlay);
    S.Popup = Popup;

}, { host: 'overlay' });
/**
 * KISSY.Dialog
 * @creator  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        DOT = '.', DIV = '<div>', EMPTY = '', HEADER = 'header', FOOTER = 'footer',

        CLS_CONTAINER = 'ks-overlay ks-dialog',
        CLS_PREFIX = 'ks-dialog-',

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
        defaultConfig = {
            containerCls: CLS_CONTAINER,
            bdCls: CLS_PREFIX + 'bd',

            width: 400,
            height: 300
        };

    Dialog.ATTRS = {
        header: {                // 头部内容
            value: EMPTY
        },
        footer: {                // 尾部内容
            value: EMPTY
        },

        hdCls: {                // 头部元素的 class
            value: CLS_PREFIX + 'hd'
        },
        ftCls: {                // 尾部元素的 class
            value: CLS_PREFIX + 'ft'
        },

        closeBtnCls: {          // 关闭按钮的 class
            value: CLS_PREFIX + 'close'
        },
        closable: {             // 是否需要关闭按钮
            value: true
        }
    };
    /**
     * Dialog Class
     * @constructor
     * attached members：
     *  - this.header
     *  - this.footer
     *  - this.manager
     *  - this.ID
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

        Dialog.superclass.constructor.call(self, S.merge(defaultConfig, config));

        /**
         * 对话框管理器
         * @type {Object}
         */
        self.manager = S.DialogManager;
        /**
         * 对话框唯一 ID
         * @type {number}
         */
        self.ID = self.manager.register(self);
    }

    S.extend(Dialog, S.Overlay);
    
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, {
        _onAttrChanges: function() {
            var self = this;

            Dialog.superclass._onAttrChanges.call(self);

            self.on('afterHeaderChange', function(e) {
                DOM.html(self.header, e.newVal);
            });
            self.on('afterFooterChange', function(e) {
                DOM.html(self.footer, e.newVal);
            });
        },

        _prepareMarkup: function() {
            var self = this,
                footer,
                hdCls = self.get('hdCls'), ftCls = self.get('ftCls');

            Dialog.superclass._prepareMarkup.call(self);

            /**
             * 对话框头
             * @type {Element}
             */
            self.header = S.get(DOT + hdCls, self.container);
            if (!self.header) {
                self.header = DOM.create(DIV, { 'class': hdCls });
                DOM.insertBefore(self.header, self.body);
            }
            DOM.html(self.header, self.get(HEADER));

            if (footer = self.get(FOOTER)) {
                /**
                 * 对话框尾
                 * @type {Element}
                 */
                self.footer = S.get(DOT + ftCls, self.container);
                if (!self.footer) {
                    self.footer = DOM.create(DIV, { 'class': ftCls });
                    self.container.appendChild(self.footer);
                }
                DOM.html(self.footer, footer);
            }

            if (self.get('closable')) self._initClose();
        },

        /**
         * 初始化关闭按钮
         * @private
         */
        _initClose: function() {
            var self = this,
                elem = DOM.create(DIV, { 'class': self.get('closeBtnCls') });

            DOM.html(elem, 'close');
            
            Event.on(elem, 'click', function(e) {
                e.halt();
                self.hide();
            });

            self.header.appendChild(elem);
        },

        /**
         * 设置头部内容
         * @param {string} html
         * @deprecated set('header', html)
         */
        setHeader: function(html) {
            this.set(HEADER, html);
        },

        /**
         * 设置尾部内容
         * @param {string} html
         * @deprecated set('footer', html)
         */
        setFooter: function(html) {
            this.set(FOOTER, html);
        }
    });

    S.DialogManager = {
        /**
         * 注册 dialog 对象
         * @param dlg
         */
        register: function(dlg) {
            if (dlg instanceof Dialog) {
                var id = S.guid();
                this._dialog[id] = dlg;
                return id;
            }
            return -1;
        },

        /**
         * 保存所有 dialog 对象
         * @type {Object.<number, Object>}
         */
        _dialog: {},

        /**
         * 隐藏所有
         */
        hideAll: function() {
            S.each(this._dialog, function(dlg) {
                dlg && dlg.hide();
            })
        },
        /**
         * 根据 id 获取 dialog 对象
         * @param {number} id
         * @return {Object} Dialog 实例
         */
        get: function(id) {
            if (!id) return undefined;
            try{
                return this._dialog[id];
            } catch(e) {
                return undefined;
            }
        }
    };

}, { host: 'overlay' });



/**
 * Overlay Alignment Plugin
 * @author 乔花<qiaohua@taobao.com>
 */
KISSY.add('alignment', function(S, undefined) {
    var DOM = S.DOM,
        Overlay = S.Overlay,

        ALIGN = 'align',
        POSITION_ALIGN = {
            TL: 'tl',
            TC: 'tc',
            TR: 'tr',
            CL: 'cl',
            CC: 'cc',
            CR: 'cr',
            BL: 'bl',
            BC: 'bc',
            BR: 'br'
        },
        defaultAlignment = {
            node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
            points: [POSITION_ALIGN.CC, POSITION_ALIGN.CC], // ['tl', 'tr'] 表示 overlay 的 tl 与参考节点的 tr 对齐
            offset: [0, 0]      // 有效值为 [n, m]
        };

    S.mix(Overlay.ATTRS, {
        align: {                // 相对指定 node or viewport 的定位
            value: defaultAlignment,
            setter: function(v) {
                return S.merge(this.get(ALIGN), v);
            },
            getter: function(v) {
                return S.merge(defaultAlignment, v);
            }
        }
    });

    Overlay.Plugins.push({
        name: ALIGN,
        init: function(host) {
            host.on('create', function() {
                var self = this;

                self.on('afterAlignChange', function() {
                    self.align();
                });
            });
        }
    });

    S.augment(Overlay, {
        /**
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @param {Element=} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {Array.<string>} points 对齐方式
         * @param {Array.<number>} offset 偏移
         */
        align: function(node, points, offset) {
            var self = this, alignConfig = self.get(ALIGN), xy, diff, p1, p2;

            if (!self.container) return;

            node = node || alignConfig.node;
            if (node === 'trigger') node = self.currentTrigger;
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
         * 获取 node 上的 align 对齐点 相对于页面的坐标
         * @param {?Element} node
         * @param {align} align
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
        
        /**
         * 居中显示到可视区域, 一次性居中
         */
        center: function() {
            //this.set(ALIGN, defaultAlign);
            this.align('viewport', [POSITION_ALIGN.CC, POSITION_ALIGN.CC], [0, 0]);
        },

        /**
         * 设置初始位置
         */
        _setPosition: function() {
            var self = this,
                xy = self.get('xy'), offset;

            if (xy) {
                offset = {left: self.get('x'), top: self.get('y')};

                DOM.offset(self.container, offset);
                if (self.shim) self.shim.setOffset(offset);
            } else {
                self.align();
            }
        }
    });

}, { host: 'overlay' });

/**
 * Note:
 * - 2010/11/01 从 Overlay 中拆分出 align
 */
/**
 * Overlay Constrain Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('constrain', function(S, undefined) {
    var DOM = S.DOM,
        Overlay = S.Overlay,
        min = Math.min, max = Math.max, CONSTRAIN = 'constrain',
        defaultConstrain = {
            node: undefined,    // 如果没有设置限制容器元素, 默认以可视区域
            mode: false         // 开启/关闭限制
        };

    S.mix(Overlay.ATTRS, {
        constrain: {            // 限制设置
            value: defaultConstrain,
            setter: function(v) {
                return S.merge(this.get(CONSTRAIN), v);
            },
            getter: function(v) {
                return S.merge(defaultConstrain, v);
            }
        },
        x: {
            value: 0,
            setter: function(v) {
                var self = this,
                    constrainRegion = self._getConstrainRegion();

                if (constrainRegion) {
                    v = min(max(constrainRegion.left, v), constrainRegion.maxLeft);
                }
                return v;
            }
        },
        y: {
            value: 0,
            setter: function(v) {
                var self = this,
                    constrainRegion = self._getConstrainRegion();

                if (constrainRegion) {
                    v = min(max(constrainRegion.top, v), constrainRegion.maxTop);
                }
                return v;
            }
        }
    });

    Overlay.Plugins.push({
        name: CONSTRAIN,
        init: function(host) {
            host.on('create', function() {
                var self = this;

                self.on('afterConstrainChange', function() {
                    self.align && self.align();
                });
            });
        }
    });

    S.augment(Overlay, {
        /**
         * 获取受限区域的宽高, 位置
         * @return {Object | undefined} {left: 0, top: 0, maxLeft: 100, maxTop: 100}
         */
        _getConstrainRegion: function() {
            var self = this,
                constrain = self.get(CONSTRAIN),
                elem = S.get(constrain.node),
                ret;

            if (!constrain.mode) return undefined;

            if (elem) {
                ret = DOM.offset(elem);
                S.mix(ret, {
                    maxLeft: ret.left + DOM.width(elem) - DOM.width(self.container),
                    maxTop: ret.top + DOM.height(elem) - DOM.height(self.container)
                });
            }
            // 没有指定 constrain, 表示受限于可视区域
            else {
                ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
                S.mix(ret, {
                    maxLeft: ret.left + DOM.viewportWidth() - DOM.width(self.container),
                    maxTop: ret.top + DOM.viewportHeight() - DOM.height(self.container)
                });
            }
            return ret;
        },

        /**
         * 限制 overlay 在 node 中
         * @param {Element=} node 
         */
        constrain: function(node) {
            this.set(CONSTRAIN, {
                node: node,
                mode: true
            });
        },

        /**
         * 开启/关闭 constrain
         * @param {boolean} enabled
         */
        toggleConstrain: function(enabled) {
            var self = this;

            self.set(CONSTRAIN, {
                node: self.get(CONSTRAIN).node,
                mode: !!enabled
            });
        }
    });
}, { host: 'overlay' });


/**
 * Note:
 * - 2010/11/01 constrain 支持可视区域或指定区域
 *//**
 * Overlay Fixed Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('overlay-fixed', function(S) {
    var DOM = S.DOM,
        Overlay = S.Overlay,
        FIXED = 'fixed', POSITION = 'position', ABSOLUTE = 'absolute',
        ie6 = S.UA.ie === 6, rf, body = document.body;

    S.mix(Overlay.ATTRS, {
        fixed: {
            value: false
        }
    });

    Overlay.Plugins.push({
        name: FIXED,
        init: function(host) {
            host.on('create', function() {
                var self = this;

                if (self.get(FIXED)) {
                    setFixed(self, true);
                }

                self.on('afterFixedChange', function(e) {
                    setFixed(self, e.newVal);
                });
            });
        }
    });

    /**
     * IE6 下 position: fixed
     * @param config
     * @see http://www.cnblogs.com/cloudgamer/archive/2010/10/11/AlertBox.html
     */
    function RepairFixed() {
    }

    S.augment(RepairFixed, {
        create: function() {
            var self = this;

            body = document.body;
            if (body.currentStyle.backgroundAttachment !== FIXED) {
                if (body.currentStyle.backgroundImage === "none") {
                    body.runtimeStyle.backgroundRepeat = "no-repeat";
                    body.runtimeStyle.backgroundImage = "url(about:blank)";
                }
                body.runtimeStyle.backgroundAttachment = FIXED;
            }

            self.container = document.createElement("<div class=" + "ks-overlay-" + FIXED + " style='position:absolute;border:0;padding:0;margin:0;overflow:hidden;background:transparent;top:expression((document).documentElement.scrollTop);left:expression((document).documentElement.scrollLeft);width:expression((document).documentElement.clientWidth);height:expression((document).documentElement.clientHeight);display:block;'>");

            body.appendChild(self.container);// or DOM.insertBefore(self.container, body.childNodes[0]);
            self.create = self.empty;
        },
        empty: function() {
        },
        add: function(elem) {
            var self = this;

            self.create();
            
            // 备份原来的父亲
            elem._parent = elem.container.parentNode;

            // 将 Overlay 及相关元素搬到 fixed 容器中
            if (elem.shim) {
                self.container.appendChild(elem.shim.iframe);
                //elem.shim.iframe.runtimeStyle.position = ABSOLUTE;
            }

            self.container.appendChild(elem.container);
            //elem.container.runtimeStyle.position = ABSOLUTE;
        },

        /**
         * 取消 elem 的 fixed 设置
         * @param elem
         */
        remove: function(elem) {
            var parent;

            // 将 Overlay 搬到原来的 parent 中
            if (elem.container.parentNode === this.container) {
                parent = elem._parent || body;

                parent.appendChild(elem.container);
                //elem.container.runtimeStyle.position = ABSOLUTE;
                if (elem.shim) {
                    elem.shim && parent.appendChild(elem.shim.iframe);
                    //elem.shim.iframe.runtimeStyle.position = ABSOLUTE;
                }

                elem._parent = undefined;
            }
            // 这里保留 fixed 层
        }
    });

    function setFixed(elem, f) {
        if (!elem.container) return;

        // 更新left/top
        updatePosition(elem, f);

        if (f) {
            if (!ie6) {
                DOM.css(elem.container, POSITION, FIXED);
            } else {
                DOM.css(elem.container, POSITION, ABSOLUTE);

                if (!rf) {
                    rf = new RepairFixed();
                }
                rf.add(elem);
            }
        } else {
            if (!ie6) {
                DOM.css(elem.container, POSITION, ABSOLUTE);
            } else {
                rf.remove(elem);
            }
        }
    }

    function updatePosition(elem, f) {
        var old;
        
        old = DOM.offset(elem.container);
        DOM.offset(elem.container, {
            left: old.left + (f ? -DOM.scrollLeft() : DOM.scrollLeft()),
            top: old.top + (f ? -DOM.scrollTop() : DOM.scrollTop())});
    }

}, { host: 'overlay' });


/**
 * Note:
 * - 2010/11/04  加入 fixed 支持
 *//**
 * Overlay Draggable Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('overlay-draggable', function(S) {
    var Overlay = S.Overlay,
        DRAGGABLE = 'draggable';

    S.mix(Overlay.ATTRS, {
        draggable: {
            value: false
        }
    });

    Overlay.Plugins.push({
        name: DRAGGABLE,
        init: function(host) {

            host.on('create', function() {
                var self = this;
                if (self.get(DRAGGABLE)) {
                    setDraggable(self, true);
                }

                self.on('afterDraggableChange', function(e) {
                    setDraggable(self, e.newVal);
                });
            });
        }
    });


    function setDraggable(elem, f) {
        if (!elem.header) return;

        try {
            if (f) {
                if (elem._dd) return;

                var dd = new S.Draggable({
                    node: new S.Node(elem.container),
                    handlers: [new S.Node(elem.header)]
                });
                dd.on('drag', function(ev) {
                    elem.move(ev.left, ev.top);
                });

                elem._dd = dd;
            } else {
                if (!elem._dd) return;

                // 取消 draggable and else
                elem._dd.remove('drag');
            }
        } catch(e) {
            S.log('Required S.Draggable: ' + ex, 'warn');
        }
    }
}, { host: 'overlay', requires: ['dd'] });


/**
 * Note:
 * - 2010/11/03 draggable
 *//**
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
