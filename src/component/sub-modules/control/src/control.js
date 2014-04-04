/**
 * @ignore
 * Base Control class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Manager = require('component/manager');
    var Base = require('base');
    var RenderTpl = require('./control/render-xtpl');
    var UA = require('ua');
    var ie = UA.ieMode;
    var Feature = S.Feature;
    var __getHook = Base.prototype.__getHook;
    var Gesture = Node.Gesture;
    var startTpl = RenderTpl;
    var endTpl = '</div>';
    var isTouchGestureSupported = Feature.isTouchGestureSupported();
    var noop = S.noop;
    var XTemplateRuntime = require('xtemplate/runtime');
    var trim = S.trim;
    var $ = Node.all;
    var doc = S.Env.host.document;
    var HTML_PARSER = 'HTML_PARSER';

    function normalExtras(extras) {
        if (!extras) {
            extras = [''];
        }
        if (typeof extras === 'string') {
            extras = extras.split(/\s+/);
        }
        return extras;
    }

    function prefixExtra(prefixCls, componentCls, extras) {
        var cls = '',
            i = 0,
            l = extras.length,
            e,
            prefix = prefixCls + componentCls;
        for (; i < l; i++) {
            e = extras[i];
            e = e ? ('-' + e) : e;
            cls += ' ' + prefix + e;
        }
        return cls;
    }

    function pxSetter(v) {
        if (typeof v === 'number') {
            v += 'px';
        }
        return v;
    }

    function applyParser(srcNode, parser) {
        var self = this,
            p, v, ret;

        // 从 parser 中，默默设置属性，不触发事件
        // html parser 优先，超过 js 配置值
        for (p in parser) {
            v = parser[p];
            // 函数
            if (typeof v === 'function') {
                // html parser 放弃
                ret = v.call(self, srcNode);
                if (ret !== undefined) {
                    self.setInternal(p, ret);
                }
            } else if (typeof v === 'string') {
                // 单选选择器
                self.setInternal(p, srcNode.one(v));
            } else if (S.isArray(v) && v[0]) {
                // 多选选择器
                self.setInternal(p, srcNode.all(v[0]));
            }
        }
    }

    // scope option
    function getBaseCssClassesCmd(_, options) {
        return this.config.control.getBaseCssClasses(options && options.params && options.params[0]);
    }

    function getBaseCssClassCmd() {
        return this.config.control.getBaseCssClass(arguments[1].params[0]);
    }

    /**
     * Base Control class for KISSY Component.
     * @extends KISSY.Base
     * @class KISSY.Component.Control
     */
    var Control = Base.extend({
            /**
             * mark current instance as control instance.
             *
             * access this property directly.
             *
             * for example:
             *
             *      menu.isControl // => true
             *
             * @type {Boolean}
             * @member KISSY.Component.Control
             */
            isControl: true,

            bindInternal: noop,

            syncInternal: noop,

            beforeCreateDom: function (renderData) {
                var self = this,
                    width,
                    height,
                    visible,
                    elAttrs = self.get('elAttrs'),
                    disabled,
                    attrs = self.getAttrs(),
                    a,
                    attr,
                    elStyle = self.get('elStyle'),
                    zIndex,
                    elCls = self.get('elCls');

                for (a in attrs) {
                    attr = attrs[a];
                    if (attr.view) {
                        renderData[a] = self.get(a);
                    }
                }

                width = renderData.width;
                height = renderData.height;
                visible = renderData.visible;
                zIndex = renderData.zIndex;

                if (width) {
                    elStyle.width = pxSetter(width);
                }
                if (height) {
                    elStyle.height = pxSetter(height);
                }
                if (zIndex) {
                    elStyle['z-index'] = zIndex;
                }

                if (!visible) {
                    elCls.push(self.getBaseCssClasses('hidden'));
                }

                if ((disabled = self.get('disabled'))) {
                    elCls.push(self.getBaseCssClasses('disabled'));
                    elAttrs['aria-disabled'] = 'true';
                }
                if (self.get('highlighted')) {
                    elCls.push(self.getBaseCssClasses('hover'));
                }
                if (self.get('focusable')) {
                    // ie9 support outline
                    if (UA.ieMode < 9) {
                        elAttrs.hideFocus = 'true';
                    }
                    elAttrs.tabindex = disabled ? '-1' : '0';
                }
            },

            /**
             * Constructor(or get) view object to create ui elements.
             * @protected
             */
            createDom: function () {
                var self = this;
                self.beforeCreateDom(self.renderData = {},
                    self.childrenElSelectors = {},
                    self.renderCommands = {
                        getBaseCssClasses: getBaseCssClassesCmd,
                        getBaseCssClass: getBaseCssClassCmd
                    });
                // initialize view
                // allow custom view instance
                var html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
                self.$el = $(html);
                self.el = self.$el[0];
                self.fillChildrenElsBySelectors();
            },

            decorateDom: function (srcNode) {
                var self = this;
                applyParser.call(self, srcNode, self.constructor.HTML_PARSER);
                self.$el = srcNode;
                self.el = srcNode[0];
            },

            /**
             * Call view object to render ui elements.
             * @protected
             */
            renderUI: function () {
                var self = this;
                // after create
                Manager.addComponent(self);
                var el = self.getKeyEventTarget();
                if (!self.get('allowTextSelection')) {
                    el.unselectable();
                }
                // need to insert created dom into body
                if (!self.get('srcNode')) {
                    var render = self.get('render'),
                        renderBefore = self.get('elBefore');
                    if (renderBefore) {
                        el.insertBefore(renderBefore, undefined);
                    } else if (render) {
                        el.appendTo(render, undefined);
                    } else {
                        el.appendTo(doc.body, undefined);
                    }
                }
            },

            bindUI: function () {
                var self = this,
                    el = self.getKeyEventTarget();

                if (self.get('focusable')) {
                    // remove smart outline in ie
                    // set outline in style for other standard browser
                    el.on('focus', self.handleFocus, self)
                        .on('blur', self.handleBlur, self)
                        .on('keydown', self.handleKeydown, self);
                }

                if (self.get('handleGestureEvents')) {
                    el = self.$el;

                    // chrome on windows8 has both mouse and touch event
                    el.on('mouseenter', self.handleMouseEnter, self)
                        .on('mouseleave', self.handleMouseLeave, self)
                        .on('contextmenu', self.handleContextMenu, self);

                    el.on(Gesture.start, self.handleMouseDown, self)
                        .on(Gesture.end, self.handleMouseUp, self)
                        // consider touch environment
                        .on(Gesture.tap, self.handleClick, self);
                    if (Gesture.cancel) {
                        el.on(Gesture.cancel, self.handleMouseUp, self);
                    }

                    // click quickly only trigger click and dblclick in ie<9
                    // others click click dblclick
                    if (ie < 9) {
                        el.on('dblclick', self.handleDblClick, self);
                    }
                }
            },

            syncUI: noop,

            /**
             * @protected
             */
            destructor: function () {
                var self = this;
                // remove instance from manager
                Manager.removeComponent(self);
                if (self.$el) {
                    self.$el.remove();
                }
            },

            /**
             * create dom structure of this component
             * (control will delegate to render).
             * @chainable
             */
            create: function () {
                var self = this;
                if (!self.get('created')) {
                    /**
                     * @event beforeCreateDom
                     * fired before root node is created
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */
                    self.fire('beforeCreateDom');
                    var srcNode = self.get('srcNode');
                    if (srcNode) {
                        self.decorateDom(srcNode);
                    } else {
                        self.createDom();
                    }
                    self.__callPluginsMethod('pluginCreateDom');
                    /**
                     * @event afterCreateDom
                     * fired when root node is created
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */
                    self.fire('afterCreateDom');
                    self.setInternal('created', true);
                }
                return self;
            },

            /**
             * Put dom structure of this component to document, bind event and sync attribute.
             * @chainable
             */
            render: function () {
                var self = this;
                // 是否已经渲染过
                if (!self.get('rendered')) {
                    self.create();

                    /**
                     * @event beforeRenderUI
                     * fired when root node is ready
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */

                    self.fire('beforeRenderUI');
                    self.renderUI();
                    self.__callPluginsMethod('pluginRenderUI');

                    /**
                     * @event afterRenderUI
                     * fired after root node is rendered into dom
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */
                    self.fire('afterRenderUI');

                    /**
                     * @event beforeBindUI
                     * fired before component 's internal event is bind.
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */

                    self.fire('beforeBindUI');
                    Control.superclass.bindInternal.call(self);
                    self.bindUI();
                    self.__callPluginsMethod('pluginBindUI');
                    /**
                     * @event afterBindUI
                     * fired when component 's internal event is bind.
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */
                    self.fire('afterBindUI');

                    /**
                     * @event beforeSyncUI
                     * fired before component 's internal state is synchronized.
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */
                    self.fire('beforeSyncUI');
                    Control.superclass.syncInternal.call(self);
                    self.syncUI();
                    self.__callPluginsMethod('pluginSyncUI');
                    /**
                     * @event afterSyncUI
                     * fired after component 's internal state is synchronized.
                     * @param {KISSY.Event.CustomEvent.Object} e
                     */
                    self.fire('afterSyncUI');

                    self.setInternal('rendered', true);
                }
                return self;
            },

            plug: function (plugin) {
                var self = this,
                    p,
                    plugins = self.get('plugins');
                self.callSuper(plugin);
                p = plugins[plugins.length - 1];
                if (self.get('rendered')) {
                    // plugin does not support decorate
                    if (p.pluginCreateDom) {
                        p.pluginCreateDom(self);
                    }
                    if (p.pluginRenderUI) {
                        p.pluginCreateDom(self);
                    }
                    if (p.pluginBindUI) {
                        p.pluginBindUI(self);
                    }
                    if (p.pluginSyncUI) {
                        p.pluginSyncUI(self);
                    }
                } else if (self.get('created')) {
                    if (p.pluginCreateDom) {
                        p.pluginCreateDom(self);
                    }
                }
                return self;
            },

            /**
             * Returns the dom element which is responsible for listening keyboard events.
             * @return {KISSY.NodeList}
             * @ignore
             */
            getKeyEventTarget: function () {
                return this.$el;
            },

            handleDblClick: function (ev) {
                if (!this.get('disabled')) {
                    this.handleDblClickInternal(ev);
                }
            },

            /**
             * Hack click in ie<9 by handling dblclick events.
             * By default, this performs its associated action by calling
             * {@link KISSY.Component.Control#handleClickInternal}.
             * @protected
             * @param {KISSY.Event.DomEvent.Object} ev Dom event to handle.
             */
            handleDblClickInternal: function (ev) {
                this.handleClickInternal(ev);
            },

            handleMouseEnter: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseEnterInternal(ev);
                }
            },

            /**
             * Handle mouseenter events. If the component is not disabled, highlights it.
             * @protected
             * @param {KISSY.Event.DomEvent.Object} ev Dom event to handle.
             */
            handleMouseEnterInternal: function (ev) {
                this.set('highlighted', !!ev);
            },

            handleMouseLeave: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseLeaveInternal(ev);
                }
            },

            /**
             * Handle mouseleave events. If the component is not disabled, de-highlights it.
             * @protected
             * @param {KISSY.Event.DomEvent.Object} ev Dom event to handle.
             */
            handleMouseLeaveInternal: function (ev) {
                var self = this;
                self.set('active', false);
                self.set('highlighted', !ev);
            },

            handleMouseDown: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseDownInternal(ev);
                }
            },

            /**
             * Handles mousedown events. If the component is not disabled,
             * If the component is activeable, then activate it.
             * If the component is focusable, then focus it,
             * else prevent it from receiving keyboard focus.
             * @protected
             * @param {KISSY.Event.DomEvent.Object} ev Dom event to handle.
             */
            handleMouseDownInternal: function (ev) {
                var self = this,
                    n,
                    isMouseActionButton = ev.which === 1;
                if (isMouseActionButton || isTouchGestureSupported) {
                    if (self.get('activeable')) {
                        self.set('active', true);
                    }
                    if (self.get('focusable')) {
                        self.focus();
                    }
                    // touch does not need this
                    // https://github.com/kissyteam/kissy/issues/574
                    if (!self.get('allowTextSelection') && ev.gestureType === 'mouse') {
                        // firefox /chrome/ie9/i10 不会引起焦点转移
                        // invalid for ie10 buggy?
                        n = ev.target.nodeName;
                        n = n && n.toLowerCase();
                        // do not prevent focus when click on editable element
                        if (n !== 'input' && n !== 'textarea' && n !== 'button') {
                            ev.preventDefault();
                        }
                    }
                }
            },

            handleMouseUp: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseUpInternal(ev);
                }
            },

            /**
             * Handles mouseup events.
             * If this component is not disabled, performs its associated action by calling
             * {@link KISSY.Component.Control#handleClickInternal}, then deactivates it.
             * @protected
             * @param {KISSY.Event.DomEvent.Object} ev Dom event to handle.
             */
            handleMouseUpInternal: function (ev) {
                var self = this;
                // 左键
                if (self.get('active') && (ev.which === 1 || isTouchGestureSupported)) {
                    self.set('active', false);
                }
            },

            handleContextMenu: function (ev) {
                if (!this.get('disabled')) {
                    this.handleContextMenuInternal(ev);
                }
            },

            /**
             * Handles context menu.
             * @protected
             */
            handleContextMenuInternal: function () {
            },

            handleFocus: function () {
                if (!this.get('disabled')) {
                    this.handleFocusInternal();
                }
            },

            /**
             * Handles focus events. Style focused class.
             * @protected
             */
            handleFocusInternal: function () {
                this.focus();
                this.fire('focus');
            },

            handleBlur: function () {
                if (!this.get('disabled')) {
                    this.handleBlurInternal();
                }
            },

            /**
             * Handles blur events. Remove focused class.
             * @protected
             */
            handleBlurInternal: function () {
                this.blur();
                this.fire('blur');
            },

            handleKeydown: function (ev) {
                var self = this;
                if (!this.get('disabled') && self.handleKeyDownInternal(ev)) {
                    ev.halt();
                    return true;
                }
                return undefined;
            },

            /**
             * Handle enter keydown event to {@link KISSY.Component.Control#handleClickInternal}.
             * @protected
             * @param {KISSY.Event.DomEvent.Object} ev Dom event to handle.
             */
            handleKeyDownInternal: function (ev) {
                if (ev.keyCode === Node.KeyCode.ENTER) {
                    return this.handleClickInternal(ev);
                }
                return undefined;
            },

            handleClick: function (ev) {
                if (!this.get('disabled')) {
                    this.handleClickInternal(ev);
                }
            },

            /**
             * Performs the appropriate action when this component is activated by the user.
             * @protected
             */
            handleClickInternal: function () {
                // ie11 does not focus right
                var self = this;
                if (self.get('focusable')) {
                    self.focus();
                }
            },

            $: function (selector) {
                return this.$el.all(selector);
            },

            fillChildrenElsBySelectors: function (childrenElSelectors) {
                var self = this,
                    el = self.$el,
                    childName,
                    selector;

                childrenElSelectors = childrenElSelectors || self.childrenElSelectors;

                for (childName in childrenElSelectors) {
                    selector = childrenElSelectors[childName];
                    if (typeof selector === 'function') {
                        self.setInternal(childName, selector(el));
                    } else {
                        self.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
                    }
                    delete childrenElSelectors[childName];
                }
            },

            renderTpl: function (tpl, renderData, renderCommands) {
                var self = this;
                renderData = renderData || self.renderData;
                renderCommands = renderCommands || self.renderCommands;
                var XTemplate = self.get('XTemplate');
                return new XTemplate(tpl, {
                    control: self,
                    commands: renderCommands
                }).render(renderData);
            },

            /**
             * Get component's constructor from KISSY Node.
             * @param prefixCls
             * @param {KISSY.NodeList} childNode Child component's root node.
             */
            getComponentConstructorByNode: function (prefixCls, childNode) {
                var cls = childNode[0].className;
                // 过滤掉特定前缀
                if (cls) {
                    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
                    return Manager.getConstructorByXClass(cls);
                }
                return null;
            },

            getComponentCssClasses: function () {
                var self = this;
                if (self.componentCssClasses) {
                    return self.componentCssClasses;
                }
                var constructor = self.constructor,
                    xclass,
                    re = [];
                while (constructor && !constructor.prototype.hasOwnProperty('isControl')) {
                    xclass = constructor.xclass;
                    if (xclass) {
                        re.push(xclass);
                    }
                    constructor = constructor.superclass && constructor.superclass.constructor;
                }
                self.componentCssClasses = re;
                return re;
            },

            /**
             * Get all css class name to be applied to the root element of this component for given extra class names.
             * the css class names are prefixed with component name.
             * @param extras {String[]|String} class names without prefixCls and current component class name.
             */
            getBaseCssClasses: function (extras) {
                extras = normalExtras(extras);
                var componentCssClasses = this.getComponentCssClasses(),
                    i = 0,
                    cls = '',
                    l = componentCssClasses.length,
                    prefixCls = this.get('prefixCls');
                for (; i < l; i++) {
                    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
                }
                return trim(cls);
            },

            /**
             * Get full class name (with prefix) for current component
             * @param extras {String[]|String} class names without prefixCls and current component class name.
             * @method
             * @return {String} class name with prefixCls and current component class name.
             */
            getBaseCssClass: function (extras) {
                return trim(prefixExtra(this.get('prefixCls'),
                    this.getComponentCssClasses()[0],
                    normalExtras(extras)
                ));
            },

            createComponent: function (cfg, parent) {
                return Manager.createComponent(cfg, parent || this);
            },

            /**
             * show component
             * @chainable
             */
            show: function () {
                var self = this;
                self.render();
                self.set('visible', true);
                return self;
            },

            /**
             * hide component
             * @chainable
             */
            hide: function () {
                var self = this;
                self.set('visible', false);
                return self;
            },

            focus: function () {
                if (this.get('focusable')) {
                    this.set('focused', true);
                }
            },

            blur: function () {
                if (this.get('focusable')) {
                    this.set('focused', false);
                }
            },

            move: function (x, y) {
                this.set({
                    x: x,
                    y: y
                });
            },


            _onSetWidth: function (w) {
                this.$el.width(w);
            },

            _onSetHeight: function (h) {
                this.$el.height(h);
            },

            _onSetContent: function (c) {
                var el = this.$el;
                el.html(c);
                // ie needs to set unselectable attribute recursively
                if (!this.get('allowTextSelection')) {
                    el.unselectable();
                }
            },

            _onSetVisible: function (visible) {
                var self = this,
                    el = self.$el,
                    hiddenCls = self.getBaseCssClasses('hidden');
                if (visible) {
                    el.removeClass(hiddenCls);
                } else {
                    el.addClass(hiddenCls);
                }
                // do not fire event at render phrase
                this.fire(visible ? 'show' : 'hide');
            },

            /**
             * @ignore
             */
            _onSetHighlighted: function (v) {
                var self = this,
                    componentCls = self.getBaseCssClasses('hover'),
                    el = self.$el;
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },

            /**
             * @ignore
             */
            _onSetDisabled: function (v) {
                var self = this,
                    componentCls = self.getBaseCssClasses('disabled'),
                    el = self.$el;
                el[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr('aria-disabled', v);
                if (self.get('focusable')) {
                    //不能被 tab focus 到
                    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
                }
            },
            /**
             * @ignore
             */
            _onSetActive: function (v) {
                var self = this,
                    componentCls = self.getBaseCssClasses('active');
                self.$el[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr('aria-pressed', !!v);
            },

            _onSetZIndex: function (x) {
                this.$el.css('z-index', x);
            },

            _onSetFocused: function (v) {
                var target = this.getKeyEventTarget()[0];
                if (v) {
                    try {
                        target.focus();
                    } catch (e) {
                        S.log(target);
                        S.log('focus error', 'warn');
                    }
                } else {
                    // force to move focus if just this.set('focused',false);
                    // do not changed focus if changed by other component focus
                    if (target.ownerDocument.activeElement === target) {
                        target.ownerDocument.body.focus();
                    }
                }
                var self = this,
                    el = self.$el,
                    componentCls = self.getBaseCssClasses('focused');
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },

            _onSetX: function (x) {
                this.$el.offset({
                    left: x
                });
            },

            _onSetY: function (y) {
                this.$el.offset({
                    top: y
                });
            }
        },
        {
            __hooks__: {
                beforeCreateDom: __getHook('__beforeCreateDom'),
                createDom: __getHook('__createDom'),
                decorateDom: __getHook('__decorateDom'),
                renderUI: __getHook('__renderUI'),
                bindUI: __getHook('__bindUI'),
                syncUI: __getHook('__syncUI')
            },

            name: 'control',

            HTML_PARSER: {
                id: function (el) {
                    var id = el.attr('id');
                    if (!id) {
                        id = S.guid('ks-component');
                        el.attr('id', id);
                    }
                    return id;
                },
                content: function (el) {
                    return el.html();
                },
                disabled: function (el) {
                    return el.hasClass(this.getBaseCssClass('disabled'));
                }
            },

            ATTRS: {
                /**
                 * component's html content. Note: content and srcNode can not be set both!
                 * @type {String|KISSY.NodeList}
                 * @property content
                 */
                /**
                 * component's html content. Note: content and srcNode can not be set both!
                 * @cfg {String|KISSY.NodeList} content
                 */
                /**
                 * @ignore
                 */
                content: {
                    view: 1,
                    sync: 0,
                    value: ''
                },

                /**
                 * component's width
                 * @type {Number|String}
                 * @property width
                 */
                /**
                 * component's width
                 * @cfg {Number|String} width
                 */
                /**
                 * @ignore
                 */
                width: {
                    view: 1,
                    sync: 0
                },

                /**
                 * component's height
                 * @type {Number|String}
                 * @property height
                 */
                /**
                 * component's height
                 * @cfg {Number|String} height
                 */
                /**
                 * @ignore
                 */
                height: {
                    view: 1,
                    sync: 0
                },

                /**
                 * css class of component's root element
                 * @cfg {String} elCls
                 */
                /**
                 * @ignore
                 */
                elCls: {
                    view: 1,
                    value: [],
                    setter: function (v) {
                        if (typeof v === 'string') {
                            v = v.split(/\s+/);
                        }
                        return v || [];
                    }
                },

                /**
                 * name-value pair css style of component's root element
                 * @cfg {Object} elStyle
                 */
                /**
                 * @ignore
                 */
                elStyle: {
                    view: 1,
                    value: {}
                },

                /**
                 * name-value pair attribute of component's root element
                 * @cfg {Object} elAttrs
                 */
                /**
                 * @ignore
                 */
                elAttrs: {
                    view: 1,
                    value: {}
                },

                /**
                 * Horizontal axis
                 * @type {Number}
                 * @property x
                 */
                /**
                 * Horizontal axis
                 * @cfg {Number} x
                 */
                /**
                 * @ignore
                 */
                x: {
                },

                /**
                 * Vertical axis
                 * @type {Number}
                 * @property y
                 */
                /**
                 * Vertical axis
                 * @cfg {Number} y
                 */
                /**
                 * @ignore
                 */
                y: {
                },

                /**
                 * Horizontal and vertical axis.
                 * @ignore
                 * @type {Number[]}
                 */
                /**
                 * @ignore
                 */
                xy: {
                    setter: function (v) {
                        var self = this,
                            xy = S.makeArray(v);
                        if (xy.length) {
                            if (xy[0] !== undefined) {
                                self.set('x', xy[0]);
                            }
                            if (xy[1] !== undefined) {
                                self.set('y', xy[1]);
                            }
                        }
                        return v;
                    },
                    getter: function () {
                        return [this.get('x'), this.get('y')];
                    }
                },

                /**
                 * z-index value.
                 * @type {Number}
                 * @property zIndex
                 */
                /**
                 * z-index value.
                 * @cfg {Number} zIndex
                 */
                /**
                 * @ignore
                 */
                zIndex: {
                    view: 1,
                    sync: 0
                },

                /**
                 * whether this component is visible after created.
                 *
                 * will add/remove css class {prefix}{component}-hidden to component's root el.
                 *
                 * @cfg {Boolean} visible
                 */
                /**
                 * whether this component is visible.
                 *
                 * will add/remove css class {prefix}{component}-hidden to component's root el.
                 *
                 * @type {Boolean}
                 * @property visible
                 */
                /**
                 * @ignore
                 */
                visible: {
                    view: 1,
                    sync: 0,
                    value: true
                },


                /**
                 * Whether this component can be activated.
                 *
                 * Defaults to: true.
                 *
                 * @cfg {Boolean} activeable
                 * @protected
                 */
                /**
                 * @ignore
                 */
                activeable: {
                    value: true
                },

                /**
                 * Whether this component has focus.
                 * @type {Boolean}
                 * @property focused
                 */
                /**
                 * Whether this component has focus on initialization.
                 * @cfg {Boolean} focused
                 */
                /**
                 * @ignore
                 */
                focused: {
                },

                /**
                 * Whether this component is activated.
                 * @type {Boolean}
                 * @property active
                 */
                /**
                 * @ignore
                 */
                active: {
                    value: false
                },

                /**
                 * Whether this component is highlighted.
                 * @type {Boolean}
                 * @property highlighted
                 */
                /**
                 * @ignore
                 */
                highlighted: {
                    view: 1,
                    sync: 0,
                    value: false
                },

                /**
                 * Whether this component is disabled.
                 * @type {Boolean}
                 * @property disabled
                 */
                /**
                 * Whether this component is disabled.
                 * @cfg {Boolean} disabled
                 */
                /**
                 * @ignore
                 */
                disabled: {
                    view: 1,
                    sync: 0,
                    value: false
                },

                /**
                 * Whether this component is rendered.
                 * @type {Boolean}
                 * @property rendered
                 * @readonly
                 */
                /**
                 * @ignore
                 */
                rendered: {
                    value: false
                },

                /**
                 * Whether this component 's dom structure is created.
                 * @type {Boolean}
                 * @property created
                 * @readonly
                 */
                /**
                 * @ignore
                 */
                created: {
                    value: false
                },

                /**
                 * archor element where component append to
                 * @cfg {KISSY.NodeList} render
                 */
                /**
                 * @ignore
                 */
                render: {
                },

                /**
                 * component id
                 * @cfg {String} id
                 */
                id: {
                    view: 1,
                    valueFn: function () {
                        return S.guid('ks-component');
                    }
                },

                /**
                 * archor element where component insert before
                 * @cfg {KISSY.NodeList} elBefore
                 */
                /**
                 * @ignore
                 */
                elBefore: {
                },

                /**
                 * root element of current component
                 * @type {KISSY.NodeList}
                 * @readonly
                 * @property el
                 */
                /**
                 * @ignore
                 */
                el: {
                    getter: function () {
                        return this.$el;
                    }
                },

                /**
                 * kissy node or css selector to find the first match node
                 *
                 * parsed for configuration values,
                 * passed to component's HTML_PARSER definition
                 * @cfg {KISSY.NodeList|String} srcNode
                 *
                 */
                /**
                 * @ignore
                 */
                srcNode: {
                    setter: function (v) {
                        return Node.all(v);
                    }
                },

                /**
                 * Enables or disables gesture event(mouse/gestureStart/gestureEnd) handling for the component.
                 * Containers may set this attribute to disable gesture event handling
                 * in their child component.
                 *
                 * Defaults to: true.
                 *
                 * @cfg {Boolean} handleGestureEvents
                 * @protected
                 */
                /**
                 * @ignore
                 */
                handleGestureEvents: {
                    value: true
                },

                /**
                 * Whether this component can get focus.
                 *
                 * Defaults to: true.
                 *
                 * @protected
                 * @cfg {Boolean} focusable
                 */
                /**
                 * @ignore
                 */
                focusable: {
                    value: true
                },

                /**
                 * 1. Whether allow select this component's text.<br/>
                 * 2. Whether not to lose last component's focus if click current one (set false).
                 *
                 * Defaults to: false
                 *
                 * @cfg {Boolean} allowTextSelection
                 * @protected
                 */
                /**
                 * @ignore
                 */
                allowTextSelection: {
                    // 和 focusable 分离
                    // grid 需求：容器允许选择里面内容
                    value: false
                },

                /**
                 * This component's prefix css class.
                 * @cfg {String} prefixCls
                 */
                /**
                 * @ignore
                 */
                prefixCls: {
                    value: S.config('component/prefixCls') || 'ks-'
                },
                /**
                 * This component's prefix xclass. Only be used in cfg.
                 * To use this property as 'xclass' when not specified 'xclass' and 'xtype'
                 * @cfg {String} prefixXClass
                 */
                /**
                 * @ignore
                 */
                prefixXClass: {
                },

                /**
                 * This component's parent component.
                 * @type {KISSY.Component.Control}
                 * @property parent
                 * @readonly
                 */
                /**
                 * This component's parent component.
                 * @cfg {KISSY.Component.Control} parent
                 */
                /**
                 * @ignore
                 */
                parent: {
                    setter: function (p, prev) {
                        if ((prev = this.get('parent'))) {
                            this.removeTarget(prev);
                        }
                        if (p) {
                            this.addTarget(p);
                        }
                    }
                },


                XTemplate: {
                    value: XTemplateRuntime
                },

                contentTpl: {
                    value: function (scope, buffer) {
                        return buffer.write(scope.get('content'));
                    }
                }
            }
        });

    /**
     * create a new control extend component/control, extensions and static/prototype properties/methods.
     * @param {Function[]} [extensions] extension classes
     * @param {Object} [px] key-value map for prototype properties/methods.
     * @param {Object} [sx] key-value map for static properties/methods.
     * @param {String} [sx.xclass] new Control 's xclass.
     * @return {Function} new control which extend called, it also has a static extend method
     * @static
     *
     * for example:
     *
     *      var Parent = Control.extend({
     *          isParent: 1
     *      });
     *      var Child = Parent.extend({
     *          isChild: 1,
     *          isParent: 0
     *      })
     */
    Control.extend = function extend(extensions, px, sx) {
        /*jshint unused: false*/
        var args = S.makeArray(arguments),
            self = this,
            xclass,
            argsLen = args.length,
            parsers = {},
            last = args[argsLen - 1];

        if (last && (xclass = last.xclass)) {
            last.name = xclass;
        }

        var NewClass = Base.extend.apply(self, arguments);
        NewClass[HTML_PARSER] = NewClass[HTML_PARSER] || {};
        if (S.isArray(extensions)) {
            // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
            // 主类最优先
            S.each(extensions.concat(NewClass), function (ext) {
                if (ext) {
                    // 合并 HTML_PARSER 到主类
                    S.each(ext.HTML_PARSER, function (v, name) {
                        parsers[name] = v;
                    });
                }
            });
            NewClass[HTML_PARSER] = parsers;
        }
        S.mix(NewClass[HTML_PARSER], self[HTML_PARSER], false);
        NewClass.extend = extend;

        if (xclass) {
            Manager.setConstructorByXClass(xclass, NewClass);
        }

        return NewClass;
    };

    /**
     * Parse attribute from existing dom node.
     * @static
     * @protected
     * @property HTML_PARSER
     * @member KISSY.Component
     *
     * for example:
     *     @example
     *     Overlay.HTML_PARSER={
     *          // el: root element of current component.
     *          "isRed":function(el){
     *              return el.hasClass("ks-red");
     *          }
     *      };
     */

    return Control;
});
/*
 yiminghe@gmail.com - 2012.10.31
 - 考虑触屏，绑定 Event.Gesture.tap 为主行为事件
 - handleMouseDown/up 对应 Gesture.start/end

 事件冒泡机制
 - child 组件的冒泡源配置为其所属的 parent
 - 性能考虑:不是 child 的所有事件都冒泡到 parent，要具体配置哪些事件需要冒泡

 view 和 control 的平行关系
 - control 初始化 -> initializer -> new view()
 - control createDom -> createDom -> view.createDom()
 - control renderUI -> renderUI -> view.render()

 控制层元属性配置中 view 的作用
 - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中

 observer synchronization, model 分成两类
 - view 负责监听 view 类 model 变化更新界面
 - control 负责监听 control 类变化改变逻辑

 problem: Observer behavior is hard to understand and debug
 because it's implicit behavior.

 Keeping screen state and session state synchronized is an important task
 Data Binding.

 In general data binding gets tricky
 because if you have to avoid cycles where a change to the control,
 changes the record set, which updates the control,
 which updates the record set....
 The flow of usage helps avoid these -
 we load from the session state to the screen when the screen is opened,
 after that any changes to the screen state propagate back to the session state.
 It's unusual for the session state to be updated directly once the screen is up.
 As a result data binding might not be entirely bi-directional -
 just confined to initial upload and
 then propagating changes from the controls to the session state.

 Refer
 - http://martinfowler.com/eaaDev/uiArchs.html
 */