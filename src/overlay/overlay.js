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
