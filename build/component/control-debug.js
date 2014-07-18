/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
/*
combined modules:
component/control
component/control/manager
component/control/render-xtpl
*/
KISSY.add('component/control', [
    'util',
    'node',
    'event/gesture/basic',
    'event/gesture/tap',
    './control/manager',
    'base',
    './control/render-xtpl',
    'ua',
    'feature',
    'xtemplate/runtime'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Base Control class for KISSY Component.
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var $ = require('node');
    var BasicGesture = require('event/gesture/basic');
    var TapGesture = require('event/gesture/tap');
    var Manager = require('./control/manager');
    var Base = require('base');
    var RenderTpl = require('./control/render-xtpl');
    var UA = require('ua');
    var Feature = require('feature');
    var __getHook = Base.prototype.__getHook;
    var startTpl = RenderTpl;
    var endTpl = '</div>';
    var isTouchGestureSupported = Feature.isTouchGestureSupported();
    var noop = util.noop;
    var XTemplateRuntime = require('xtemplate/runtime');
    var trim = util.trim;
    var doc = document;
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
        var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
        for (; i < l; i++) {
            e = extras[i];
            e = e ? '-' + e : e;
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
    function applyParser(srcNode) {
        var self = this, attr, attrName, ret;
        var attrs = self.getAttrs();    // 从 parser 中，默默设置属性，不触发事件
                                        // html parser 优先，超过 js 配置值
        // 从 parser 中，默默设置属性，不触发事件
        // html parser 优先，超过 js 配置值
        for (attrName in attrs) {
            attr = attrs[attrName];    // dom node retriever
            // dom node retriever
            if (attr.parse) {
                // html parser 放弃
                ret = attr.parse.call(self, srcNode);
                if (ret !== undefined) {
                    self.setInternal(attrName, ret);
                }
            }
        }
    }    // scope option
    // scope option
    function getBaseCssClassesCmd(_, options) {
        return this.root.config.control.getBaseCssClasses(options && options.params && options.params[0]);
    }
    function getBaseCssClassCmd() {
        return this.root.config.control.getBaseCssClass(arguments[1].params[0]);
    }    /**
 * Base Control class for KISSY Component.
 * @extends KISSY.Base
 * @class KISSY.Component.Control
 */
    /**
 * Base Control class for KISSY Component.
 * @extends KISSY.Base
 * @class KISSY.Component.Control
 */
    var Control = module.exports = Base.extend({
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
            initializer: function () {
                var self = this;
                var attrName, attr;
                var attrs = self.getAttrs();
                self.renderData = {};
                self.childrenElSelectors = {};
                self.renderCommands = {
                    getBaseCssClasses: getBaseCssClassesCmd,
                    getBaseCssClass: getBaseCssClassCmd
                };
                for (attrName in attrs) {
                    attr = attrs[attrName];    // dom node retriever
                    // dom node retriever
                    if (attr.selector) {
                        self.childrenElSelectors[attrName] = attr.selector;
                    }
                }
            },
            beforeCreateDom: function (renderData) {
                var self = this, width, height, visible, elAttrs = self.get('elAttrs'), disabled, attrs = self.getAttrs(), attrName, attr, elStyle = self.get('elStyle'), zIndex, elCls = self.get('elCls');
                for (attrName in attrs) {
                    attr = attrs[attrName];
                    if (attr.render) {
                        renderData[attrName] = self.get(attrName);
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
                if (disabled = self.get('disabled')) {
                    elCls.push(self.getBaseCssClasses('disabled'));
                    elAttrs['aria-disabled'] = 'true';
                }
                if (self.get('highlighted')) {
                    elCls.push(self.getBaseCssClasses('hover'));
                }
            },
            /**
         * Constructor(or get) view object to create ui elements.
         * @protected
         */
            createDom: function () {
                var self = this;    // initialize view
                                    // allow custom view instance
                // initialize view
                // allow custom view instance
                var html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
                self.$el = $(html);
                self.el = self.$el[0];
                self.fillChildrenElsBySelectors();
            },
            decorateDom: function (srcNode) {
                var self = this;
                self.$el = srcNode;
                self.el = srcNode[0];    // retrieve dom node first
                // retrieve dom node first
                self.fillChildrenElsBySelectors();
                applyParser.call(self, srcNode);
            },
            /**
         * Call view object to render ui elements.
         * @protected
         */
            renderUI: function () {
                var self = this;    // after create
                // after create
                Manager.addComponent(self);
                var $el = self.$el;
                if (!self.get('allowTextSelection')) {
                    $el.unselectable();
                }    // need to insert created dom into body
                // need to insert created dom into body
                if (!self.get('srcNode')) {
                    var render = self.get('render'), renderBefore = self.get('elBefore');
                    if (renderBefore) {
                        $el.insertBefore(renderBefore, undefined);
                    } else if (render) {
                        $el.appendTo(render, undefined);
                    } else {
                        $el.appendTo(doc.body, undefined);
                    }
                }
            },
            bindUI: function () {
                var self = this;
                if (self.get('focusable')) {
                    var keyEventTarget = self.getKeyEventTarget();    // remove smart outline in ie
                                                                      // set outline in style for other standard browser
                    // remove smart outline in ie
                    // set outline in style for other standard browser
                    keyEventTarget.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);    // ie9 support outline
                    // ie9 support outline
                    if (UA.ieMode < 9) {
                        keyEventTarget.attr('hideFocus', true);
                    }
                    keyEventTarget.attr('tabindex', self.get('disabled') ? '-1' : '0');
                }
                if (self.get('handleGestureEvents')) {
                    // chrome on windows8 has both mouse and touch event
                    self.$el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self).on(BasicGesture.START, self.handleMouseDown, self).on(BasicGesture.END, self.handleMouseUp, self)    // consider touch environment
.on(TapGesture.TAP, self.handleClick, self);
                }
            },
            syncUI: noop,
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
                    var srcNode = self.get('srcNode');    // collect attr value from dom nodes
                    // collect attr value from dom nodes
                    if (srcNode) {
                        self.decorateDom(srcNode);
                    }    // prepare render info from attr value
                    // prepare render info from attr value
                    self.beforeCreateDom(self.renderData, self.renderCommands, self.childrenElSelectors);    // render dom nodes if not created from srcNode
                    // render dom nodes if not created from srcNode
                    if (!srcNode) {
                        self.createDom();
                    }
                    self.__callPluginsMethod('pluginCreateDom');    /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
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
                var self = this;    // 是否已经渲染过
                // 是否已经渲染过
                if (!self.get('rendered')) {
                    self.create();    /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    self.fire('beforeRenderUI');
                    self.renderUI();
                    self.__callPluginsMethod('pluginRenderUI');    /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    self.fire('afterRenderUI');    /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    self.fire('beforeBindUI');
                    Control.superclass.bindInternal.call(self);
                    self.bindUI();
                    self.__callPluginsMethod('pluginBindUI');    /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    self.fire('afterBindUI');    /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
                    self.fire('beforeSyncUI');
                    Control.superclass.syncInternal.call(self);
                    self.syncUI();
                    self.__callPluginsMethod('pluginSyncUI');    /**
                 * @event afterSyncUI
                 * fired after component 's internal state is synchronized.
                 * @param {KISSY.Event.CustomEvent.Object} e
                 */
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
                var self = this, p, plugins = self.get('plugins');
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
         * @return {KISSY.Node}
         * @ignore
         */
            getKeyEventTarget: function () {
                return this.$el;
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
                var self = this, n, isMouseActionButton = ev.which === 1;
                if (isMouseActionButton || isTouchGestureSupported) {
                    if (self.get('activeable')) {
                        self.set('active', true);
                    }
                    if (self.get('focusable')) {
                        self.focus();
                    }    // touch does not need this
                         // https://github.com/kissyteam/kissy/issues/574
                    // touch does not need this
                    // https://github.com/kissyteam/kissy/issues/574
                    if (!self.get('allowTextSelection') && ev.gestureType === 'mouse') {
                        // firefox /chrome/ie9/i10 不会引起焦点转移
                        // invalid for ie10 buggy?
                        n = ev.target.nodeName;
                        n = n && n.toLowerCase();    // do not prevent focus when click on editable element
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
                var self = this;    // 左键
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
                if (ev.keyCode === $.Event.KeyCode.ENTER) {
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
                var self = this, el = self.$el, childName, selector;
                childrenElSelectors = childrenElSelectors || self.childrenElSelectors;
                for (childName in childrenElSelectors) {
                    selector = childrenElSelectors[childName];
                    var node = selector.call(self, el);
                    if (typeof node === 'string') {
                        node = self.$(node);
                    }
                    self.setInternal(childName, node);
                }
            },
            renderTpl: function (tpl, renderData, renderCommands) {
                var self = this;
                renderData = renderData || self.renderData;
                renderCommands = renderCommands || self.renderCommands;
                return new XTemplateRuntime(tpl, {
                    control: self,
                    commands: renderCommands
                }).render(renderData);
            },
            /**
         * Get component's constructor from KISSY Node.
         * @param prefixCls
         * @param {KISSY.Node} childNode Child component's root node.
         */
            getComponentConstructorByNode: function (prefixCls, childNode) {
                var cls = childNode[0].className;    // 过滤掉特定前缀
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
                var constructor = self.constructor, xclass, re = [];
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
                var componentCssClasses = this.getComponentCssClasses(), i = 0, cls = '', l = componentCssClasses.length, prefixCls = this.get('prefixCls');
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
                return trim(prefixExtra(this.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
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
                el.html(c);    // ie needs to set unselectable attribute recursively
                // ie needs to set unselectable attribute recursively
                if (!this.get('allowTextSelection')) {
                    el.unselectable();
                }
            },
            _onSetVisible: function (visible) {
                var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
                if (visible) {
                    el.removeClass(hiddenCls);
                } else {
                    el.addClass(hiddenCls);
                }    // do not fire event at render phrase
                // do not fire event at render phrase
                this.fire(visible ? 'show' : 'hide');
            },
            /**
         * @ignore
         */
            _onSetHighlighted: function (v) {
                var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },
            /**
         * @ignore
         */
            _onSetDisabled: function (v) {
                var self = this, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
                el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
                if (self.get('focusable')) {
                    //不能被 tab focus 到
                    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
                }
            },
            /**
         * @ignore
         */
            _onSetActive: function (v) {
                var self = this, componentCls = self.getBaseCssClasses('active');
                self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
            },
            _onSetZIndex: function (v) {
                this.$el.css('z-index', v);
            },
            _onSetFocused: function (v) {
                var target = this.getKeyEventTarget()[0];
                if (v) {
                    try {
                        target.focus();
                    } catch (e) {
                    }
                } else {
                    // force to move focus if just this.set('focused',false);
                    // do not changed focus if changed by other component focus
                    if (target.ownerDocument.activeElement === target) {
                        target.ownerDocument.body.focus();
                    }
                }
                var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },
            _onSetX: function (x) {
                this.$el.offset({ left: x });
            },
            _onSetY: function (y) {
                this.$el.offset({ top: y });
            },
            /**
         * @protected
         */
            destructor: function (destroy) {
                var self = this;    // remove instance from manager
                // remove instance from manager
                Manager.removeComponent(self);
                if (destroy !== false && self.$el) {
                    self.$el.remove();
                }
            }
        }, {
            __hooks__: {
                beforeCreateDom: __getHook('__beforeCreateDom'),
                createDom: __getHook('__createDom'),
                decorateDom: __getHook('__decorateDom'),
                renderUI: __getHook('__renderUI'),
                bindUI: __getHook('__bindUI'),
                syncUI: __getHook('__syncUI')
            },
            name: 'control',
            ATTRS: {
                contentTpl: {
                    value: function (scope, buffer) {
                        return buffer.write(scope.get('content'));
                    }
                },
                /**
             * component's html content. Note: content and srcNode can not be set both!
             * @type {String|KISSY.Node}
             * @property content
             */
                /**
             * component's html content. Note: content and srcNode can not be set both!
             * @cfg {String|KISSY.Node} content
             */
                /**
             * @ignore
             */
                content: {
                    parse: function (el) {
                        return el.html();
                    },
                    render: 1,
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
                    render: 1,
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
                    render: 1,
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
                    render: 1,
                    valueFn: function () {
                        return [];
                    },
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
                    render: 1,
                    valueFn: function () {
                        return {};
                    }
                },
                /**
             * name-value pair attribute of component's root element
             * @cfg {Object} elAttrs
             */
                /**
             * @ignore
             */
                elAttrs: {
                    render: 1,
                    valueFn: function () {
                        return {};
                    }
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
                x: {},
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
                y: {},
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
                        var self = this, xy = util.makeArray(v);
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
                        return [
                            this.get('x'),
                            this.get('y')
                        ];
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
                    render: 1,
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
                    render: 1,
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
                activeable: { value: true },
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
                focused: {},
                /**
             * Whether this component is activated.
             * @type {Boolean}
             * @property active
             */
                /**
             * @ignore
             */
                active: { value: false },
                /**
             * Whether this component is highlighted.
             * @type {Boolean}
             * @property highlighted
             */
                /**
             * @ignore
             */
                highlighted: {
                    render: 1,
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
                    render: 1,
                    sync: 0,
                    value: false,
                    parse: function (el) {
                        return el.hasClass(this.getBaseCssClass('disabled'));
                    }
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
                rendered: { value: false },
                /**
             * Whether this component 's dom structure is created.
             * @type {Boolean}
             * @property created
             * @readonly
             */
                /**
             * @ignore
             */
                created: { value: false },
                /**
             * archor element where component append to
             * @cfg {KISSY.Node} render
             */
                /**
             * @ignore
             */
                render: {},
                /**
             * component id
             * @cfg {String} id
             */
                id: {
                    render: 1,
                    parse: function (el) {
                        var id = el.attr('id');
                        if (!id) {
                            id = util.guid('ks-component');
                            el.attr('id', id);
                        }
                        return id;
                    },
                    valueFn: function () {
                        return util.guid('ks-component');
                    }
                },
                /**
             * archor element where component insert before
             * @cfg {KISSY.Node} elBefore
             */
                /**
             * @ignore
             */
                elBefore: {},
                /**
             * root element of current component
             * @type {KISSY.Node}
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
             * parsed for configuration values.
             *
             * @cfg {KISSY.Node|String} srcNode
             */
                /**
             * @ignore
             */
                srcNode: {
                    setter: function (v) {
                        return $(v);
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
                handleGestureEvents: { value: false },
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
                focusable: { value: false },
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
                allowTextSelection: { value: true },
                /**
             * This component's prefix css class.
             * @cfg {String} prefixCls
             */
                /**
             * @ignore
             */
                prefixCls: {
                    render: 1,
                    value: 'ks-'
                },
                /**
             * This component's prefix xclass. Only be used in cfg.
             * To use this property as 'xclass' when not specified 'xclass' and 'xtype'
             * @cfg {String} prefixXClass
             */
                /**
             * @ignore
             */
                prefixXClass: {},
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
                        if (prev = this.get('parent')) {
                            this.removeTarget(prev);
                        }
                        if (p) {
                            this.addTarget(p);
                        }
                    }
                }
            }
        });    /**
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
        var args = util.makeArray(arguments), self = this, xclass, argsLen = args.length, last = args[argsLen - 1];
        if (last && (xclass = last.xclass)) {
            last.name = xclass;
        }
        var NewClass = Base.extend.apply(self, arguments);
        NewClass.extend = extend;
        if (xclass) {
            Manager.setConstructorByXClass(xclass, NewClass);
        }
        return NewClass;
    };
    Control.Manager = Manager;    /*
 yiminghe@gmail.com - 2014.04.08
 - use event modules: event/gesture/basic, event/gesture/tap
 - remove render layer
 - beforeCreateDom is called after srcNode parser

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
});




KISSY.add('component/control/manager', [], function (S, require, exports, module) {
    /**
 * @ignore
 * storage for component
 * @author yiminghe@gmail.com
 */
    var basePriority = 0, Manager,
        // 不带前缀 prefixCls
        /*
 'menu' :{
 constructor:Menu
 }
 */
        uis = {}, componentInstances = {};    /**
 * @class KISSY.Component.Manager
 * @member Component
 * @singleton
 * Manage component metadata.
 */
    /**
 * @class KISSY.Component.Manager
 * @member Component
 * @singleton
 * Manage component metadata.
 */
    module.exports = Manager = {
        __instances: componentInstances,
        /**
     * associate id with component
     * @param {KISSY.Component.Control} component
     */
        addComponent: function (component) {
            componentInstances[component.get('id')] = component;
        },
        /**
     * remove association id with component
     */
        removeComponent: function (component) {
            delete componentInstances[component.get('id')];
        },
        /**
     * get component by id
     * @param {String} id
     * @return {KISSY.Component.Control}
     */
        getComponent: function (id) {
            return componentInstances[id];
        },
        /**
     * Create a component instance using json with xclass.
     * @param {Object|KISSY.Component.Control} component Component's json notation with xclass attribute.
     * @param {String} component.xclass Component to be newed 's xclass.
     * @param {KISSY.Component.Control} parent Component From which new component generated will inherit prefixCls
     * if component 's prefixCls is undefined.
     * @member KISSY.Component
     * @return KISSY.Component.Control
     *
     *  for example:
     *
     *      create({
     *          xclass:'menu',
     *          children:[{
     *              xclass:'menuitem',
     *              content:"1"
     *          }]
     *      })
     */
        createComponent: function (component, parent) {
            var ChildConstructor, xclass;
            if (component) {
                if (!component.isControl && parent) {
                    if (!component.prefixCls) {
                        component.prefixCls = parent.get('prefixCls');
                    }
                    if (!component.xclass && component.prefixXClass) {
                        component.xclass = component.prefixXClass;
                        if (component.xtype) {
                            component.xclass += '-' + component.xtype;
                        }
                    }
                }
                if (!component.isControl && (xclass = component.xclass)) {
                    ChildConstructor = Manager.getConstructorByXClass(xclass);
                    if (!ChildConstructor) {
                        throw new Error('can not find class by xclass desc : ' + xclass);
                    }
                    component = new ChildConstructor(component);
                }
                if (component.isControl && parent) {
                    component.setInternal('parent', parent);
                }
            }
            return component;
        },
        /**
     * Get component constructor by css class name.
     * @param {String} classNames Class names separated by space.
     * @return {Function}
     * @method
     */
        getConstructorByXClass: function (classNames) {
            var cs = classNames.split(/\s+/), p = -1, t, i, uic, ui = null;
            for (i = 0; i < cs.length; i++) {
                uic = uis[cs[i]];
                if (uic && (t = uic.priority) > p) {
                    p = t;
                    ui = uic.constructor;
                }
            }
            return ui;
        },
        /**
     * Associate css class with component constructor.
     * @param {String} className Component's class name.
     * @param {Function} ComponentConstructor Component's constructor.
     * @method
     */
        setConstructorByXClass: function (className, ComponentConstructor) {
            uis[className] = {
                constructor: ComponentConstructor,
                priority: basePriority++
            };
        }
    };
});

KISSY.add('component/control/render-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function renderXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div id="', 0);
        var id0 = scope.resolve(['id'], 0);
        buffer.write(id0, true);
        buffer.write('"\r\n class="', 0);
        var option1 = { escape: 1 };
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option1, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('\r\n', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        var id5 = scope.resolve(['elCls'], 0);
        params4.push(id5);
        option3.params = params4;
        option3.fn = function (scope, buffer) {
            buffer.write('\r\n ', 0);
            var id6 = scope.resolve(['this'], 0);
            buffer.write(id6, true);
            buffer.write('\r\n', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
        buffer.write('\r\n"\r\n\r\n', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        var id9 = scope.resolve(['elAttrs'], 0);
        params8.push(id9);
        option7.params = params8;
        option7.fn = function (scope, buffer) {
            buffer.write('\r\n ', 0);
            var id10 = scope.resolve(['xindex'], 0);
            buffer.write(id10, true);
            buffer.write('="', 0);
            var id11 = scope.resolve(['this'], 0);
            buffer.write(id11, true);
            buffer.write('"\r\n', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option7, buffer, 8);
        buffer.write('\r\n\r\nstyle="\r\n', 0);
        var option12 = { escape: 1 };
        var params13 = [];
        var id14 = scope.resolve(['elStyle'], 0);
        params13.push(id14);
        option12.params = params13;
        option12.fn = function (scope, buffer) {
            buffer.write('\r\n ', 0);
            var id15 = scope.resolve(['xindex'], 0);
            buffer.write(id15, true);
            buffer.write(':', 0);
            var id16 = scope.resolve(['this'], 0);
            buffer.write(id16, true);
            buffer.write(';\r\n', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option12, buffer, 13);
        buffer.write('\r\n">', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});


