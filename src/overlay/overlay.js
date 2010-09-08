/**
 * KISSY.Overlay
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, Event = S.Event,
        ie6 = S.UA.ie === 6,

        DOT = '.',
        CLS_HIDDEN = 'ks-hidden',
        CLS_PREFIX = 'ks-overlay-',
        CLS_CONTAINER = CLS_PREFIX + 'container',
        CLS_BODY = CLS_PREFIX + 'bd',
        CLS_SHIM = CLS_PREFIX + 'shim',
        CLS_FIXED = CLS_PREFIX + 'fixed',

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

        EVT_SHOW = 'show',
        EVT_HIDE = 'hide',

        TMPL = '<div class="{containerCls}"><div class="{bdCls}">{bdContent}</div></div>',

        /**
         * 默认设置
         */
        defaultConfig = {
            /*
             * DOM 结构
             *  <div class="ks-overlay-container">
             *      <div class="ks-overlay-bd"></div>
             *  </div>
             *  <div class="ks-overlay-shim"></div>
             */
            container: null,
            containerCls: CLS_CONTAINER,
            bdContent: '',
            bdCls: CLS_BODY,

            trigger: null,
            triggerType: 'click',   // 触发类型

            width: 0,
            height: 0,

            xy: null,               // 相对 page 定位，有效值为 n or [n, m]
            align: {                // 相对指定 node or viewport 定位
                node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
                points: [POSITION_ALIGN.CC, POSITION_ALIGN.CC], // ['tl', 'tr'] 表示 overlay 的 tl 与参考节点的 tr 对齐
                offset: 0           // 可以为 n or [n, m]
            },

            mask: false,            // 是否显示蒙层, 默认不显示
            shim: ie6,
            constrain: false        // 滚动时固定在可视区域
        },

        mask;

    /*
     * Overlay Class
     * @constructor
     * attached members：
     *   - this.container
     *   - this.trigger
     *   - this.config
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
            this._toggle(false);
        },

        _toggle: function(isVisible) {
            var self = this;

            DOM.toggleClass([self.container, self.shim], CLS_HIDDEN);
            if (self.config.mask) mask[isVisible ? 'hide' : 'show']();
            self[isVisible ? '_unbindUI' : '_bindUI']();
            self.fire(isVisible ? EVT_HIDE : EVT_SHOW);
        },

        hide: function() {
            this._toggle(true);
        },

        _prepareMarkup: function() {
            var self = this, config = self.config;

            // 多个 Overlay 实例共用一个 mask
            if (config.mask && !mask) {
                mask = new S.Mask();
            }
            if (config.shim) self._shim();

            // 已有 Markup
            if (self.container) {
                self.body = S.get(DOT + config.bdCls, self.container);
            }
            // 构建 DOM
            else {
                self.container = DOM.create(S.substitute(TMPL, config));
                self.body = DOM.children(self.container)[0];
                doc.body.appendChild(self.container);
            }

            self._setSize();
            self.setPosition();
        },

        _shim: function() {
            var self = this, ifr;

            ifr = DOM.create('<iframe>', { 'class': CLS_SHIM });
            doc.body.appendChild(ifr);
            self.shim = ifr;
        },

        /*
         * 设置 Overlay 宽高
         */
        _setSize: function(w, h) {
            var self = this,
                config = self.config;

            w = w || config.width;
            h = h || config.height;

            if (w) DOM.width(self.container, w);
            if (h) DOM.height(self.container, h);
            if (self.shim) {
                DOM.width(self.shim, w);
                DOM.height(self.shim, h);
            }
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
            // support move([x, y])
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }

            DOM.offset([self.container, self.shim], { left: x, top: y });
        },

        /**
         * align: {                // 相对指定 node or viewport 定位
                node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
                points: [POSITION_ALIGN.CC, POSITION_ALIGN.CC], // ['tl', 'tr'] 表示 overlay 的 tl 与参考节点的 tr 对齐
                offset: 0           // 可以为 n or [n, m]
            },
         */
        align: function() {
            var self = this, config = self.config,
                alignConfig = config.align,
                node = alignConfig.node,
                points = alignConfig.points,
                offset = alignConfig.offset,
                xy;

            // 获取 node
            if(node === 'trigger') node = self.trigger;
            else node = S.get(node);

            // 相对触点或指定节点
            if(node) {
                xy = self._calcOverlayXY(p1, p2);
            }
            // 相对 viewport
            else {
                //xy = self._calcOverlayXY();
            }

            self.move(xy);

            // 处理 offset

        },

        _calcOverlayXY: function(p1, p2) {
            var self = this, container = self.container;


        },

        _getAlignOffset: function(elem, align) {
            var p = DOM.offset(elem),
                w = DOM.width(elem), h = DOM.height(elem),
                x = 0, y = 0,
                V = align.substring(0, 1), H = align.substring(1, 1);

            if(V === 'c') {
                y = h / 2;
            } else if(V === 'b') {
                y = h;
            }

            if(H === 'c') {
                y = w / 2;
            } else if(V === 'r') {
                y = w;
            }

            return { left: p.left + x, top: p.top + y };
        },

        setPosition2: function() {
            var self = this,
                leftTop = arguments[0];

            if (!leftTop) {
                var align = self.config.align,
                    align_node = align.node,
                    align_offset_x = align.offset[0] || 0,
                    align_offset_y = align.offset[1] || 0,
                    align_inner_x = align.inner[0] || false,
                    align_inner_y = align.inner[1] || false,
                    w = DOM.width(self.container),
                    h = DOM.height(self.container),
                    offset, tw, th, l = 0, t = 0, tmp;

                if (align_node === 'trigger') {
                    tmp = self.trigger;
                } else {
                    tmp = S.get(align_node);
                }

                if (tmp) {
                    offset = DOM.offset(tmp);
                    tw = DOM.width(tmp);//tmp.clientWidth;
                    th = DOM.height(tmp);//tmp.clientHeight;
                } else {
                    // 可视区域
                    offset = {left:0, top:0};
                    tw = DOM.viewportWidth();
                    th = DOM.viewportHeight();
                }

                if (align.x === LEFT) {
                    l = offset.left - w - align_offset_x;
                    if (align_inner_x) l += w + align_offset_x;
                } else if (align.x === CENTER) {
                    l = offset.left + (tw - w) / 2;
                } else if (align.x === RIGHT) {
                    l = offset.left + tw + align_offset_x;
                    if (align_inner_x) l -= w - align_offset_x;
                } else if (S.isNumber(align.x)) {
                    if (align_inner_x) l = offset.left + align.x + align_offset_x;
                    else l = offset.left - w - align.x - align_offset_x;
                }

                if (align.y === TOP) {
                    t = offset.top - h - align_offset_y;
                    if (align_inner_y) t += h + align_offset_y;
                } else if (align.y === CENTER) {
                    t = offset.top + (th - h) / 2;
                } else if (align.y === BOTTOM) {
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
        },

        /*
         * 居中Overlay, 相对于可视区域
         */
        center: function() {
            var self = this,
                oft = {
                    left: (DOM.viewportWidth() - DOM.width(self.container)) / 2,
                    top: (DOM.viewportHeight() - DOM.height(self.container)) / 2
                };
            //if (oft.left<0) oft.left = 0;
            //if (oft.top<0) oft.top = 0;
            oft.left += DOM.scrollLeft();
            oft.top += DOM.scrollTop();
            self.setPosition(oft);
        },

        /**
         * 绑定Overlay上的事件, 包含ESC, 滚动和窗口变化时
         */
        _bindUI: function() {
            var self = this,
                cfg = self.config;

            if (cfg.constrain) {
                if (ie6) Event.on(window, 'scroll', self._position, self);
                else DOM.addClass(self.container, CLS_FIXED);
            }

            //Event.on(window, 'resize', self._position, self); 暂时去掉resize
            Event.on(document, 'keydown', self._esc, self);
        },

        _esc: function(e) {
            if (e.keyCode === 27)  this.hide();
        },

        _position: function() {
            this.setPosition();
        },

        /**
         * 窗口隐藏时移除事件
         */
        _unbindUI: function() {
            var self = this,
                cfg = self.config;

            if (cfg.scroll && ie6) Event.remove(window, 'scroll', self._position, self);
            //Event.remove(window, 'resize', self._position, self);
            Event.remove(document, 'keydown', self._esc, self);
        },

        setBdContent: function(content) {
            DOM.html(this.body, content);
        }
    });

    S.Overlay = Overlay;

});

/**
 * TODO:
 *  - stackable ?
 *  - constrain 支持指定区域 ?
 */
