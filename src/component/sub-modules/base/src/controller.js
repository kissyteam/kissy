/**
 * @ignore
 * Base Controller class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/controller", function (S, Box, Event, Component, UIBase, Manager, Render, undefined) {

    var ie = S.Env.host.document.documentMode || S.UA.ie,
        Features = S.Features,
        Gesture = Event.Gesture,
        FOCUS_EVENT_GROUP = '.-ks-component-focus' + S.now(),
        MOUSE_EVENT_GROUP = '.-ks-component-mouse' + S.now(),
        isTouchSupported = Features.isTouchSupported();

    function wrapperViewSetter(attrName) {
        return function (ev) {
            var self = this;
            // in case bubbled from sub component
            if (self == ev.target) {
                var value = ev.newVal,
                    view = self.get("view");
                view.set(attrName, value);
            }
        };
    }

    function wrapperViewGetter(attrName) {
        return function (v) {
            var self = this,
                view = self.get("view");
            return v === undefined ? view.get(attrName) : v;
        };
    }

    function defAddChild(e) {
        var self = this;
        if (e.target !== self) {
            return;
        }
        var c = e.component,
            children = self.get('children'),
            index = e.index;
        children.splice(index, 0, c);
        if (self.get('rendered')) {
            c = self.renderChild(c, index);
        }
        self.fire('afterAddChild', {
            component: c,
            index: index
        });
    }

    function defRemoveChild(e) {
        var self = this;
        if (e.target !== self) {
            return;
        }
        var c = e.component,
            cEl,
            cDOMParentEl,
            cDOMEl,
            destroy = e.destroy,
            children = self.get('children'),
            index = e.index;
        if (index != -1) {
            children.splice(index, 1);
        }
        if (c.setInternal) {
            c.setInternal('parent', null);
        }
        if (destroy) {
            // c is still json
            if (c.destroy)
                c.destroy();
        } else {
            if (c.get && (cEl = c.get('el'))) {
                cDOMEl = cEl[0];
                if (cDOMParentEl = cDOMEl.parentNode) {
                    cDOMParentEl.removeChild(cDOMEl);
                }
            }
        }
        self.fire('afterRemoveChild', {
            component: c,
            index: index
        });
    }

    /**
     * 不使用 valueFn，
     * 只有 render 时需要找到默认，其他时候不需要，防止莫名其妙初始化
     * @ignore
     */
    function constructView(self) {
        // 逐层找默认渲染器
        var attrs,
            attrCfg,
            attrName,
            cfg = {},
            v,
            Render = self.get('xrender');

        // 将渲染层初始化所需要的属性，直接构造器设置过去
        attrs = self['getAttrs']();

        // 整理属性，对纯属于 view 的属性，添加 getter setter 直接到 view
        for (attrName in attrs) {
            attrCfg = attrs[attrName];
            if (attrCfg.view) {
                // 先取后 getter
                // 防止死循环
                if (( v = self.get(attrName) ) !== undefined) {
                    cfg[attrName] = v;
                }

                // setter 不应该有实际操作，仅用于正规化比较好
                // attrCfg.setter = wrapperViewSetter(attrName);
                self.on("after" + S.ucfirst(attrName) + "Change",
                    wrapperViewSetter(attrName));
                // 逻辑层读值直接从 view 层读
                // 那么如果存在默认值也设置在 view 层
                // 逻辑层不要设置 getter
                attrCfg.getter = wrapperViewGetter(attrName);
            }
        }
        cfg.ksComponentCss = getComponentCss(self);
        return new Render(cfg);
    }

    function getComponentCss(self) {
        var constructor = self.constructor,
            cls,
            re = [];
        while (constructor && constructor != Controller) {
            cls = Manager.getXClassByConstructor(constructor);
            if (cls) {
                re.push(cls);
            }
            constructor = constructor.superclass && constructor.superclass.constructor;
        }
        return re;
    }

    function isMouseEventWithinElement(e, elem) {
        var relatedTarget = e.relatedTarget;
        // 在里面或等于自身都不算 mouseenter/leave
        return relatedTarget &&
            ( relatedTarget === elem[0] ||
                elem.contains(relatedTarget) );
    }

    function wrapBehavior(self, action) {
        return function (e) {
            if (!self.get("disabled")) {
                self[action](e);
            }
        };
    }

    /**
     * Base Controller class for KISSY Component.
     * xclass: 'controller'.
     * @extends KISSY.Component.UIBase
     * @mixins KISSY.Component.Extension.Box
     * @class KISSY.Component.Controller
     */
    var Controller = UIBase.extend([Box], {

            /**
             * mark current instance as controller instance.
             *
             * access this property directly.
             *
             * for example:
             *
             *      menu.isController // => true
             *
             * @type {Boolean}
             * @member KISSY.Component.Controller
             */
            isController: true,

            /**
             * Get full class name for current component.
             * @param {String} classes class names without prefixCls. Separated by space.
             * @method
             * @protected
             * @return {String} class name with prefixCls
             */
            getCssClassWithPrefix: Manager.getCssClassWithPrefix,

            /**
             * Initialize this component.
             * @protected
             */
            initializer: function () {
                var self = this,
                    defaultChildCfg = self.get('defaultChildCfg');

                self.publish('beforeAddChild', {
                    defaultFn: defAddChild
                });

                self.publish('beforeRemoveChild', {
                    defaultFn: defRemoveChild
                });

                defaultChildCfg.prefixCls = defaultChildCfg.prefixCls ||
                    self.get('prefixCls');
                // initialize view
                self.setInternal("view", constructView(self));
            },

            /**
             * Constructor(or get) view object to create ui elements.
             * @protected
             */
            createDom: function () {
                var self = this,
                    el,
                    view = self.get("view");
                view.create();
                el = view.getKeyEventTarget();
                if (!self.get("allowTextSelection")) {
                    el.unselectable(/**
                     @ignore
                     @type HTMLElement*/undefined);
                }
            },

            /**
             * Call view object to render ui elements.
             * @protected
             *
             */
            renderUI: function () {
                var self = this;
                self.get("view").render();
                self.renderChildren();
            },

            renderChildren: function () {
                var i,
                    self = this,
                    children = self.get("children");
                for (i = 0; i < children.length; i++) {
                    self.renderChild(children[i], i);
                }
            },

            '_onSetFocusable': function (focusable) {
                var self = this,
                    el = self.getKeyEventTarget();
                if (focusable) {
                    el.attr("tabIndex", 0)
                        // remove smart outline in ie
                        // set outline in style for other standard browser
                        .attr("hideFocus", true)
                        .on("focus" + FOCUS_EVENT_GROUP, wrapBehavior(self, "handleFocus"))
                        .on("blur" + FOCUS_EVENT_GROUP, wrapBehavior(self, "handleBlur"))
                        .on("keydown" + FOCUS_EVENT_GROUP, wrapBehavior(self, "handleKeydown"));
                } else {
                    el.removeAttr("tabIndex");
                    el.detach(FOCUS_EVENT_GROUP);
                }
            },

            '_onSetHandleMouseEvents': function (handleMouseEvents) {

                var self = this,
                    el = self.get("el");

                if (handleMouseEvents) {

                    if (!isTouchSupported) {
                        el.on("mouseenter" + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleMouseEnter"))
                            .on("mouseleave" + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleMouseLeave"))
                            .on("contextmenu" + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleContextMenu"))
                    }

                    el.on(Gesture.start + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleMouseDown"))
                        .on(Gesture.end + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleMouseUp"))
                        .on('touchcancel' + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleMouseUp"))
                        // consider touch environment
                        .on(Gesture.tap + MOUSE_EVENT_GROUP, wrapBehavior(self, "performActionInternal"));

                    // click quickly only trigger click and dblclick in ie<9
                    // others click click dblclick
                    if (ie && ie < 9) {
                        el.on("dblclick" + MOUSE_EVENT_GROUP, wrapBehavior(self, "handleDblClick"));
                    }

                } else {
                    el.detach(MOUSE_EVENT_GROUP);
                }
            },

            '_onSetFocused': function (v) {
                var target = this.getKeyEventTarget()[0];
                if (v) {
                    target.focus();
                } else {
                    target.ownerDocument.body.focus();
                }
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

            /**
             * child component's render container.
             * @protected
             * @return {KISSY.NodeList}
             */
            getContentElement: function () {
                return this.get('view').getContentElement();
            },

            /**
             * focusable element of component.
             * @protected
             * @return {KISSY.NodeList}
             */
            getKeyEventTarget: function () {
                return this.get('view').getKeyEventTarget();
            },

            /**
             * Add the specified component as a child of current component
             * at the given 0-based index.
             * @param {KISSY.Component.Controller|Object} c
             * Child component instance to be added
             * or
             * Object describe child component
             * @param {String} [c.xclass] When c is a object, specify its child class.
             * @param {Number} [index]  0-based index at which
             * the new child component is to be inserted;
             * If not specified , the new child component will be inserted at last position.
             * @return {KISSY.Component.Controller} this
             */
            addChild: function (c, index) {
                var self = this,
                    children = self.get("children");
                if (index === undefined) {
                    index = children.length;
                }
                c = Component.create(c, self);
                self.fire('beforeAddChild', {
                    component: c,
                    index: index
                });
                return c;
            },

            renderChild: function (c, childIndex) {
                var self = this,
                    elBefore,
                    domContentEl,
                    children = self.get('children'),
                    cEl,
                    contentEl;
                if (typeof childIndex === "undefined") {
                    childIndex = S.indexOf(c, children);
                }
                c = Component.create(c, self);
                children[childIndex] = c;
                // 生成父组件的 dom 结构
                self.create();
                contentEl = self.getContentElement();
                domContentEl = contentEl[0];
                elBefore = domContentEl.children[childIndex] || null;
                if (c.get('rendered')) {
                    cEl = c.get('el')[0];
                    if (cEl.parentNode != domContentEl) {
                        domContentEl.insertBefore(cEl, elBefore);
                    }
                } else {
                    // set 通知 view 也更新对应属性
                    if (elBefore) {
                        c.set("elBefore", elBefore);
                    } else {
                        c.set("render", contentEl);
                    }
                    // 如果 parent 也没渲染，子组件 create 出来和 parent 节点关联
                    // 子组件和 parent 组件一起渲染
                    // 之前设好属性，view ，logic 同步还没 bind ,create 不是 render ，还没有 bindUI
                    c.render();
                }
                return c;
            },

            /**
             * Removed the given child from this component,and returns it.
             *
             * If destroy is true, calls ``destroy()`` on the removed child component,
             * and subsequently detaches the child's DOM from the document.
             * Otherwise it is the caller's responsibility to
             * clean up the child component's DOM.
             *
             * @param {KISSY.Component.Controller} c The child component to be removed.
             * @param {Boolean} [destroy=true] If true,
             * calls ``destroy()`` on the removed child component.
             */
            removeChild: function (c, destroy) {
                if (destroy === undefined) {
                    destroy = true;
                }
                this.fire('beforeRemoveChild', {
                    component: c,
                    index: S.indexOf(c, this.get('children')),
                    destroy: destroy
                });
            },

            /**
             * Removes every child component attached to current component.
             * see {@link KISSY.Component.Controller#removeChild}
             * @param {Boolean} [destroy] If true,
             * calls ``destroy()`` on the removed child component.
             * @chainable
             */
            removeChildren: function (destroy) {
                var self = this,
                    i,
                    t = [].concat(self.get("children"));
                for (i = 0; i < t.length; i++) {
                    self.removeChild(t[i], destroy);
                }
                return self;
            },

            /**
             * Returns the child at the given index, or null if the index is out of bounds.
             * @param {Number} index 0-based index.
             * @return {KISSY.Component.Controller} The child at the given index; null if none.
             */
            getChildAt: function (index) {
                var children = this.get("children");
                return children[index] || null;
            },

            /**
             * Hack click in ie<9 by handling dblclick events.
             * By default, this performs its associated action by calling
             * {@link KISSY.Component.Controller#performActionInternal}.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleDblClick: function (ev) {
                this.performActionInternal(ev);
            },

            /**
             * Called by it's container component to dispatch mouseenter event.
             * @private
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleMouseOver: function (ev) {
                var self = this,
                    el = self.get("el");
                if (!isMouseEventWithinElement(ev, el)) {
                    self.handleMouseEnter(ev);
                }
            },

            /**
             * Called by it's container component to dispatch mouseleave event.
             * @private
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleMouseOut: function (ev) {
                var self = this,
                    el = self.get("el");
                if (!isMouseEventWithinElement(ev, el)) {
                    self.handleMouseLeave(ev);
                }
            },

            /**
             * Handle mouseenter events. If the component is not disabled, highlights it.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleMouseEnter: function (ev) {
                this.set("highlighted", !!ev);
            },

            /**
             * Handle mouseleave events. If the component is not disabled, de-highlights it.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleMouseLeave: function (ev) {
                var self = this;
                self.set("active", false);
                self.set("highlighted", !ev);
            },

            /**
             * Handles mousedown events. If the component is not disabled,
             * If the component is activeable, then activate it.
             * If the component is focusable, then focus it,
             * else prevent it from receiving keyboard focus.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleMouseDown: function (ev) {
                var self = this,
                    n,
                    isMouseActionButton = ev['which'] == 1,
                    el;
                if (isMouseActionButton || isTouchSupported) {
                    el = self.getKeyEventTarget();
                    if (self.get("activeable")) {
                        self.set("active", true);
                    }
                    if (self.get("focusable")) {
                        el[0].focus();
                        self.set("focused", true);
                    }

                    if (!self.get("allowTextSelection")) {
                        // firefox /chrome 不会引起焦点转移
                        n = ev.target.nodeName;
                        n = n && n.toLowerCase();
                        // do not prevent focus when click on editable element
                        if (n != "input" && n != "textarea") {
                            ev['preventDefault']();
                        }
                    }
                }
            },

            /**
             * Handles mouseup events.
             * If this component is not disabled, performs its associated action by calling
             * {@link KISSY.Component.Controller#performActionInternal}, then deactivates it.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleMouseUp: function (ev) {
                var self = this;
                // 左键
                if (self.get("active") && (ev['which'] == 1 || isTouchSupported)) {
                    self.set("active", false);
                }
            },

            /**
             * Handles context menu.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleContextMenu: function (ev) {
                if (0) {
                    S.log(ev);
                }
            },

            /**
             * Handles focus events. Style focused class.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleFocus: function (ev) {
                this.set("focused", !!ev);
                this.fire("focus");
            },

            /**
             * Handles blur events. Remove focused class.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleBlur: function (ev) {
                this.set("focused", !ev);
                this.fire("blur");
            },

            /**
             * Handle enter keydown event to {@link KISSY.Component.Controller#performActionInternal}.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleKeyEventInternal: function (ev) {
                if (ev['keyCode'] == Event.KeyCodes.ENTER) {
                    return this.performActionInternal(ev);
                }
                return undefined;
            },

            /**
             * Handle keydown events.
             * If the component is not disabled, call {@link KISSY.Component.Controller#handleKeyEventInternal}
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            handleKeydown: function (ev) {
                var self = this;
                if (self.handleKeyEventInternal(ev)) {
                    ev['halt']();
                    return true;
                }
                return undefined;
            },

            /**
             * Performs the appropriate action when this component is activated by the user.
             * @protected
             * @param {KISSY.Event.DOMEventObject} ev DOM event to handle.
             */
            performActionInternal: function (ev) {
                if (0) {
                    S.log(ev);
                }
            },

            /**
             * destroy children
             * @protected
             */
            destructor: function () {
                var self = this,
                    i,
                    view,
                    children = self.get("children");
                for (i = 0; i < children.length; i++) {
                    children[i].destroy && children[i].destroy();
                }
                self.get("view").destroy();
            }
        },
        {
            ATTRS: {

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
                    view: 1,
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
                 * Array of child components
                 * @cfg {KISSY.Component.Controller[]} children
                 */
                /**
                 * @ignore
                 */
                children: {
                    value: []
                },

                /**
                 * This component's prefix css class.
                 * @cfg {String} prefixCls
                 */
                /**
                 * @ignore
                 */
                prefixCls: {
                    value: S.config('component/prefixCls') || 'ks-',
                    view: 1
                },
                /**
                 * This component's prefix xclass. Only be uesd in cfg.
                 * To use this property as 'xclass' when not specified 'xclass' and 'xtype'
                 * @cfg {String} prefixXClass
                 */
                /**
                 * @ignore
                 */
                prefixXClass: {

                },
                /**
                 * This component's xtype, xclass = prefixXClass + xtype.
                 * @cfg {String} prefixXClass
                 */

                /**
                 * This component's parent component.
                 * @type {KISSY.Component.Controller}
                 * @property parent
                 * @readonly
                 */
                /**
                 * This component's parent component.
                 * @cfg {KISSY.Component.Controller} parent
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

                /**
                 * default child config
                 * @protected
                 * @cfg {String} defaultChildCfg
                 */
                /**
                 * @ignore
                 */
                defaultChildCfg: {
                    value: {}
                }
            }
        }, {
            xclass: 'controller'
        });

    return Controller;
}, {
    requires: ['./box', 'event', './impl', './uibase', './manager', './render']
});
/*

 yiminghe@gmail.com - 2012.10.31
 - 考虑触屏，绑定 Event.Gesture.tap 为主行为事件
 - handleMouseDown/up 对应 Gesture.start/end


 事件冒泡机制
 - child 组件的冒泡源配置为其所属的 parent
 - 性能考虑:不是 child 的所有事件都冒泡到 parent，要具体配置哪些事件需要冒泡

 view 和 controller 的平行关系
 - controller 初始化 -> initializer -> new view()
 - controller createDom -> createDom -> view.createDom()
 - controller renderUI -> renderUI -> view.render()


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