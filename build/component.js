/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 1 21:31
*/
/**
 * @ignore
 * Setup component namespace.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base", function (S, UIBase, Manager) {
    /**
     * @class KISSY.Component
     * @singleton
     * Component infrastructure.
     */
    var Component = {
        Manager:Manager,
        UIBase:UIBase
    };

    /**
     * Create a component instance using json with xclass.
     * @param {Object} component Component's json notation with xclass attribute.
     * @param {String} component.xclass Component to be newed 's xclass.
     * @param {KISSY.Component.Controller} self Component From which new component generated will inherit prefixCls
     * if component 's prefixCls is undefined.
     * @member KISSY.Component
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
    Component.create = function (component, self) {
        var childConstructor, xclass;
        if (component && (xclass = component.xclass)) {
            if (self && !component.prefixCls) {
                component.prefixCls = self.get("prefixCls");
            }
            childConstructor = Manager.getConstructorByXClass(xclass);
            if (!childConstructor) {
                S.error("can not find class by xclass desc : " + xclass);
            }
            component = new childConstructor(component);
        }
        return component;
    };

    return Component;
}, {
    requires:['./uibase', './manager']
});/**
 * @ignore
 * @fileOverview mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component", function (S, Component, Controller, Render, Container, DelegateChildren, DecorateChildren, DecorateChild) {

    S.mix(Component, {
        Controller:Controller,
        "Render":Render,
        "Container":Container,
        "DelegateChildren":DelegateChildren,
        "DecorateChild":DecorateChild,
        "DecorateChildren":DecorateChildren
    });

    return Component;
}, {
    requires:[
        'component/base',
        'component/controller',
        'component/render',
        'component/container',
        'component/delegate-children',
        'component/decorate-children',
        'component/decorate-child']
});/**
 * @ignore
 * @fileOverview container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function (S, Controller, DelegateChildren, DecorateChildren) {
    /**
     * @extends KISSY.Component.Controller
     * @class KISSY.Component.Container
     * Container class. Extend it to acquire the abilities of
     * delegating events and decorate from pre-rendered dom
     * for child components.
     */
    return Controller.extend([DelegateChildren, DecorateChildren]);

}, {
    requires: ['./controller', './delegate-children', './decorate-children']
});

