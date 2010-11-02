/**
 * KISSY Overlay
 * @author   玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, Event = S.Event,
        ie6 = S.UA.ie === 6,

        DOT = '.', KEYDOWN = 'keydown', EMPTY = '',

        CLS_CONTAINER = 'ks-overlay',
        CLS_PREFIX = CLS_CONTAINER + '-',

        EVENT_SHOW = 'show',
        EVENT_HIDE = 'hide',
        EVENT_CREATE = 'create',

        DEFAULT_STYLE = 'visibility:hidden;position:absolute;',
        TMPL = '<div class="{containerCls}" style="' + DEFAULT_STYLE + '"><div class="{bdCls}">{content}</div></div>',

        mask;

    /*
     * Overlay Class
     * @constructor
     * @param {Element=} container
     * @param {Object} config
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

        Overlay.superclass.constructor.call(self);

        self._config(config);

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
        self.currentTrigger = self.trigger[0];

        /**
         * 配置信息
         * @type {Object}
         */
        self.config = S.merge(Overlay.Config, config);

        self._init();
    }

    S.extend(Overlay, S.Base);

    Overlay.ATTRS = {
        x: {
            value: 0
        },
        y: {
            value: 0
        },
        width: {
            value: 0,
            setter: function(v) {
                return parseInt(v) || 0;
            }
        },
        height: {
            value: 0,
            setter: function(v) {
                return parseInt(v) || 0;
            }
        },
        body: {
            value: EMPTY
        }
    };

    Overlay.Plugins = [];

    /**
     * 默认设置
     */
    Overlay.Config = {
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

        mask: false,            // 是否显示蒙层, 默认不显示
        shim: ie6
    };

    S.augment(Overlay, {
        _config: function(cfg) {

        },

        /**
         * initialize
         */
        _init: function() {
            var self = this;

            if (self.trigger.length > 0) {
                self._bindTrigger();
            }

            self._onAttrChanges();
            
            // init plugins
            S.each(Overlay.Plugins, function(plugin) {
                if (plugin.init) {
                    plugin.init(self);
                }
            });
        },

        _onAttrChanges: function() {
            var self = this;

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
                    self.shim && self.shim.setSize(w, self.get('height'));
                }
                // 当设置 0 时, 表示按照内容宽度
            });

            self.on('afterHeightChange', function(e) {
                var h = e.newVal;
                if (h) {
                    DOM.height(self.container, h);
                    self.shim && self.shim.setSize(self.get('width'), h);
                }
            });

            self.on('afterBodyChange', function(e) {
                DOM.html(self.body, e.newVal);
            });
        },

        /**
         * 绑定触发器上的响应事件
         */
        _bindTrigger: function() {
            var self = this;

            if (self.config.triggerType === 'mouse') {
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

                Event.on(trigger, 'mouseenter', function() {
                    self._clearHiddenTimer();

                    timer = S.later(function() {
                        self.currentTrigger = trigger;
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
            });
        },

        /**
         * 下面三个函数, 用于处理鼠标快速移出容器时是否需要隐藏的延时
         */
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

        /**
         * 触发器点击事件
         */
        _bindTriggerClick: function() {
            var self = this;

            S.each(self.trigger, function(trigger) {
                Event.on(trigger, 'click', function(e) {
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
            self._realShow();
            self._firstShow = self._realShow;

            self.fire(EVENT_CREATE);
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

            if(self.shim) self.shim.toggle();
            if (self.config.mask) mask[isVisible ? 'hide' : 'show']();

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
            if (config.triggerType === 'mouse') self._bindContainerMouse();
        },

        /**
         * 防止其他地方设置 display: none 后, 无法再次显示
         */
        _setDisplay: function(){
            var self = this;
            if (DOM.css(self.container, 'display') === 'none') {
                DOM.css(self.container, 'display', 'block');
            }
        },

        _setPosition: function() {
            var self = this, xy = self.config.xy;

            xy && self.move(xy);
        },

        _setSize: function() {
            var self = this, config = self.config;

            self.set('width', config.width);
            self.set('height', config.height);
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
            self.set('x', x);
            y && self.set('y', y);
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

        /**
         * 设置内容
         * @param {string} html
         */
        setBody: function(html) {
            this.set('body', html);
        }
    });

    S.Overlay = Overlay;

}, { requires: ['core'] });

/**
 * TODO:
 *  - stackable ? 
 *  - effect
 *  - draggable
 */
