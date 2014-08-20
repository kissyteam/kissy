/**
 * @ignore
 * Base Control class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var ComponentProcess = require('./control/process');
    var Manager = require('component/manager');
    var Render = require('./control/render');
    var ie = S.UA.ieMode,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchGestureSupported = Features.isTouchGestureSupported();

    /**
     * Base Control class for KISSY Component.
     * @extends KISSY.Component.Process
     * @class KISSY.Component.Control
     */
    var Control = ComponentProcess.extend({
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

            /**
             * Constructor(or get) view object to create ui elements.
             * @protected
             */
            createDom: function () {
                var self = this,
                    Render = self.get('xrender'),
                    view = self.get('view'),
                    id = self.get('id'),
                    el;
                // initialize view
                // allow custom view instance
                if (view) {
                    view.set('control', self);
                } else {
                    self.set('view', this.view = view = new Render({
                        control: self
                    }));
                }
                view.create();
                el = view.getKeyEventTarget();
                if (!self.get('allowTextSelection')) {
                    el.unselectable();
                }
                // after retrieve id from srcNode
                Manager.addComponent(id, self);
            },

            /**
             * Call view object to render ui elements.
             * @protected
             *
             */
            renderUI: function () {
                this.view.render();
            },

            bindUI: function () {
                var self = this,
                    el = self.view.getKeyEventTarget();

                if (self.get('focusable')) {
                    // remove smart outline in ie
                    // set outline in style for other standard browser
                    el.on('focus', self.handleFocus, self)
                        .on('blur', self.handleBlur, self)
                        .on('keydown', self.handleKeydown, self);
                }

                if (self.get('handleMouseEvents')) {
                    el = self.$el;

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

            sync: function () {
                var self = this;
                self.fire('beforeSyncUI');
                self.syncUI();
                self.view.sync();
                self.__callPluginsMethod('pluginSyncUI');
                self.fire('afterSyncUI');
            },

            createComponent: function (cfg, parent) {
                return Manager.createComponent(cfg, parent || this);
            },

            '_onSetFocused': function (v) {
                var target = this.view.getKeyEventTarget()[0];
                if (v) {
                    target.focus();
                } else {
                    // force to move focus if just this.set('focused',false);
                    // do not changed focus if changed by other component focus
                    if (target.ownerDocument.activeElement === target) {
                        target.ownerDocument.body.focus();
                    }
                }
            },

            '_onSetX': function (x) {
                this.$el.offset({
                    left: x
                });
            },

            '_onSetY': function (y) {
                this.$el.offset({
                    top: y
                });
            },

            _onSetVisible: function (v) {
                // do not fire event at render phrase
                this.fire(v ? 'show' : 'hide');
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
                    var type = ev.originalEvent.type.toLowerCase();
                    if (!self.get('allowTextSelection') &&
                        (type.indexOf('mouse') !== -1 || type.indexOf('pointer') !== -1)) {
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

            /**
             * @protected
             */
            destructor: function () {
                var self = this;
                // remove instance from manager
                Manager.removeComponent(self.get('id'));
                if (self.view) {
                    self.view.destroy();
                } else if (self.get('srcNode')) {
                    self.get('srcNode').remove();
                }
            }
        },
        {
            name: 'control',

            ATTRS: {
                id: {
                    view: 1,
                    valueFn: function () {
                        return S.guid('ks-component');
                    }
                },

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
                    view: 1
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
                    view: 1
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
                    setter: function (el) {
                        // shortcut
                        this.$el = el;
                        this.el = el[0];
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
                    view: 1
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
                    sync: 0,
                    value: true,
                    view: 1
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
                 * Enables or disables mouse event handling for the component.
                 * Containers may set this attribute to disable mouse event handling
                 * in their child component.
                 *
                 * Defaults to: true.
                 *
                 * @cfg {Boolean} handleMouseEvents
                 * @protected
                 */
                /**
                 * @ignore
                 */
                handleMouseEvents: {
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
                    value: true,
                    view: 1
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
                    view: 1
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
                    view: 1,
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
                    view: 1,
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
                    value: false
                },

                /**
                 * Render class.
                 * @protected
                 * @cfg {*} xrender
                 */
                /**
                 * @ignore
                 */
                xrender: {
                    value: Render
                },

                view: {
                    setter: function (v) {
                        this.view = v;
                    }
                }
            }
        });

    function getDefaultRender() {
        var attrs,
            constructor = this;
        do {
            attrs = constructor.ATTRS;
            constructor = constructor.superclass;
        } while (!attrs || !attrs.xrender);
        return attrs.xrender.value;
    }

    Control.getDefaultRender = getDefaultRender;

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
            baseClass = this,
            xclass,
            newClass,
            argsLen = args.length,
            last = args[argsLen - 1];

        if ((xclass = last.xclass)) {
            last.name = xclass;
        }

        newClass = ComponentProcess.extend.apply(baseClass, args);

        if (xclass) {
            Manager.setConstructorByXClass(xclass, newClass);
        }

        newClass.extend = extend;
        newClass.getDefaultRender = getDefaultRender;

        return newClass;
    };

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