/**
 * @ignore
 * TODO
 *  - handleMouseEvents false for container ?
 *//**
 * @ignore
 * @fileOverview Base Controller class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/controller", function (S, Event, Component, UIBase, Manager, Render, undefined) {

    var ie = S.Env.host.document.documentMode || S.UA.ie,
        Features = S.Features,
        Gesture = Event.Gesture,
        isTouchSupported = Features.isTouchSupported || Features.isMsPointerEnabled;

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

    function initChild(self, c, renderBefore) {
        // 生成父组件的 dom 结构
        self.create();
        var contentEl = self.getContentElement();
        c = Component.create(c, self);
        c.setInternal("parent", self);
        // set 通知 view 也更新对应属性
        c.set("render", contentEl);
        c.set("elBefore", renderBefore);
        // 如果 parent 也没渲染，子组件 create 出来和 parent 节点关联
        // 子组件和 parent 组件一起渲染
        // 之前设好属性，view ，logic 同步还没 bind ,create 不是 render ，还没有 bindUI
        c.create(undefined);
        return c;
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
        attrs = self.getAttrs();

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
        // does not autoRender for view
        delete cfg.autoRender;
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
        return re.join(" ");
    }

    function isMouseEventWithinElement(e, elem) {
        var relatedTarget = e.relatedTarget;
        // 在里面或等于自身都不算 mouseenter/leave
        return relatedTarget &&
            ( relatedTarget === elem[0] ||
                elem.contains(relatedTarget) );
    }

    function wrapBehavior(self, action) {
        return self["__ks_wrap_" + action] = function (e) {
            if (!self.get("disabled")) {
                self[action](e);
            }
        };
    }

    function getWrapBehavior(self, action) {
        return self["__ks_wrap_" + action];
    }

    /**
     * Base Controller class for KISSY Component.
     * xclass: 'controller'.
     * @extends KISSY.Component.UIBase
     * @mixins KISSY.Component.UIBase.Box
     * @class KISSY.Component.Controller
     */
    var Controller = UIBase.extend([UIBase.Box], {

            /**
             * mark current instance as controller instance.
             * @type {boolean}
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
             * Initialize this component.             *
             * @protected
             */
            initializer: function () {
                // initialize view
                this.setInternal("view", constructView(this));
            },

            /**
             * Constructor(or get) view object to create ui elements.
             * @protected
             *
             */
            createDom: function () {
                var self = this,
                    el,
                    view = self.get("view");
                view.create(undefined);
                el = view.getKeyEventTarget();
                if (!self.get("allowTextSelection")) {
                    el.unselectable(undefined);
                }
            },

            /**
             * Call view object to render ui elements.
             * @protected
             *
             */
            renderUI: function () {
                var self = this, i, children, child;
                self.get("view").render();
                // then render my children
                children = self.get("children").concat();
                self.get("children").length = 0;
                for (i = 0; i < children.length; i++) {
                    child = self.addChild(children[i]);
                    child.render();
                }
            },

            '_uiSetFocusable': function (focusable) {
                var self = this,
                    t,
                    el = self.getKeyEventTarget();
                if (focusable) {
                    el.attr("tabIndex", 0)
                        // remove smart outline in ie
                        // set outline in style for other standard browser
                        .attr("hideFocus", true)
                        .on("focus", wrapBehavior(self, "handleFocus"))
                        .on("blur", wrapBehavior(self, "handleBlur"))
                        .on("keydown", wrapBehavior(self, "handleKeydown"));
                } else {
                    el.removeAttr("tabIndex");
                    if (t = getWrapBehavior(self, "handleFocus")) {
                        el.detach("focus", t);
                    }
                    if (t = getWrapBehavior(self, "handleBlur")) {
                        el.detach("blur", t);
                    }
                    if (t = getWrapBehavior(self, "handleKeydown")) {
                        el.detach("keydown", t);
                    }
                }
            },

            '_uiSetHandleMouseEvents': function (handleMouseEvents) {

                var self = this, el = self.get("el"), t;

                if (handleMouseEvents) {

                    if (!isTouchSupported) {
                        el.on("mouseenter", wrapBehavior(self, "handleMouseEnter"))
                            .on("mouseleave", wrapBehavior(self, "handleMouseLeave"))
                            .on("contextmenu", wrapBehavior(self, "handleContextMenu"))
                    }

                    el.on(Gesture.start, wrapBehavior(self, "handleMouseDown"))
                        .on(Gesture.end, wrapBehavior(self, "handleMouseUp"))
                        // consider touch environment
                        .on(Gesture.tap, wrapBehavior(self, "performActionInternal"));

                    // click quickly only trigger click and dblclick in ie<9
                    // others click click dblclick
                    if (ie && ie < 9) {
                        el.on("dblclick", wrapBehavior(self, "handleDblClick"));
                    }

                } else {

                    if (!isTouchSupported) {
                        (t = getWrapBehavior(self, "handleMouseEnter")) &&
                        el.detach("mouseenter", t);
                        (t = getWrapBehavior(self, "handleMouseLeave")) &&
                        el.detach("mouseleave", t);
                        (t = getWrapBehavior(self, "handleContextMenu")) &&
                        el.detach("contextmenu", t);
                    }

                    (t = getWrapBehavior(self, "handleMouseDown")) &&
                    el.detach(Gesture.start, t);
                    (t = getWrapBehavior(self, "handleMouseUp")) &&
                    el.detach(Gesture.end, t);
                    (t = getWrapBehavior(self, "performActionInternal")) &&
                    el.detach(Gesture.tap, t);

                    if (ie && ie < 9) {
                        (t = getWrapBehavior(self, "handleDblClick")) &&
                        el.detach("dblclick", t);
                    }
                }
            },

            '_uiSetFocused': function (v) {
                if (v) {
                    this.getKeyEventTarget()[0].focus();
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
                    children = self.get("children"),
                    renderBefore;
                if (index === undefined) {
                    index = children.length;
                }
                renderBefore = children[index] && children[index].get("el") || null;
                c = initChild(self, c, renderBefore);
                children.splice(index, 0, c);
                // 先 create 占位 再 render
                // 防止 render 逻辑里读 parent.get("children") 不同步
                // 如果 parent 已经渲染好了子组件也要立即渲染，就 创建 dom ，绑定事件
                if (self.get("rendered")) {
                    c.render();
                }
                return c;
            },

            /**
             * Removed the given child from this component,and returns it.
             *
             * If destroy is true, calls {@link KISSY.Component.UIBase#destroy} on the removed child component,
             * and subsequently detaches the child's DOM from the document.
             * Otherwise it is the caller's responsibility to
             * clean up the child component's DOM.
             *
             * @param {KISSY.Component.Controller} c The child component to be removed.
             * @param {Boolean} [destroy=false] If true,
             * calls {@link KISSY.Component.UIBase#destroy} on the removed child component.
             * @return {KISSY.Component.Controller} The removed component.
             */
            removeChild: function (c, destroy) {
                var self = this,
                    children = self.get("children"),
                    index = S.indexOf(c, children);
                if (index != -1) {
                    children.splice(index, 1);
                }
                if (destroy &&
                    // c is still json
                    c['destroy']) {
                    c['destroy']();
                }
                return c;
            },

            /**
             * Removes every child component attached to current component.
             * see {@link KISSY.Component.Controller#removeChild}
             * @param {Boolean} [destroy] If true,
             * calls {@link KISSY.Component.UIBase#destroy} on the removed child component.
             * @return {KISSY.Component.Controller} this
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
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleDblClick: function (ev) {
                this.performActionInternal(ev);
            },

            /**
             * Called by it's container component to dispatch mouseenter event.
             * @private
             * @param {KISSY.Event.Object} ev DOM event to handle.
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
             * @param {KISSY.Event.Object} ev DOM event to handle.
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
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleMouseEnter: function (ev) {
                this.set("highlighted", !!ev);
            },

            /**
             * Handle mouseleave events. If the component is not disabled, de-highlights it.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
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
             * @param {KISSY.Event.Object} ev DOM event to handle.
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
                            ev.preventDefault();
                        }
                    }
                }
            },

            /**
             * Handles mouseup events.
             * If this component is not disabled, performs its associated action by calling
             * {@link KISSY.Component.Controller#performActionInternal}, then deactivates it.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleMouseUp: function (ev) {
                var self = this;
                // 左键
                if (self.get("active") && (ev.which == 1 || isTouchSupported)) {
                    self.set("active", false);
                }
            },

            /**
             * Handles context menu.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleContextMenu: function (ev) {
            },

            /**
             * Handles focus events. Style focused class.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleFocus: function (ev) {
                this.set("focused", !!ev);
                this.fire("focus");
            },

            /**
             * Handles blur events. Remove focused class.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleBlur: function (ev) {
                this.set("focused", !ev);
                this.fire("blur");
            },

            /**
             * Handle enter keydown event to {@link KISSY.Component.Controller#performActionInternal}.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleKeyEventInternal: function (ev) {
                if (ev.keyCode == Event.KeyCodes.ENTER) {
                    return this.performActionInternal(ev);
                }
            },

            /**
             * Handle keydown events.
             * If the component is not disabled, call {@link KISSY.Component.Controller#handleKeyEventInternal}
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            handleKeydown: function (ev) {
                var self = this;
                if (self.handleKeyEventInternal(ev)) {
                    ev.halt();
                    return true;
                }
            },

            /**
             * Performs the appropriate action when this component is activated by the user.
             * @protected
             * @param {KISSY.Event.Object} ev DOM event to handle.
             */
            performActionInternal: function (ev) {
            },

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
                    view: 1
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
                    view: 1
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
                    value: 'ks-', // box srcNode need
                    view: 1
                },

                /**
                 * This component's parent component.
                 * @type {KISSY.Component.Controller}
                 * @property parent
                 */
                /**
                 * This component's parent component.
                 * @cfg {KISSY.Component.Controller} parent
                 */
                /**
                 * @ignore
                 */
                parent: {
                    setter: function (p) {
                        // 事件冒泡源
                        this.addTarget(p);
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
                    view: 1
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
                }
            }
        }, {
            xclass: 'controller'
        });

    return Controller;
}, {
    requires: ['event', './base', './uibase', './manager', './render']
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

 *//**
 * @ignore
 * @fileOverview decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decorate-child", function (S, DecorateChildren) {
    function DecorateChild() {

    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal:function (element) {
            var self = this;
            // 不用 setInternal , 通知 view 更新
            self.set("el", element);
            var ui = self.get("decorateChildCls"),
                child = element.one("." + ui);
            // 可以装饰?
            if (child) {
                var UI = self.findUIConstructorByNode(child, 1);
                if (UI) {
                    // 可以直接装饰
                    self.decorateChildrenInternal(UI, child);
                } else {
                    // 装饰其子节点集合
                    self.decorateChildren(child);
                }
            }
        }
    });

    return DecorateChild;
}, {
    requires:['./decorate-children']
});/**
 * @ignore
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decorate-children", function (S, Manager) {


    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        /**
         * Generate child component from root element.
         * @protected
         * @member KISSY.Component.Container
         * @param {KISSY.NodeList} el Root element of current component.
         */
        decorateInternal: function (el) {
            var self = this;
            // 不用 setInternal , 通知 view 更新
            self.set("el", el);
            self.decorateChildren(el);
        },

        /**
         * Get component's constructor from KISSY Node.
         * @member KISSY.Component.Container
         * @protected
         * @param {KISSY.NodeList} childNode Child component's root node.
         */
        findUIConstructorByNode: function (childNode, ignoreError) {
            var self = this,
                cls = childNode.attr("class") || "",
                prefixCls = self.get("prefixCls");
            // 过滤掉特定前缀
            cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
            var UI = Manager.getConstructorByXClass(cls);
            if (!UI && !ignoreError) {
                S.log(childNode);
                S.error("can not find ui " + cls + " from this markup");
            }
            return UI;
        },

        // 生成一个组件
        decorateChildrenInternal: function (UI, c) {
            var self = this;
            self.addChild(new UI({
                srcNode: c,
                prefixCls: self.get("prefixCls")
            }));
        },

        /**
         * decorate child element from parent component's root element.
         * @private
         * @member KISSY.Component.Container
         * @param {KISSY.NodeList} el component's root element.
         */
        decorateChildren: function (el) {
            var self = this,
                children = el.children();
            children.each(function (c) {
                var UI = self.findUIConstructorByNode(c);
                self.decorateChildrenInternal(UI, c);
            });
        }
    });

    return DecorateChildren;

}, {
    requires: ['./manager']
});/**
 * @ignore
 * @fileOverview delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/delegate-children", function (S, UA, Event) {

    var ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Event.Gesture,
        isTouchSupported = Features.isTouchSupported || Features.isMsPointerEnabled;

    function DelegateChildren() {
    }

    function handleChildMouseEvents(e) {
        if (!this.get("disabled")) {
            var control = this.getOwnerControl(e.target, e);
            if (control && !control.get("disabled")) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case Gesture.start:
                        control.handleMouseDown(e);
                        break;
                    case Gesture.end:
                        control.handleMouseUp(e);
                        break;
                    case Gesture.tap:
                        control.performActionInternal(e);
                        break;
                    case "mouseover":
                        control.handleMouseOver(e);
                        break;
                    case "mouseout":
                        control.handleMouseOut(e);
                        break;
                    case "contextmenu":
                        control.handleContextMenu(e);
                        break;
                    case "dblclick":
                        control.handleDblClick(e);
                        break;
                    default:
                        S.error(e.type + " unhandled!");
                }
            }
        }
    }

    DelegateChildren.ATTRS = {
        delegateChildren: {
            value: true
        }
    };

    S.augment(DelegateChildren, {

        __bindUI: function () {
            var self = this,
                events;
            if (self.get("delegateChildren")) {

                events = Gesture.start + " " + Gesture.end + " " + Gesture.tap + " ";

                if (!isTouchSupported) {
                    events += "mouseover mouseout contextmenu " +
                        (ie && ie < 9 ? "dblclick " : "");
                }

                self.get("el").on(events, handleChildMouseEvents, self);
            }
        },

        /**
         * Get child component which contains current event target node.
         * @protected
         * @member KISSY.Component.Container
         * @param {HTMLElement} target Current event target node.
         * @return {KISSY.Component.Controller}
         */
        getOwnerControl: function (target) {
            var self = this,
                children = self.get("children"),
                len = children.length,
                elem = self.get("el")[0];
            while (target && target !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("el")[0] === target) {
                        return children[i];
                    }
                }
                target = target.parentNode;
            }
            return null;
        }
    });

    return DelegateChildren;
}, {
    requires: ['ua', 'event']
});/**
 * @ignore
 * @fileOverview storage for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/manager", function (S) {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         constructor:Menu
         }
         */
    };

    function getConstructorByXClass(cls) {
        var cs = cls.split(/\s+/), p = -1, t, ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && (t = uic.priority) > p) {
                p = t;
                ui = uic.constructor;
            }
        }
        return ui;
    }

    function getXClassByConstructor(constructor) {
        for (var u in uis) {
            var ui = uis[u];
            if (ui.constructor == constructor) {
                return u;
            }
        }
        return 0;
    }

    function setConstructorByXClass(cls, uic) {
        if (S.isFunction(uic)) {
            uis[cls] = {
                constructor:uic,
                priority:0
            };
        } else {
            uic.priority = uic.priority || 0;
            uis[cls] = uic;
        }
    }


    function getCssClassWithPrefix(cls) {
        var cs = S.trim(cls).split(/\s+/);
        for (var i = 0; i < cs.length; i++) {
            if (cs[i]) {
                cs[i] = this.get("prefixCls") + cs[i];
            }
        }
        return cs.join(" ");
    }


    var componentInstances = {};

    /**
     * @class KISSY.Component.Manager
     * @member Component
     * @singleton
     * Manage component metadata.
     */
    var Manager =  {

        __instances:componentInstances,

        /**
         * associate id with component
         * @param {String} id
         * @param {KISSY.Component.Controller} component
         */
        addComponent:function (id, component) {
            componentInstances[id] = component;
        },

        /**
         * remove association id with component
         * @param {String} id
         */
        removeComponent:function (id) {
            delete componentInstances[id];
        },

        /**
         * get component by id
         * @param {String} id
         * @return {KISSY.Component.Controller}
         */
        'getComponent':function (id) {
            return componentInstances[id];
        },

        /**
         * complete css by prefix prefixCls
         * @return {String}
         * @method
         * @param {String} css
         */
        getCssClassWithPrefix:getCssClassWithPrefix,
        /**
         * Get css class name for this component constructor.
         * @param {Function} constructor Component's constructor.
         * @return {String}
         * @method
         */
        getXClassByConstructor:getXClassByConstructor,
        /**
         * Get component constructor by css class name.
         * @param {String} classNames Class names separated by space.
         * @return {Function}
         * @method
         */
        getConstructorByXClass:getConstructorByXClass,
        /**
         * Associate css class with component constructor.
         * @param {String} className Component's class name.
         * @param {Function} componentConstructor Component's constructor.
         * @method
         */
        setConstructorByXClass:setConstructorByXClass
    };

    Manager.getCssClassWithPrefix = getCssClassWithPrefix;

    return Manager;
});/**
 * @ignore
 * @fileOverview render base class for kissy
 * @author yiminghe@gmail.com
 * @see http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/render", function (S, Component, UIBase, Manager) {

    /**
     * @ignore
     * Base Render class for KISSY Component.
     */
    return UIBase.extend([UIBase.Box.Render],
        {

            /**
             * Get all css class name to be applied to the root element of this component for given state.
             * the css class names are prefixed with component name.
             * @param {String} [state] This component's state info.
             * @ignore
             */
            getCssClassWithState: function (state) {
                var self = this,
                    componentCls = self.get("ksComponentCss")||"";
                state = state || "";
                return self.getCssClassWithPrefix(componentCls.split(/\s+/).join(state + " ") + state);
            },

            /**
             * Get full class name (with prefix) for current component
             * @param classes {String} class names without prefixCls. Separated by space.
             * @method
             * @return {String} class name with prefixCls
             * @ignore
             */
            getCssClassWithPrefix: Manager.getCssClassWithPrefix,

            createDom: function () {
                var self = this;
                self.get("el").addClass(self.getCssClassWithState());
            },

            /**
             * Returns the dom element which is responsible for listening keyboard events.
             * @return {KISSY.NodeList}
             * @ignore
             */
            getKeyEventTarget: function () {
                return this.get("el");
            },

            /**
             * @ignore
             */
            _uiSetHighlighted: function (v) {
                var self = this,
                    componentCls = self.getCssClassWithState("-hover"),
                    el = self.get("el");
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },

            /**
             * @ignore
             */
            _uiSetDisabled: function (v) {
                var self = this,
                    componentCls = self.getCssClassWithState("-disabled"),
                    el = self.get("el");
                el[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr("aria-disabled", v);
                if (self.get("focusable")) {
                    //不能被 tab focus 到
                    self.getKeyEventTarget().attr("tabIndex", v ? -1 : 0);
                }
            },
            /**
             * @ignore
             */
            _uiSetActive: function (v) {
                var self = this,
                    componentCls = self.getCssClassWithState("-active");
                self.get("el")[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr("aria-pressed", !!v);
            },
            /**
             * @ignore
             */
            _uiSetFocused: function (v) {
                var self = this,
                    el = self.get("el"),
                    componentCls = self.getCssClassWithState("-focused");
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },

            /**
             * Return the dom element into which child component to be rendered.
             * @return {KISSY.NodeList}
             * @ignore
             */
            getContentElement: function () {
                return this.get("contentEl") || this.get("el");
            }

        }, {//  screen state
            ATTRS: {

                prefixCls: {
                    value: "ks-"
                },

                focusable: {
                    value: true
                },

                focused: {},

                active: {},

                disabled: {},

                highlighted: {}
            },
            HTML_PARSER: {
                disabled: function (el) {
                    var self = this, componentCls = self.getCssClassWithState("-disabled");
                    return self.get("el").hasClass(componentCls);
                }
            }
        });
}, {
    requires: ['./base', './uibase', './manager']
});/**
 * @ignore
 * @fileOverview uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase", function (S, UIBase, Align, Box, BoxRender, Close, CloseRender, ContentBox, ContentBoxRender, Drag, Loading, LoadingRender, Mask, MaskRender, Position, PositionRender, ShimRender, Resize, StdMod, StdModRender) {
    Close.Render = CloseRender;
    Loading.Render = LoadingRender;
    Mask.Render = MaskRender;
    Position.Render = PositionRender;
    StdMod.Render = StdModRender;
    Box.Render = BoxRender;
    ContentBox.Render = ContentBoxRender;
    S.mix(UIBase, {
        Align:Align,
        Box:Box,
        Close:Close,
        ContentBox:ContentBox,
        Drag:Drag,
        Loading:Loading,
        Mask:Mask,
        Position:Position,
        Shim:{
            Render:ShimRender
        },
        Resize:Resize,
        StdMod:StdMod
    });
    return UIBase;
}, {
    requires:["./uibase/base",
        "./uibase/align",
        "./uibase/box",
        "./uibase/box-render",
        "./uibase/close",
        "./uibase/close-render",
        "./uibase/content-box",
        "./uibase/content-box-render",
        "./uibase/drag",
        "./uibase/loading",
        "./uibase/loading-render",
        "./uibase/mask",
        "./uibase/mask-render",
        "./uibase/position",
        "./uibase/position-render",
        "./uibase/shim-render",
        "./uibase/resize",
        "./uibase/stdmod",
        "./uibase/stdmod-render"]
});/**
 * @ignore
 * @fileOverview Component.UIBase.Align
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add('component/uibase/align', function (S, UA, DOM, Node) {

    var win = S.Env.host;

    // var ieMode = document.documentMode || UA.ie;

    /*
     inspired by closure library by Google
     see http://yiminghe.iteye.com/blog/1124720
     */

    /**
     * @ignore
     * 得到会导致元素显示不全的祖先元素
     */
    function getOffsetParent(element) {
        // ie 这个也不是完全可行
        /*
         <div style="width: 50px;height: 100px;overflow: hidden">
         <div style="width: 50px;height: 100px;position: relative;" id="d6">
         元素 6 高 100px 宽 50px<br/>
         </div>
         </div>
         */
        // element.offsetParent does the right thing in ie7 and below. Return parent with layout!
        //  In other browsers it only includes elements with position absolute, relative or
        // fixed, not elements with overflow set to auto or scroll.
//        if (UA.ie && ieMode < 8) {
//            return element.offsetParent;
//        }
        // 统一的 offsetParent 方法
        var doc = element.ownerDocument,
            body = doc.body,
            parent,
            positionStyle = DOM.css(element, 'position'),
            skipStatic = positionStyle == 'fixed' || positionStyle == 'absolute';

        if (!skipStatic) {
            return element.nodeName.toLowerCase() == 'html' ? null : element.parentNode;
        }

        for (parent = element.parentNode; parent && parent != body; parent = parent.parentNode) {
            positionStyle = DOM.css(parent, 'position');
            if (positionStyle != "static") {
                return parent;
            }
        }
        return null;
    }

    /**
     * @ignore
     * 获得元素的显示部分的区域
     */
    function getVisibleRectForElement(element) {
        var visibleRect = {
                left:0,
                right:Infinity,
                top:0,
                bottom:Infinity
            },
            el,
            scrollX,
            scrollY,
            winSize,
            doc = element.ownerDocument,
            body = doc.body,
            documentElement = doc.documentElement;

        // Determine the size of the visible rect by climbing the dom accounting for
        // all scrollable containers.
        for (el = element; el = getOffsetParent(el);) {
            // clientWidth is zero for inline block elements in ie.
            if ((!UA.ie || el.clientWidth != 0) &&
                // body may have overflow set on it, yet we still get the entire
                // viewport. In some browsers, el.offsetParent may be
                // document.documentElement, so check for that too.
                (el != body && el != documentElement && DOM.css(el, 'overflow') != 'visible')) {
                var pos = DOM.offset(el);
                // add border
                pos.left += el.clientLeft;
                pos.top += el.clientTop;

                visibleRect.top = Math.max(visibleRect.top, pos.top);
                visibleRect.right = Math.min(visibleRect.right,
                    // consider area without scrollBar
                    pos.left + el.clientWidth);
                visibleRect.bottom = Math.min(visibleRect.bottom,
                    pos.top + el.clientHeight);
                visibleRect.left = Math.max(visibleRect.left, pos.left);
            }
        }

        // Clip by window's viewport.
        scrollX = DOM.scrollLeft();
        scrollY = DOM.scrollTop();
        visibleRect.left = Math.max(visibleRect.left, scrollX);
        visibleRect.top = Math.max(visibleRect.top, scrollY);
        winSize = {
            width:DOM.viewportWidth(),
            height:DOM.viewportHeight()
        };
        visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
        visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
        return visibleRect.top >= 0 && visibleRect.left >= 0 &&
            visibleRect.bottom > visibleRect.top &&
            visibleRect.right > visibleRect.left ?
            visibleRect : null;
    }

    function getElFuturePos(elRegion, refNodeRegion, points, offset) {
        var xy,
            diff,
            p1,
            p2;

        xy = {
            left:elRegion.left,
            top:elRegion.top
        };

        p1 = getAlignOffset(refNodeRegion, points[0]);
        p2 = getAlignOffset(elRegion, points[1]);

        diff = [p2.left - p1.left, p2.top - p1.top];

        return {
            left:xy.left - diff[0] + (+offset[0]),
            top:xy.top - diff[1] + (+offset[1])
        };
    }

    function isFailX(elFuturePos, elRegion, visibleRect) {
        return elFuturePos.left < visibleRect.left ||
            elFuturePos.left + elRegion.width > visibleRect.right;
    }

    function isFailY(elFuturePos, elRegion, visibleRect) {
        return elFuturePos.top < visibleRect.top ||
            elFuturePos.top + elRegion.height > visibleRect.bottom;
    }

    function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
        var pos = S.clone(elFuturePos),
            size = {
                width:elRegion.width,
                height:elRegion.height
            };

        if (overflow.adjustX && pos.left < visibleRect.left) {
            pos.left = visibleRect.left;
        }

        // Left edge inside and right edge outside viewport, try to resize it.
        if (overflow['resizeWidth'] &&
            pos.left >= visibleRect.left &&
            pos.left + size.width > visibleRect.right) {
            size.width -= (pos.left + size.width) - visibleRect.right;
        }

        // Right edge outside viewport, try to move it.
        if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
            // 保证左边界和可视区域左边界对齐
            pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
        }

        // Top edge outside viewport, try to move it.
        if (overflow.adjustY && pos.top < visibleRect.top) {
            pos.top = visibleRect.top;
        }

        // Top edge inside and bottom edge outside viewport, try to resize it.
        if (overflow['resizeHeight'] &&
            pos.top >= visibleRect.top &&
            pos.top + size.height > visibleRect.bottom) {
            size.height -= (pos.top + size.height) - visibleRect.bottom;
        }

        // Bottom edge outside viewport, try to move it.
        if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
            // 保证上边界和可视区域上边界对齐
            pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
        }

        return S.mix(pos, size);
    }


    function flip(points, reg, map) {
        var ret = [];
        S.each(points, function (p) {
            ret.push(p.replace(reg, function (m) {
                return map[m];
            }));
        });
        return ret;
    }

    function flipOffset(offset, index) {
        offset[index] = -offset[index];
        return offset;
    }


    /**
     * @class KISSY.Component.UIBase.Align
     * Align extension class.Align component with specified element.
     */
    function Align() {
    }


    Align.__getOffsetParent = getOffsetParent;

    Align.__getVisibleRectForElement = getVisibleRectForElement;

    Align.ATTRS =
    {

        /**
         * alignment config.
         * @type {Object}
         * @property align
         *
         * for example:
         *      @example
         *      {
         *        node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
         *        points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
         *        offset: [0, 0]      // 有效值为 [n, m]
         *      }
         */


        /**
         * alignment config.
         * @cfg {Object} align
         *
         * for example:
         *      @example
         *      {
         *        node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
         *        points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
         *        offset: [0, 0]      // 有效值为 [n, m]
         *      }
         */


        /**
         * @ignore
         */
        align:{
            value:{}
        }
    };

    function getRegion(node) {
        var offset, w, h;
        if (!S.isWindow(node[0])) {
            offset = node.offset();
            w = node.outerWidth();
            h = node.outerHeight();
        } else {
            offset = { left:DOM.scrollLeft(), top:DOM.scrollTop() };
            w = DOM.viewportWidth();
            h = DOM.viewportHeight();
        }
        offset.width = w;
        offset.height = h;
        return offset;
    }

    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     * @param region
     * @param align
     * @ignore
     */
    function getAlignOffset(region, align) {
        var V = align.charAt(0),
            H = align.charAt(1),
            w = region.width,
            h = region.height,
            x, y;

        x = region.left;
        y = region.top;

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

        return { left:x, top:y };
    }

    Align.prototype =    {
        _uiSetAlign:function (v) {
            if (v && v.points) {
                this.align(v.node, v.points, v.offset, v.overflow);
            }
        },

        /*
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @ignore
         * @param {Element} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {String[]} points 对齐方式
         * @param {Number[]} [offset] 偏移
         */
        align:function (refNode, points, offset, overflow) {
            refNode = Node.one(refNode || win);
            offset = offset && [].concat(offset) || [0, 0];
            overflow = overflow || {};

            var self = this,
                el = self.get("el"),
                fail = 0,
            // 当前节点可以被放置的显示区域
                visibleRect = getVisibleRectForElement(el[0]),
            // 当前节点所占的区域, left/top/width/height
                elRegion = getRegion(el),
            // 参照节点所占的区域, left/top/width/height
                refNodeRegion = getRegion(refNode),
            // 当前节点将要被放置的位置
                elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset),
            // 当前节点将要所处的区域
                newElRegion = S.merge(elRegion, elFuturePos);

            // 如果可视区域不能完全放置当前节点时允许调整
            if (visibleRect && (overflow.adjustX || overflow.adjustY)) {

                // 如果横向不能放下
                if (isFailX(elFuturePos, elRegion, visibleRect)) {
                    fail = 1;
                    // 对齐位置反下
                    points = flip(points, /[lr]/ig, {
                        l:"r",
                        r:"l"
                    });
                    // 偏移量也反下
                    offset = flipOffset(offset, 0);
                }

                // 如果纵向不能放下
                if (isFailY(elFuturePos, elRegion, visibleRect)) {
                    fail = 1;
                    // 对齐位置反下
                    points = flip(points, /[tb]/ig, {
                        t:"b",
                        b:"t"
                    });
                    // 偏移量也反下
                    offset = flipOffset(offset, 1);
                }

                // 如果失败，重新计算当前节点将要被放置的位置
                if (fail) {
                    elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
                    S.mix(newElRegion, elFuturePos);
                }

                var newOverflowCfg = {};

                // 检查反下后的位置是否可以放下了
                // 如果仍然放不下只有指定了可以调整当前方向才调整
                newOverflowCfg.adjustX = overflow.adjustX &&
                    isFailX(elFuturePos, elRegion, visibleRect);

                newOverflowCfg.adjustY = overflow.adjustY &&
                    isFailY(elFuturePos, elRegion, visibleRect);

                // 确实要调整，甚至可能会调整高度宽度
                if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
                    newElRegion = adjustForViewport(elFuturePos, elRegion,
                        visibleRect, newOverflowCfg);
                }
            }

            // 新区域位置发生了变化
            if (newElRegion.left != elRegion.left) {
                self.setInternal("x", null);
                self.get("view").setInternal("x", null);
                self.set("x", newElRegion.left);
            }

            if (newElRegion.top != elRegion.top) {
                // https://github.com/kissyteam/kissy/issues/190
                // 相对于屏幕位置没变，而 left/top 变了
                // 例如 <div 'relative'><el absolute></div>
                // el.align(div)
                self.setInternal("y", null);
                self.get("view").setInternal("y", null);
                self.set("y", newElRegion.top);
            }

            // 新区域高宽发生了变化
            if (newElRegion.width != elRegion.width) {
                el.width(el.width() + newElRegion.width - elRegion.width);
            }
            if (newElRegion.height != elRegion.height) {
                el.height(el.height() + newElRegion.height - elRegion.height);
            }

            return self;
        },

        /**
         * Make current element center within node.
         * @param {undefined|String|HTMLElement|KISSY.NodeList} node
         * Same as node config of {@link KISSY.Component.UIBase.Align#cfg-align} .
         */
        center:function (node) {
            var self = this;
            self.set('align', {
                node:node,
                points:["cc", "cc"],
                offset:[0, 0]
            });
            return self;
        }
    };

    return Align;
}, {
    requires:["ua", "dom", "node"]
});
/**
 * @ignore
 *
 *  2012-04-26 yiminghe@gmail.com
 *   - 优化智能对齐算法
 *   - 慎用 resizeXX
 *
 *  2011-07-13 yiminghe@gmail.com note:
 *   - 增加智能对齐，以及大小调整选项
 **//**
 * @ignore
 * @fileOverview UIBase
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('component/uibase/base', function (S, Base, Node, Manager, undefined) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        ucfirst = S.ucfirst,
        noop = S.noop;


    /**
     * @class KISSY.Component.UIBase
     * @extends KISSY.Base
     * UIBase for class-based component.
     */
    function UIBase(config) {
        var self = this, id, srcNode;

        // 读取用户设置的属性值并设置到自身
        Base.apply(self, arguments);

        // register instance if config id
        if (id = self.get("id")) {
            Manager.addComponent(id, self);
        }

        // 根据 srcNode 设置属性值
        // 按照类层次执行初始函数，主类执行 initializer 函数，扩展类执行构造器函数
        initHierarchy(self, config);

        // 特殊的 decorate 等属性从 html 收集完再进行
        if (config &&
            (srcNode = config[SRC_NODE]) &&
            self.decorateInternal) {
            self.decorateInternal(srcNode);
        }

        var listener,
            n,
            plugins = self.get("plugins"),
            listeners = self.get("listeners");

        constructPlugins(plugins);

        actionPlugins(self, plugins, "initializer");

        for (n in listeners) {
            listener = listeners[n];
            self.on(n, listener.fn || listener, listener.scope);
        }

        // 是否自动渲染
        config && config.autoRender && self.render();
    }

    // 收集单继承链，子类在前，父类在后
    function collectConstructorChains(self) {
        var constructorChains = [],
            c = self.constructor;
        while (c) {
            constructorChains.push(c);
            c = c.superclass && c.superclass.constructor;
        }
        return constructorChains;
    }

    /**
     * 模拟多继承
     * init attr using constructors ATTRS meta info
     * @ignore
     */
    function initHierarchy(self, config) {
        var c = self.constructor,
            len,
            p,
            constructorChains,
            srcNode;
        if (config && (srcNode = config[SRC_NODE])) {
            constructorChains = collectConstructorChains(self);
            config[SRC_NODE] = Node.one(srcNode);
            // 从父类到子类开始从 html 读取属性
            for (len = constructorChains.length - 1; len >= 0; len--) {
                c = constructorChains[len];
                if (p = c[HTML_PARSER]) {
                    applyParser.call(self, config, p);
                }
            }
        }
        callMethodByHierarchy(self, "initializer", "constructor");
    }

    function callMethodByHierarchy(self, mainMethod, extMethod) {
        var c = self.constructor,
            extChains = [],
            ext,
            main,
            i,
            exts,
            t;

        // define
        while (c) {

            // 收集扩展类
            t = [];
            if (exts = c.__ks_exts) {
                for (i = 0; i < exts.length; i++) {
                    ext = exts[i];
                    if (ext) {
                        if (extMethod != "constructor") {
                            //只调用真正自己构造器原型的定义，继承原型链上的不要管
                            if (ext.prototype.hasOwnProperty(extMethod)) {
                                ext = ext.prototype[extMethod];
                            } else {
                                ext = null;
                            }
                        }
                        ext && t.push(ext);
                    }
                }
            }

            // 收集主类
            // 只调用真正自己构造器原型的定义，继承原型链上的不要管 !important
            // 所以不用自己在 renderUI 中调用 superclass.renderUI 了，UIBase 构造器自动搜寻
            // 以及 initializer 等同理
            if (c.prototype.hasOwnProperty(mainMethod) && (main = c.prototype[mainMethod])) {
                t.push(main);
            }

            // 原地 reverse
            if (t.length) {
                extChains.push.apply(extChains, t.reverse());
            }

            c = c.superclass && c.superclass.constructor;
        }

        // 初始化函数
        // 顺序：父类的所有扩展类函数 -> 父类对应函数 -> 子类的所有扩展函数 -> 子类对应函数
        for (i = extChains.length - 1; i >= 0; i--) {
            extChains[i] && extChains[i].call(self);
        }
    }

    /**
     * 销毁组件顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
     * @ignore
     */
    function destroyHierarchy(self) {
        var c = self.constructor,
            extensions,
            d,
            i;

        while (c) {
            // 只触发该类真正的析构器，和父亲没关系，所以不要在子类析构器中调用 superclass
            if (c.prototype.hasOwnProperty("destructor")) {
                c.prototype.destructor.apply(self);
            }

            if ((extensions = c.__ks_exts)) {
                for (i = extensions.length - 1; i >= 0; i--) {
                    d = extensions[i] && extensions[i].prototype.__destructor;
                    d && d.apply(self);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }
    }

    function applyParser(config, parser) {
        var self = this, p, v, srcNode = config[SRC_NODE];

        // 从 parser 中，默默设置属性，不触发事件
        for (p in parser) {
            // 用户设置过那么这里不从 dom 节点取
            // 用户设置 > html parser > default value
            if (config[p] === undefined) {
                v = parser[p];
                // 函数
                if (S.isFunction(v)) {
                    self.setInternal(p, v.call(self, srcNode));
                }
                // 单选选择器
                else if (typeof v == 'string') {
                    self.setInternal(p, srcNode.one(v));
                }
                // 多选选择器
                else if (S.isArray(v) && v[0]) {
                    self.setInternal(p, srcNode.all(v[0]))
                }
            }
        }
    }

    /**
     * 根据属性变化设置 UI
     * @ignore
     */
    function bindUI(self) {
        var attrs = self.getAttrs(),
            attr, m;

        for (attr in attrs) {
            m = UI_SET + ucfirst(attr);
            if (self[m]) {
                // 自动绑定事件到对应函数
                (function (attr, m) {
                    self.on('after' + ucfirst(attr) + 'Change', function (ev) {
                        // fix! 防止冒泡过来的
                        if (ev.target === self) {
                            self[m](ev.newVal, ev);
                        }
                    });
                })(attr, m);
            }
        }
    }

    /**
     * 根据当前（初始化）状态来设置 UI
     * @ignore
     */
    function syncUI(self) {
        var v,
            f,
            i,
            c,
            a,
            m,
            cache = {},
            constructorChains = collectConstructorChains(self),
            attrs;

        // 从父类到子类执行同步属性函数
        for (i = constructorChains.length - 1; i >= 0; i--) {
            c = constructorChains[i];
            if (attrs = c[ATTRS]) {
                for (a in attrs) {
                    // 防止子类覆盖父类属性定义造成重复执行
                    if (!cache[a]) {
                        cache[a] = 1;
                        m = UI_SET + ucfirst(a);
                        // 存在方法，并且用户设置了初始值或者存在默认值，就同步状态
                        if ((f = self[m]) &&
                            // 用户如果设置了显式不同步，就不同步，
                            // 比如一些值从 html 中读取，不需要同步再次设置
                            attrs[a].sync !== false &&
                            (v = self.get(a)) !== undefined) {
                            f.call(self, v);
                        }
                    }
                }
            }
        }
    }

    S.extend(UIBase, Base, {

        /**
         * Create dom structure of this component.
         */
        create: function () {
            var self = this;
            // 是否生成过节点
            if (!self.get("created")) {
                /**
                 * @event beforeCreateDom
                 * fired before root node is created
                 * @param {KISSY.Event.Object} e
                 */
                self.fire('beforeCreateDom');
                callMethodByHierarchy(self, "createDom", "__createDom");
                self.setInternal("created", true);
                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.Object} e
                 */
                self.fire('afterCreateDom');
                actionPlugins(self, self.get("plugins"), "createDom");
            }
            return self;
        },

        /**
         * Put dom structure of this component to document and bind event.
         */
        render: function () {
            var self = this, plugins;
            // 是否已经渲染过
            if (!self.get("rendered")) {
                plugins = self.get("plugins");
                self.create(undefined);

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('beforeRenderUI');
                callMethodByHierarchy(self, "renderUI", "__renderUI");

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('afterRenderUI');
                actionPlugins(self, plugins, "renderUI");

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('beforeBindUI');
                bindUI(self);
                callMethodByHierarchy(self, "bindUI", "__bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('afterBindUI');
                actionPlugins(self, plugins, "bindUI");

                /**
                 * @event beforeSyncUI
                 * fired before component 's internal state is synchronized.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('beforeSyncUI');

                syncUI(self);
                callMethodByHierarchy(self, "syncUI", "__syncUI");

                /**
                 * @event afterSyncUI
                 * fired after component 's internal state is synchronized.
                 * @param {KISSY.Event.Object} e
                 */

                self.fire('afterSyncUI');
                actionPlugins(self, plugins, "syncUI");
                self.setInternal("rendered", true);
            }
            return self;
        },

        /**
         * For overridden. DOM creation logic of subclass component.
         * @protected
         * @method
         */
        createDom: noop,

        /**
         * For overridden. Render logic of subclass component.
         * @protected
         * @method
         */
        renderUI: noop,

        /**
         * For overridden. Bind logic for subclass component.
         * @protected
         * @method
         */
        bindUI: noop,

        /**
         * For overridden. Sync attribute with ui.
         * @protected
         * @method
         */
        syncUI: noop,


        /**
         * Destroy this component.
         */
        destroy: function () {
            var self = this,
                id,
                plugins = self.get("plugins");
            actionPlugins(self, plugins, "destructor");
            destroyHierarchy(self);
            self.fire('destroy');
            self.detach();
            // remove instance if set id
            if (id = self.get("id")) {
                Manager.removeComponent(id);
            }
            return self;
        }
    }, {

        ATTRS: {
            /**
             * Whether this component is rendered.
             * @type {Boolean}
             * @property rendered
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
             */
            /**
             * @ignore
             */
            created: {
                value: false
            },

            /**
             * Config listener on created.
             * @cfg {Object} listeners
             *
             * for example:
             *      @example
             *      {
             *          click:{
             *              scope:{x:1},
             *              fn:function(){
             *                  alert(this.x);
             *              }
             *          }
             *      }
             *      // or
             *      {
             *          click:function(){
             *              alert(this.x);
             *          }
             *      }
             */
            /**
             * @ignore
             */
            listeners: {
                value: {}
            },

            /**
             * Plugins for current component.
             * @cfg {Function[]/Object[]} plugins
             */
            /**
             * @ignore
             */
            plugins: {
                value: []
            },

            /**
             * get xclass of current component instance.
             * @property xclass
             * @type {String}
             */
            /**
             * @ignore
             */
            xclass: {
                valueFn: function () {
                    return Manager.getXClassByConstructor(this.constructor);
                }
            }
        }
    });

    function constructPlugins(plugins) {
        S.each(plugins, function (plugin, i) {
            if (S.isFunction(plugin)) {
                plugins[i] = new plugin();
            }
        });
    }

    function actionPlugins(self, plugins, action) {
        S.each(plugins, function (plugin) {
            if (plugin[action]) {
                plugin[action](self);
            }
        });
    }

    function create(base, extensions, px, sx) {
        var args = S.makeArray(arguments),
            baseName,
            name,
            t;

        if (S.isObject(extensions)) {
            sx = px;
            px = extensions;
            extensions = [];
        }

        baseName = name = "UIBaseDerived";

        if (typeof (t = args[args.length - 1]) == 'string') {
            name = t;
        }

        function C() {
            UIBase.apply(this, arguments);
        }

        // debug mode, give the right name for constructor
        // refer : http://limu.iteye.com/blog/1136712
        if (S.Config.debug) {
            eval("C=function " + name.replace(/[-.]/g, "_") + "(){ UIBase.apply(this, arguments);}");
            S.log("UIBase.extend : " + name);
            if (name == baseName) {
                S.log(px);
            }
        }

        S.extend(C, base, px, sx);

        if (extensions) {
            C.__ks_exts = extensions;

            var attrs = {},
                parsers = {},
                prototype = {},
                constructors = extensions['concat'](C);

            // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
            // 主类最优先
            S.each(constructors, function (ext) {
                if (ext) {
                    // 合并 ATTRS/HTML_PARSER 到主类
                    // 不覆盖主类上的定义(主类位于 constructors 最后)
                    // 因为继承层次上扩展类比主类层次高
                    // 注意：最好 value 必须是简单对象，自定义 new 出来的对象就会有问题
                    // (用 function return 出来)!
                    // a {y:{value:2}} b {y:{value:3,getter:fn}}
                    // b is a extension of a
                    // =>
                    // a {y:{value:2,getter:fn}}

                    S.each(ext[ATTRS], function (v, name) {
                        var av = attrs[name] = attrs[name] || {};
                        S.mix(av, v);
                    });

                    S.each(ext[HTML_PARSER], function (v, name) {
                        parsers[name] = v;
                    });

                    // 方法合并
                    var exp = ext.prototype, p;
                    for (p in exp) {
                        // do not mess with parent class
                        if (exp.hasOwnProperty(p)) {
                            prototype[p] = exp[p];
                        }
                    }
                }
            });

            C[ATTRS] = attrs;
            C[HTML_PARSER] = parsers;

            S.augment(C, prototype);
        }

        return C;
    }


    S.mix(UIBase,
        {
            /**
             * Parse attribute from existing dom node.
             * @static
             * @protected
             * @property HTML_PARSER
             * @member KISSY.Component.UIBase
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
            HTML_PARSER: {},

            /**
             * Create a new class which extends UIBase .
             * @param {Function[]} extensions Class constructors for extending.
             * @param {Object} px Object to be mixed into new class 's prototype.
             * @param {Object} sx Object to be mixed into new class.
             * @static
             * @return {KISSY.Component.UIBase} A new class which extends UIBase .
             */
            extend: function extend(extensions, px, sx) {
                var args = S.makeArray(arguments),
                    ret,
                    last = args[args.length - 1];

                args.unshift(this);

                if (last.xclass) {
                    args.pop();
                    args.push(last.xclass);
                }

                ret = create.apply(UIBase, args);

                if (last.xclass) {
                    Manager.setConstructorByXClass(last.xclass, {
                        constructor: ret,
                        priority: last.priority
                    });
                }

                ret.extend = extend;
                return ret;
            }
        });

    return UIBase;
}, {
    requires: ["base", "node", "../manager"]
});
/**
 * @ignore
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **//**
 * @ignore
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/box-render', function (S) {

    var $ = S.all, doc = S.Env.host.document;

    function BoxRender() {
    }

    BoxRender.ATTRS = {
        el: {
            //容器元素
            setter: function (v) {
                return $(v);
            }
        },

        // 构建时批量生成，不需要执行单个
        elCls: {
        },

        elStyle: {
        },

        width: {
        },

        height: {
        },

        elTagName: {
            // 生成标签名字
            value: "div"
        },

        elAttrs: {
        },

        content: {
        },

        elBefore: {
            // better named to renderBefore, too late !
        },

        render: {},

        visible: {
            value: true
        },

        visibleMode: {
            value: "display"
        },
        // content 设置的内容节点,默认根节点
        contentEl: {
            valueFn: function () {
                return this.get("el");
            }
        }
    };

    BoxRender.HTML_PARSER = {
        el: function (srcNode) {
            return srcNode;
        },
        content: function (el) {
            var contentEl = this.get("contentEl") || el;
            return contentEl.html();
        }
    };

    BoxRender.prototype = {

        __renderUI: function () {
            var self = this;
            // 新建的节点才需要摆放定位
            if (!self.get("srcNode")) {
                var render = self.get("render"),
                    el = self.get("el"),
                    renderBefore = self.get("elBefore");
                if (renderBefore) {
                    el.insertBefore(renderBefore, undefined);
                } else if (render) {
                    el.appendTo(render, undefined);
                } else {
                    el.appendTo(doc.body, undefined);
                }
            }
        },

        /**
         * @ignore
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom: function () {
            var self = this, el, contentEl;
            if (!self.get("srcNode")) {
                contentEl = self.get("contentEl");

                el = $("<" + self.get("elTagName") + ">");

                if (contentEl) {
                    el.append(contentEl);
                }

                self.setInternal("el", el);

                if (!contentEl) {
                    // 没取到,这里设下值, uiSet 时可以 set("content")  取到
                    self.setInternal("contentEl", el);
                }
            }
        },

        _uiSetElAttrs: function (attrs) {
            this.get("el").attr(attrs);
        },

        _uiSetElCls: function (cls) {
            this.get("el").addClass(cls);
        },

        _uiSetElStyle: function (style) {
            this.get("el").css(style);
        },

        _uiSetWidth: function (w) {
            this.get("el").width(w);
        },

        _uiSetHeight: function (h) {
            var self = this;
            self.get("el").height(h);
        },

        _uiSetContent: function (c) {
            var self = this, el;
            // srcNode 时不重新渲染 content
            // 防止内部有改变，而 content 则是老的 html 内容
            if (self.get("srcNode") && !self.get("rendered")) {
            } else {
                el = self.get("contentEl");
                if (typeof c == "string") {
                    el.html(c);
                } else if (c) {
                    el.empty().append(c);
                }
            }
        },

        _uiSetVisible: function (visible) {
            var self = this,
                el = self.get("el"),
                shownCls = self.getCssClassWithState('-shown'),
                hiddenCls = self.getCssClassWithState('-hidden'),
                visibleMode = self.get("visibleMode");
            if (visible) {
                el.removeClass(hiddenCls);
                el.addClass(shownCls);
            } else {
                el.removeClass(shownCls);
                el.addClass(hiddenCls);
            }
            //return;
            // !TODO 兼容代码，去除，通过 css 控制隐藏属性
            if (visibleMode == "visibility") {
                el.css("visibility", visible ? "visible" : "hidden");
            } else {
                el.css("display", visible ? "" : "none");
            }
        },

        __destructor: function () {
            var el = this.get("el");
            if (el) {
                el.remove();
            }
        }
    };

    return BoxRender;
}, {
    requires: ['node']
});
/**
 * @ignore
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/box', function () {

    /**
     * Box extension class.Represent a dom element.
     * @class KISSY.Component.UIBase.Box
     */
    function Box() {
    }

    Box.ATTRS =
    {
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
            view: 1
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
            view: 1
        },

        /**
         * name-value pair css style of component's root element
         * @cfg {Object} elStyle
         */
        /**
         * @ignore
         */
        elStyle: {
            view: 1
        },

        /**
         * name-value pair attribute of component's root element
         * @cfg {Object} elAttrs
         */
        /**
         * @ignore
         */
        elAttrs: {
            view: 1
        },

        /**
         * archor element where component insert before
         * @cfg {KISSY.NodeList} elBefore
         */
        /**
         * @ignore
         */
        elBefore: {
            // better named to renderBefore, too late !
            view: 1
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
            view: 1
        },

        /**
         * component's visibleMode,use css "display" or "visibility" to show this component
         * @cfg {String} visibleMode
         */
        /**
         * @ignore
         */
        visibleMode: {
            view: 1
        },

        /**
         * whether this component is visible after created.
         * will add css class {prefix}{component}-hidden or {prefix}{component}-shown to component's root el.
         *
         * Defaults to: true.
         *
         * @cfg {Boolean} visible
         */
        /**
         * whether this component is visible.
         * will add css class {prefix}{component}-hidden or {prefix}{component}-shown to component's root el.
         * @type {Boolean}
         * @property visible
         */
        /**
         * @ignore
         */
        visible: {
            value: true,
            view: 1
        },

        /**
         * the node to parse for configuration values,passed to component's HTML_PARSER definition
         * @cfg {KISSY.NodeList} srcNode
         */
        /**
         * @ignore
         */
        srcNode: {
            view: 1
        }
    };

    Box.prototype =
    {

        _uiSetVisible: function (v) {
            // do not fire event at render phrase
            if (this.get('rendered')) {
                this.fire(v ? "show" : "hide");
            }
        },

        /**
         * show component
         */
        show: function () {
            var self = this;
            self.render();
            self.set("visible", true);
            return self;
        },

        /**
         * hide component
         */
        hide: function () {
            var self = this;
            self.set("visible", false);
            return self;
        }
    };

    return Box;
});
/**
 * @ignore
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/close-render", function (S, Node) {

    var CLS_PREFIX = 'ext-';

    function getCloseRenderBtn(prefixCls) {
        return new Node("<a " +
            "tabindex='0' " +
            "href='javascript:void(\"关闭\")' " +
            "role='button' " +
            "style='z-index:9' " +
            "class='" + prefixCls + CLS_PREFIX + "close" + "'>" +
            "<span class='" +
            prefixCls + CLS_PREFIX + "close-x" +
            "'>关闭<" + "/span>" +
            "<" + "/a>");
    }

    function CloseRender() {
    }

    CloseRender.ATTRS = {
        closable: {
            value: true
        },
        closeBtn: {
        }
    };

    CloseRender.HTML_PARSER = {
        closeBtn: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + 'close');
        }
    };

    CloseRender.prototype = {
        _uiSetClosable: function (v) {
            var self = this,
                btn = self.get("closeBtn");
            if (v) {
                if (!btn) {
                    self.setInternal("closeBtn", btn = getCloseRenderBtn(self.get('prefixCls')));
                }
                self.get("el").prepend(btn);
            } else {
                if (btn) {
                    btn.remove();
                }
            }
        }
    };

    return CloseRender;

}, {
    requires: ["node"]
});/**
 * @ignore
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/close", function () {

    /**
     * @class KISSY.Component.UIBase.Close
     * Close extension class. Represent a close button.
     */
    function Close() {
    }

    var HIDE = "hide";

    Close.ATTRS =    {
        /**
         * Whether close button is visible.
         *
         * Defaults to: true.
         *
         * @cfg {Boolean} closable
         */
        /**
         * Whether close button is visible.
         * @type {Boolean}
         * @property closable
         */
        /**
         * @ignore
         */
        closable:{
            view:1
        },

        /**
         * close button element.
         * @type {KISSY.NodeList}
         * @property closeBtn
         * @readonly
         */
        /**
         * @ignore
         */
        closeBtn:{
            view:1
        },

        /**
         * Whether to destroy or hide current element when click close button.
         * Can set "destroy" to destroy it when click close button.
         *
         * Defaults to: "hide".
         *
         * @cfg {String} closeAction
         */
        /**
         * @ignore
         */
        closeAction:{
            value:HIDE
        }
    };

    var actions = {
        hide:HIDE,
        destroy:"destroy"
    };

    Close.prototype = {
        _uiSetClosable:function (v) {
            var self = this;
            if (v && !self.__bindCloseEvent) {
                self.__bindCloseEvent = 1;
                self.get("closeBtn").on("click", function (ev) {
                    self.close();
                    ev.preventDefault();
                });
            }
        },
        /**
         * hide or destroy according to {@link KISSY.Component.UIBase.Close#closeAction}
         */
        close:function(){
            var self=this;
            self[actions[self.get("closeAction")] || HIDE]();
        },
        __destructor:function () {
            var btn = this.get("closeBtn");
            btn && btn.detach();
        }
    };
    return Close;

});/**
 * @ignore
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/content-box-render", function (S, Node, BoxRender, DOM) {

    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl: {
            // 不写 valueFn, 留待 createDom 处理
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    ContentBoxRender.prototype = {
        __createDom: function () {
            var self = this,
                contentEl,
                el = self.get("el");

            var childNodes = el[0].childNodes,
                c = childNodes.length && DOM.nodeListToFragment(childNodes);

            // 产生新的 contentEl
            contentEl = Node.all("<div class='" + self.get('prefixCls') + "contentbox'>" +
                "</div>").append(c);

            el.append(contentEl);

            self.setInternal("contentEl", contentEl);
        }
    };

    return ContentBoxRender;
}, {
    requires: ["node", "./box-render", 'dom']
});/**
 * @ignore
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/content-box", function () {

    /**
     * @class KISSY.Component.UIBase.ContentBox
     * ContentBox extension class. Represent inner element of component's root element.
     */
    function ContentBox() {
    }

    ContentBox.ATTRS = {

        /**
         * content box's element of component.
         * @type {KISSY.NodeList}
         * @readonly
         * @property contentEl
         */
        /**
         * @ignore
         */
        contentEl: {
            view: 1
        }
    };

    return ContentBox;
});/**
 * @ignore
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/drag", function (S) {

    /**
     * @class KISSY.Component.UIBase.Drag
     * Drag extension class. Make element draggable.
     */
    function Drag() {
    }

    Drag.ATTRS = {
        /**
         * Whether current element is draggable and draggable config.
         * @cfg {Boolean|Object} draggable
         *
         * for example:
         *      @example
         *      {
         *          proxy:{
         *              // see {@link KISSY.DD.Proxy} config
         *          },
         *          scroll:{
         *              // see {@link KISSY.DD.Scroll} config
         *          },
         *          constrain:{
         *              // see {@link KISSY.DD.Constrain} config
         *          },
         *      }
         */
        /**
         * @ignore
         */
        draggable: {
            setter: function (v) {
                if (v === true) {
                    return {};
                }
            },
            value: {}
        }
    };

    Drag.prototype = {

        _uiSetDraggable: function (dragCfg) {
            var self = this,
                handlers,
                DD = S.require("dd"),
                Draggable,
                p,
                d = self.__drag,
                __constrain = self.__constrain,
                el = self.get("el");

            if (dragCfg && !d && DD) {

                Draggable = DD.Draggable;

                d = self.__drag = new Draggable({
                    node: el,
                    move: 1
                });

                if (dragCfg.proxy) {
                    dragCfg.proxy.moveOnEnd = true;

                    p = self.__proxy = new DD.Proxy(dragCfg.proxy);
                    p.attachDrag(d);
                }

                __constrain = self.__constrain = new DD.Constrain().attachDrag(d);

                d.on("dragend", function () {
                    var proxyOffset;
                    proxyOffset = el.offset();
                    self.set("x", proxyOffset.left);
                    self.set("y", proxyOffset.top);
                    // 存在代理时
                    if (p) {
                        el.css("visibility", "visible");
                    }
                });

                if (dragCfg.scroll) {
                    var s = self.__scroll = new DD.Scroll(dragCfg.scroll);
                    s.attachDrag(d);
                }

            }

            if (d) {
                d.set("disabled", !dragCfg);
            }

            if (dragCfg && d) {
                handlers = dragCfg.handlers;
                if ("constrain" in dragCfg) {
                    __constrain.set("constrain", dragCfg.constrain);
                } else {
                    __constrain.set("constrain", false);
                }
                if (handlers && handlers.length > 0) {
                    d.set("handlers", handlers);
                }
            }
        },

        __destructor: function () {
            var self = this,
                p = self.__proxy,
                s = self.__scroll,
                __constrain = self.__constrain,
                d = self.__drag;
            s && s.destroy();
            p && p.destroy();
            __constrain && __constrain.destroy();
            d && d.destroy();
        }

    };

    return Drag;

});/**
 * @ignore
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/loading-render", function (S, Node) {

    function Loading() {
    }

    Loading.prototype = {
        loading: function () {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new Node("<div " +
                    "class='" +
                    self.get('prefixCls') + "ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'/>")
                    .appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading: function () {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

}, {
    requires: ['node']
});/**
 * @ignore
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/loading", function () {

    /**
     * @class KISSY.Component.UIBase.Loading
     * Loading extension class. Make component to be able to mask loading.
     */
    function Loading() {
    }

    Loading.prototype = {
        /**
         * mask component as loading
         */
        loading: function () {
            this.get("view").loading();
            return this;
        },

        /**
         * unmask component as loading
         */
        unloading: function () {
            this.get("view").unloading();
            return this;
        }
    };

    return Loading;

});/**
 * @ignore
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/mask-render", function (S, UA, Node) {

    var ie6 = (UA['ie'] === 6),
        $ = Node.all;

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask(self) {
        var maskCls = self.get("prefixCls") + "ext-mask " + self.getCssClassWithState('-mask'),
            mask = $("<div " +
                " style='width:" + docWidth() + ";" +
                "left:0;" +
                "top:0;" +
                "height:" + docHeight() + ";" +
                "position:" + (ie6 ? "absolute" : "fixed") + ";'" +
                " class='" +
                maskCls +
                "'>" +
                (ie6 ? "<" + "iframe " +
                    "style='position:absolute;" +
                    "left:" + "0" + ";" +
                    "top:" + "0" + ";" +
                    "background:red;" +
                    "width: expression(this.parentNode.offsetWidth);" +
                    "height: expression(this.parentNode.offsetHeight);" +
                    "filter:alpha(opacity=0);" +
                    "z-index:-1;'></iframe>" : "") +
                "</div>")
                .prependTo("body");
        /*
         点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown", function (e) {
            e.preventDefault();
        });
        return mask;
    }

    function Mask() {
    }

    Mask.ATTRS = {

        mask: {
            value: false
        },
        maskNode: {

        }

    };

    Mask.prototype = {

        __renderUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.set('maskNode', initMask(self));
            }
        },

        __syncUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.ksSetMaskVisible(self.get('visible'), 1);
            }
        },

        ksSetMaskVisible: function (shown, hideInline) {
            var self = this,
                shownCls = self.getCssClassWithState('-mask-shown'),
                maskNode = self.get('maskNode'),
                hiddenCls = self.getCssClassWithState('-mask-hidden');
            if (shown) {
                maskNode.removeClass(hiddenCls).addClass(shownCls);
            } else {
                maskNode.removeClass(shownCls).addClass(hiddenCls);

            }
            if (!hideInline) {
                maskNode.css('visibility', shown ? 'visible' : 'hidden');
            }
        },

        __destructor: function () {
            var self = this, mask;
            if (mask = self.get("maskNode")) {
                mask.remove();
            }
        }

    };

    return Mask;
}, {
    requires: ["ua", "node"]
});/**
 * @ignore
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/mask", function () {

    /**
     * @class KISSY.Component.UIBase.Mask
     * Mask extension class. Make component to be able to show with mask.
     */
    function Mask() {
    }

    Mask.ATTRS = {
        /**
         * Whether show mask layer when component shows and effect
         * @cfg {Boolean|Object} mask
         *
         * for example:
         *      @example
         *      {
         *          effect:'fade', // slide
         *          duration:0.5,
         *          easing:'easingNone'
         *      }
         */
        /**
         * @ignore
         */
        mask: {
            view: 1
        },
        /**
         * Mask node of current component.
         * @type {KISSY.NodeList}
         * @property maskNode
         * @readonly
         */
        /**
         * @ignore
         */
        maskNode: {
            view: 1
        }
    };

    var NONE = 'none',
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function processMask(mask, el, show, view) {

        var effect = mask.effect || NONE;

        if (effect == NONE) {
            view.ksSetMaskVisible(show);
            return;
        }

        // no inline style, leave it to anim(fadeIn/Out)
        view.ksSetMaskVisible(show, 1);

        var duration = mask.duration,
            easing = mask.easing,
            m,
            index = show ? 1 : 0;

        // run complete fn to restore window's original height
        el.stop(1, 1);

        el.css('display', show ? 'none' : 'block');

        m = effect + effects[effect][index];

        el[m](duration, null, easing);
    }

    Mask.prototype = {

        __bindUI: function () {
            var self = this,
                maskNode,
                mask,
                el = self.get('el'),
                view = self.get("view");
            if (mask = self.get("mask")) {
                maskNode = self.get('maskNode');
                self.on('afterVisibleChange', function (e) {
                    var v;
                    if (v = e.newVal) {
                        var elZIndex = parseInt(el.css('z-index')) || 1;
                        maskNode.css('z-index', elZIndex - 1);
                    }
                    processMask(mask, maskNode, v, view)
                });
            }
        }
    };


    return Mask;
}, {requires: ["ua"]});/**
 * @ignore
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/position-render", function () {

    function Position() {
    }

    Position.ATTRS = {
        x: {
            // 水平方向绝对位置
        },
        y: {
            // 垂直方向绝对位置
        },
        zIndex: {
        },
        /**
         * @ignore
         * see {@link Component.UIBase.Box#visibleMode}.
         * @default "visibility"
         */
        visibleMode: {
            value: "visibility"
        }
    };


    Position.prototype = {

        __createDom: function () {
            this.get("el").addClass(this.get('prefixCls') + "ext-position");
        },

        _uiSetZIndex: function (x) {
            this.get("el").css("z-index", x);
        },

        _uiSetX: function (x) {
            if (x != null) {
                this.get("el").offset({
                    left: x
                });
            }
        },

        _uiSetY: function (y) {
            if (y != null) {
                this.get("el").offset({
                    top: y
                });
            }
        }
    };

    return Position;
});/**
 * @ignore
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/position", function (S) {

    /**
     * @class KISSY.Component.UIBase.Position
     * Position extension class. Make component positionable.
     */
    function Position() {
    }

    Position.ATTRS = {
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
            view: 1
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
            view: 1
        },
        /**
         * Horizontal and vertical axis.
         * @ignore
         * @type {Number[]}
         */
        xy: {
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter: function (v) {
                var self = this,
                    xy = S.makeArray(v);
                /*
                 属性内分发特别注意：
                 xy -> x,y
                 */
                if (xy.length) {
                    xy[0] && self.set("x", xy[0]);
                    xy[1] && self.set("y", xy[1]);
                }
                return v;
            },

            // xy 纯中转作用
            getter: function () {
                return [this.get("x"), this.get("y")];
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
         * Positionable element is by default visible false.
         * For compatibility in overlay and PopupMenu.
         *
         * Defaults to: false
         *
         * @ignore
         */
        visible: {
            value: false
        }
    };


    Position.prototype = {
        /**
         * Move to absolute position.
         * @ignore
         */
        move: function (x, y) {
            var self = this;
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set("xy", [x, y]);
            return self;
        }
    };

    return Position;
});/**
 * @ignore
 * @fileOverview resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/resize", function (S) {

    /**
     * @class KISSY.Component.UIBase.Resize
     * Resizable extension class. Make component resizable
     */
    function Resize() {
    }

    Resize.ATTRS = {
        /**
         * Resizable configuration. See {@link KISSY.Resizable}
         * @type {Object}
         * @property resize
         *
         * for example:
         *      @example
         *      {
         *          minWidth:100,
         *          maxWidth:1000,
         *          minHeight:100,
         *          maxHeight:1000,
         *          handlers:["b","t","r","l","tr","tl","br","bl"]
         *      }
         *
         *
         */
        /**
         * @ignore
         */
        resize:{
            value:{
            }
        }
    };

    Resize.prototype = {
        __destructor:function () {
            var r = this.resizer;
            r && r.destroy();
        },
        _uiSetResize:function (v) {
            var Resizable = S.require("resizable"),
                self = this;
            self.resizer && self.resizer.destroy();
            if (Resizable && v) {
                v.node = self.get("el");
                self.resizer = new Resizable(v);
            }
        }
    };


    return Resize;
});/**
 * @ignore
 * @fileOverview shim for ie6 ,require box-ext
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/shim-render", function () {
    // only for ie6!
    function Shim() {
    }

    Shim.prototype = {
        __createDom:function () {
            this.get("el").prepend("<" + "iframe style='position: absolute;" +
                "border: none;" +
                "width: expression(this.parentNode.offsetWidth);" +
                "top: 0;" +
                "opacity: 0;" +
                "filter: alpha(opacity=0);" +
                "left: 0;" +
                "z-index: -1;" +
                "height: expression(this.parentNode.offsetHeight);" + "'/>");
        }
    };

    return Shim;
});/**
 * @ignore
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmod-render", function (S, Node) {


    var CLS_PREFIX = "stdmod-";

    function StdModRender() {
    }

    StdModRender.ATTRS = {
        header: {
        },
        body: {
        },
        footer: {
        },
        bodyStyle: {
        },
        footerStyle: {
        },
        headerStyle: {
        },
        headerContent: {
        },
        bodyContent: {
        },
        footerContent: {
        }
    };

    StdModRender.HTML_PARSER = {
        header: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "header");
        },
        body: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "body");
        },
        footer: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "footer");
        }
    };

    function createUI(self, part) {
        var el = self.get("contentEl"),
            partEl = self.get(part);
        if (!partEl) {
            partEl = new Node("<div class='" +
                self.get('prefixCls') + CLS_PREFIX + part + "'" +
                " " +
                " >" +
                "</div>");
            partEl.appendTo(el);
            self.setInternal(part, partEl);
        }
    }


    function _setStdModRenderContent(self, part, v) {
        part = self.get(part);
        if (typeof v == 'string') {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    StdModRender.prototype = {

        __createDom: function () {
            createUI(this, "header");
            createUI(this, "body");
            createUI(this, "footer");
        },

        _uiSetBodyStyle: function (v) {
            this.get("body").css(v);
        },

        _uiSetHeaderStyle: function (v) {
            this.get("header").css(v);
        },
        _uiSetFooterStyle: function (v) {
            this.get("footer").css(v);
        },

        _uiSetBodyContent: function (v) {
            _setStdModRenderContent(this, "body", v);
        },

        _uiSetHeaderContent: function (v) {
            _setStdModRenderContent(this, "header", v);
        },

        _uiSetFooterContent: function (v) {
            _setStdModRenderContent(this, "footer", v);
        }
    };

    return StdModRender;

}, {
    requires: ['node']
});/**
 * @ignore
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmod", function () {


    /**
     * @class KISSY.Component.UIBase.StdMod
     * StdMod extension class. Generate head, body, foot for component.
     */
    function StdMod() {
    }

    StdMod.ATTRS = {
        /**
         * Header element of dialog.
         * @type {KISSY.NodeList}
         * @property header
         * @readonly
         */
        /**
         * @ignore
         */
        header:{
            view:1
        },
        /**
         * Body element of dialog.
         * @type {KISSY.NodeList}
         * @property body
         * @readonly
         */
        /**
         * @ignore
         */
        body:{
            view:1
        },
        /**
         * Footer element of dialog.
         * @type {KISSY.NodeList}
         * @property footer
         * @readonly
         */
        /**
         * @ignore
         */
        footer:{
            view:1
        },
        /**
         * Key-value map of body element's style.
         * @cfg {Object} bodyStyle
         */
        /**
         * @ignore
         */
        bodyStyle:{
            view:1
        },
        /**
         * Key-value map of footer element's style.
         * @cfg {Object} footerStyle
         */
        /**
         * @ignore
         */
        footerStyle:{
            view:1
        },
        /**
         * Key-value map of header element's style.
         * @cfg {Object} headerStyle
         */
        /**
         * @ignore
         */
        headerStyle:{
            view:1
        },
        /**
         * html content of header element.
         * @cfg {KISSY.NodeList|String} headerContent
         */
        /**
         * @ignore
         */
        headerContent:{
            view:1
        },
        /**
         * html content of body element.
         * @cfg {KISSY.NodeList|String} bodyContent
         */
        /**
         * @ignore
         */
        bodyContent:{
            view:1
        },
        /**
         * html content of footer element.
         * @cfg {KISSY.NodeList|String} footerContent
         */
        /**
         * @ignore
         */
        footerContent:{
            view:1
        }
    };

    return StdMod;

});
