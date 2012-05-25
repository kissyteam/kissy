/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 25 12:28
*/
/**
 * @fileOverview mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component", function (KISSY, Controller, Render, Container, UIStore, DelegateChildren, DecorateChildren, DecorateChild) {
    /**
     * @name Component
     * @namespace
     */
    var Component = {
        "Render":Render,
        "Container":Container,
        "UIStore":UIStore,
        "DelegateChildren":DelegateChildren,
        "DecorateChild":DecorateChild,
        "DecorateChildren":DecorateChildren
    };
    Component["Controller"] = Controller;
    return Component;
}, {
    requires:['component/controller',
        'component/render',
        'component/container',
        'component/uistore',
        'component/delegateChildren',
        'component/decorateChildren',
        'component/decorateChild']
});/**
 * @fileOverview container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function (S, UIBase, Controller, UIStore, DelegateChildren, DecorateChildren) {
    /**
     * Container class. Extend it to acquire the abilities of
     * delegating events and
     * decorate from pre-rendered dom
     * for child components.
     * @name Container
     * @constructor
     * @extends Component.Controller
     * @memberOf Component
     */
    return UIBase.create(Controller, [DelegateChildren, DecorateChildren],
        /**
         * @lends Component.Container
         */
        {

            /**
             * Generate child component from root element.
             * @protected
             * @function
             * @name decorateInternal
             * @memberOf Component.Container#
             * @param {NodeList} element Root element of current component.
             */

            /**
             * Get child component which contains current event target node.             *
             * @protected
             * @name getOwnerControl
             * @function
             * @memberOf Component.Container#
             * @param {HTMLElement} target Current event target node.
             */
        });

}, {
    requires:['uibase', './controller', './uistore', './delegateChildren', './decorateChildren']
});/**
 * @fileOverview Base Controller class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/controller", function (S, Event, UIBase, UIStore, Render, undefined) {

    function wrapperViewSetter(attrName) {
        return function (ev) {
            var value = ev.newVal,
                self = this,
                view = self.get("view");
            view && view.set(attrName, value);
        };
    }

    function wrapperViewGetter(attrName) {
        return function (v) {
            var self = this,
                view = self.get("view");
            return v === undefined ? view && view.get(attrName) : v;
        };
    }

    function create(c, self) {
        if (!(c instanceof Controller )) {
            if (self && !c.prefixCls) {
                c.prefixCls = self.get("prefixCls");
            }
            var childConstructor = UIStore.getUIConstructorByCssClass(c['xclass']);
            c = new childConstructor(c);
        }
        return c;
    }

    function initChild(self, c, elBefore) {
        // 生成父组件的 dom 结构
        self.create();
        var contentEl = self.getContentElement(), childConstructor;
        c = create(c, self);
        c.__set("parent", self);
        // set 通知 view 也更新对应属性
        c.set("render", contentEl);
        c.set("elBefore", elBefore);
        // 如果 parent 已经渲染好了子组件也要立即渲染，就 创建 dom ，绑定事件
        if (self.get("rendered")) {
            c.render();
        }
        // 如果 parent 也没渲染，子组件 create 出来和 parent 节点关联
        // 子组件和 parent 组件一起渲染
        else {
            // 之前设好属性，view ，logic 同步还没 bind ,create 不是 render ，还没有 bindUI
            c.create();
        }
        return c;
    }

    /**
     * 不使用 valueFn，
     * 只有 render 时需要找到默认，其他时候不需要，防止莫名其妙初始化
     */
    function getDefaultView() {
        // 逐层找默认渲染器
        var self = this,
            c = self.constructor,
            attrs,
            cfg = {},
            DefaultRender;
        while (c && !DefaultRender) {
            DefaultRender = c['DefaultRender'];
            c = c.superclass && c.superclass.constructor;
        }
        if (DefaultRender) {
            /**
             * 将渲染层初始化所需要的属性，直接构造器设置过去
             */
            attrs = self['__attrs'] || {};
            for (var attrName in attrs) {
                if (attrs.hasOwnProperty(attrName)) {
                    var attrCfg = attrs[attrName], v;
                    if (attrCfg.view) {
                        if (( v = self.get(attrName) ) !== undefined) {
                            cfg[attrName] = v;
                        }
                    }
                }
            }
            return new DefaultRender(cfg);
        }
        return 0;
    }

    function setViewCssClassByHierarchy(self, view) {
        var constructor = self.constructor,
            re = [];
        while (constructor && constructor != Controller) {
            var cls = UIStore.getCssClassByUIConstructor(constructor);
            if (cls) {
                re.push(cls);
            }
            constructor = constructor.superclass && constructor.superclass.constructor;
        }
        return view.__componentClasses = re.join(" ");
    }

    function isMouseEventWithinElement(e, elem) {
        var relatedTarget = e.relatedTarget;
        // 在里面或等于自身都不算 mouseenter/leave
        return relatedTarget &&
            ( relatedTarget === elem[0] ||
                elem.contains(relatedTarget) );
    }

    /**
     * Base Controller class for KISSY Component.
     * @class
     * @memberOf Component
     * @name Controller
     * @extends UIBase
     * @extends UIBase.Box
     */
    var Controller = UIBase.create([UIBase.Box],
        /** @lends Component.Controller# */
        {

            /**
             * Get full class name for current component
             * @param classes {String} class names without prefixCls. Separated by space.
             * @function
             * @return {String} class name with prefixCls
             */
            getCssClassWithPrefix:UIStore.getCssClassWithPrefix,

            /**
             * From UIBase, Initialize this component.
             * @override
             * @protected
             */
            initializer:function () {
                // 整理属性，对纯属于 view 的属性，添加 getter setter 直接到 view
                var self = this,
                    attrs = self['__attrs'] || {};
                for (var attrName in attrs) {
                    if (attrs.hasOwnProperty(attrName)) {
                        var attrCfg = attrs[attrName];
                        if (attrCfg.view) {
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
                }
            },

            /**
             * From UIBase. Constructor(or get) view object to create ui elements.
             * @protected
             * @override
             */
            createDom:function () {
                var self = this,
                    view = self.get("view") || getDefaultView.call(self);
                setViewCssClassByHierarchy(self, view);
                view.create();
                var el = view.getKeyEventTarget();
                if (self.get("focusable")) {
                    el.attr("tabIndex", 0);
                } else {
                    el.unselectable(undefined);
                }
                self.__set("view", view);
            },

            /**
             * From UIBase. Call view object to render ui elements.
             * @protected
             * @override
             */
            renderUI:function () {
                var self = this, i, child;
                self.get("view").render();
                //then render my children
                var children = self.get("children");
                for (i = 0; i < children.length; i++) {
                    child = children[i];
                    // 不在 Base 初始化设置属性时运行，防止和其他初始化属性冲突
                    child = initChild(self, child);
                    children[i] = child;
                    child.render();
                }
            },

            /**
             * From UIBase. Bind focus event if component is focusable.
             * @protected
             * @override
             */
            bindUI:function () {
                var self = this,
                    focusable = self.get("focusable"),
                    handleMouseEvents = self.get("handleMouseEvents"),
                    el = self.getKeyEventTarget();
                if (focusable) {
                    el.on("focus", self.handleFocus, self)
                        .on("blur", self.handleBlur, self)
                        .on("keydown", self.handleKeydown, self);
                }
                if (handleMouseEvents) {
                    el = self.get("el");
                    el.on("mouseenter", self.handleMouseEnter, self)
                        .on("mouseleave", self.handleMouseLeave, self)
                        .on("mousedown", self.handleMouseDown, self)
                        .on("mouseup", self.handleMouseUp, self)
                        .on("dblclick", self.handleDblClick, self);
                }
            },

            /**
             * 子组件将要渲染到的节点
             * @protected
             */
            getContentElement:function () {
                var view = this.get('view');
                return view && view.getContentElement();
            },

            /**
             * 焦点所在元素即键盘事件处理元素
             * @protected
             */
            getKeyEventTarget:function () {
                var view = this.get('view');
                return view && view.getKeyEventTarget();
            },

            /**
             * Add the specified component as a child of current component
             * at the given 0-based index.
             * @param {Component.Controller|Object} c
             * Child component instance to be added
             * or
             * Object describe child component
             * @param {String} [c.xclass] When c is a object, specify its child class.
             * @param {Number} [index]  0-based index at which
             * the new child component is to be inserted;
             * If not specified , the new child component will be inserted at last position.
             */
            addChild:function (c, index) {
                var self = this,
                    children = self.get("children"),
                    elBefore;
                if (index === undefined) {
                    index = children.length;
                }
                elBefore = children[index] && children[index].get("el") || null;
                c = initChild(self, c, elBefore);
                children.splice(index, 0, c);
            },

            /**
             * Removed the given child from this component,and returns it.
             *
             * If destroy is true, calls {@link UIBase.#destroy} on the removed child component,
             * and subsequently detaches the child's DOM from the document.
             * Otherwise it is the caller's responsibility to
             * clean up the child component's DOM.
             *
             * @param {Component.Controller} c The child component to be removed.
             * @param {Boolean} [destroy=false] If true,
             * calls {@link UIBase.#destroy} on the removed child component.
             * @return {Component.Controller} The removed component.
             */
            removeChild:function (c, destroy) {
                var children = this.get("children"),
                    index = S.indexOf(c, children);
                if (index != -1) {
                    children.splice(index, 1);
                }
                if (destroy) {
                    c.destroy();
                }
                return c;
            },

            /**
             * Removes every child component attached to current component.
             * @see Component.Controller#removeChild
             * @param {Boolean} [destroy] If true,
             * calls {@link UIBase.#destroy} on the removed child component.
             */
            removeChildren:function (destroy) {
                var self = this,
                    i,
                    t = [].concat(self.get("children"));
                for (i = 0; i < t.length; i++) {
                    self.removeChild(t[i], destroy);
                }
                self.__set("children", []);
            },

            /**
             * Returns the child at the given index, or null if the index is out of bounds.
             * @param {Number} index 0-based index.
             * @return {Component.Controller} The child at the given index; null if none.
             */
            getChildAt:function (index) {
                var children = this.get("children");
                return children[index] || null;
            },

            /**
             * Handle dblclick events. By default, this performs its associated action by calling
             * {@link Component.Controller#performActionInternal}.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleDblClick:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                self.performActionInternal(ev);
            },

            /**
             * Called by it's container component to dispatch mouseenter event.
             * @private
             * @param {Event.Object} ev DOM event to handle.
             */
            handleMouseOver:function (ev) {
                var self = this,
                    el = self.get("el");
                if (self.get("disabled")) {
                    return true;
                }
                if (!isMouseEventWithinElement(ev, el)) {
                    self.handleMouseEnter(ev);
                }
            },

            /**
             * Called by it's container component to dispatch mouseleave event.
             * @private
             * @param {Event.Object} ev DOM event to handle.
             */
            handleMouseOut:function (ev) {
                var self = this,
                    el = self.get("el");
                if (self.get("disabled")) {
                    return true;
                }
                if (!isMouseEventWithinElement(ev, el)) {
                    self.handleMouseLeave(ev);
                }
            },

            /**
             * Handle mouseenter events. If the component is not disabled, highlights it.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleMouseEnter:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                self.set("highlighted", !!ev);
            },

            /**
             * Handle mouseleave events. If the component is not disabled, de-highlights it.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleMouseLeave:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                self.set("active", false);
                self.set("highlighted", !ev);
            },

            /**
             * Handles mousedown events. If the component is not disabled,
             * If the component is activeable, then activate it.
             * If the component is focusable, then focus it,
             * else prevent it from receiving keyboard focus.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleMouseDown:function (ev) {
                var self = this,
                    isMouseActionButton = ev.which == 1,
                    el;
                if (self.get("disabled")) {
                    return true;
                }
                if (isMouseActionButton) {
                    el = self.getKeyEventTarget();
                    if (self.get("activeable")) {
                        self.set("active", true);
                    }
                    if (self.get("focusable")) {
                        el[0].focus();
                        self.set("focused", true);
                    } else {
                        // firefox /chrome 不会引起焦点转移
                        var n = ev.target.nodeName;
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
             * {@link Component.Controller#performActionInternal}, then deactivates it.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleMouseUp:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                // 左键
                if (self.get("active") && ev.which == 1) {
                    self.performActionInternal(ev);
                    self.set("active", false);
                }
            },

            /**
             * Handles focus events. Style focused class.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleFocus:function (ev) {
                this.set("focused", !!ev);
            },

            /**
             * Handles blur events. Remove focused class.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleBlur:function (ev) {
                this.set("focused", !ev);
            },

            /**
             * Handle enter keydown event to {@link Component.Controller#performActionInternal}.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleKeyEventInternal:function (ev) {
                if (ev.keyCode == Event.KeyCodes.ENTER) {
                    return this.performActionInternal(ev);
                }
            },

            /**
             * Handle keydown events.
             * If the component is not disabled, call {@link Component.Controller#handleKeyEventInternal}
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleKeydown:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                if (self.handleKeyEventInternal(ev)) {
                    ev.halt();
                }
            },

            /**
             * Performs the appropriate action when this component is activated by the user.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            performActionInternal:function (ev) {
            },

            destructor:function () {
                var self = this,
                    i,
                    view,
                    children = self.get("children");
                for (i = 0; i < children.length; i++) {
                    children[i].destroy();
                }
                view = self.get("view");
                if (view) {
                    view.destroy();
                }
            }
        },
        {
            ATTRS:/**
             * @lends Component.Controller#
             */
            {

                /**
                 * Enables or disables mouse event handling for the component.
                 * Containers may set this attribute to disable mouse event handling
                 * in their child component.
                 * Default : true.
                 * @type Boolean
                 */
                handleMouseEvents:{
                    value:true
                },

                /**
                 * Whether this component can get focus.
                 * Default : true.
                 * @type Boolean
                 */
                focusable:{
                    view:true,
                    value:true
                },

                /**
                 * Whether this component can be activated.
                 * Default : true.
                 * @type Boolean
                 */
                activeable:{
                    value:true
                },

                /**
                 * Whether this component has focus.
                 * @type Boolean
                 */
                focused:{
                    view:true
                },

                /**
                 * Whether this component is activated.
                 * @type Boolean
                 */
                active:{
                    view:true
                },

                /**
                 * Whether this component is highlighted.
                 * @type Boolean
                 */
                highlighted:{
                    view:true
                },

                /**
                 * Array of child components
                 * @type Component.Controller[]
                 */
                children:{
                    value:[]
                },

                /**
                 * This component's prefix css class.
                 * @type String
                 */
                prefixCls:{
                    view:true,
                    value:"ks-"
                },

                /**
                 * This component's parent component.
                 * @type Component.Controller
                 */
                parent:{
                },

                /**
                 * Renderer used to render this component.
                 * @type Component.Render
                 */
                view:{
                },

                /**
                 * Whether this component is disabled.
                 * @type Boolean
                 */
                disabled:{
                    view:true
                }
            },

            /**
             * Create a component instance using json with xclass
             * @function
             * @example
             * <code>
             *  create({
             *     xclass:'menu',
             *     children:[{
             *        xclass:'menuitem',
             *        content:"1"
             *     }]
             *  })
             * </code>
             */
            create:create,

            DefaultRender:Render
        },
        "Component_Controller"
    );
    return Controller;
}, {
    requires:['event', 'uibase', './uistore', './render']
});
/**
 * observer synchronization, model 分成两类：
 *  - view 负责监听 view 类 model 变化更新界面
 *  - control 负责监听 control 类变化改变逻辑
 * problem: Observer behavior is hard to understand and debug
 * because it's implicit behavior.
 *
 * Keeping screen state and session state synchronized is an important task
 * Data Binding.
 *
 * In general data binding gets tricky
 * because if you have to avoid cycles where a change to the control,
 * changes the record set, which updates the control,
 * which updates the record set....
 * The flow of usage helps avoid these -
 * we load from the session state to the screen when the screen is opened,
 * after that any changes to the screen state propagate back to the session state.
 * It's unusual for the session state to be updated directly once the screen is up.
 * As a result data binding might not be entirely bi-directional -
 * just confined to initial upload and
 * then propagating changes from the controls to the session state.
 *
 *  Refer
 *    - http://martinfowler.com/eaaDev/uiArchs.html
 *
 *  控制层元属性配置中 view 的作用
 *   - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 *   - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中
 **//**
 * @fileOverview decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decorateChild", function (S, DecorateChildren) {
    function DecorateChild() {

    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal:function (element) {
            var self = this;
            // 不用 __set , 通知 view 更新
            self.set("el", element);
            var ui = self.get("decorateChildCls"),
                child = element.one("." + self.getCssClassWithPrefix(ui));
            // 可以装饰?
            if (child) {
                var UI = self.findUIConstructorByNode(child);
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
    requires:['./decorateChildren']
});/**
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decorateChildren", function (S, UIStore) {


    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        decorateInternal:function (el) {
            var self = this;
            // 不用 __set , 通知 view 更新
            self.set("el", el);
            self.decorateChildren(el);
        },

        /**
         * Get component's constructor from KISSY Node.
         * @protected
         * @param {NodeList} childNode Child component's root node.
         */
        findUIConstructorByNode:function (childNode) {
            var self = this,
                cls = childNode.attr("class") || "",
                prefixCls = self.get("prefixCls");
            // 过滤掉特定前缀
            cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
            var UI = UIStore.getUIConstructorByCssClass(cls);
            if (!UI) {
                S.log(childNode);
                S.log("can not find ui " + cls + " from this markup");
            }
            return UI;
        },

        // 生成一个组件
        decorateChildrenInternal:function (UI, c) {
            var self=this;
            self.addChild(new UI({
                srcNode:c,
                prefixCls:self.get("prefixCls")
            }));
        },

        // container 需要在装饰时对儿子特殊处理，递归装饰
        decorateChildren:function (el) {
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
    requires:['./uistore']
});/**
 * @fileOverview delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/delegateChildren", function (S) {

    function DelegateChildren() {

    }

    function handleChildMouseEvents(e) {
        var control = this.getOwnerControl(e.target);
        if (control) {
            // Child control identified; forward the event.
            switch (e.type) {
                case "mousedown":
                    control.handleMouseDown(e);
                    break;
                case "mouseup":
                    control.handleMouseUp(e);
                    break;
                case "mouseover":
                    control.handleMouseOver(e);
                    break;
                case "mouseout":
                    control.handleMouseOut(e);
                    break;
                case "dblclick":
                    control.handleDblClick(e);
                    break;
                default:
                    S.error(e.type + " unhandled!");
            }
        }
    }

    S.augment(DelegateChildren, {

        __bindUI:function () {
            var self = this;
            self.get("el").on("mousedown mouseup mouseover mouseout dblclick",
                handleChildMouseEvents, self);
        },

        getOwnerControl:function (target) {
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
});/**
 * @fileOverview render base class for kissy
 * @author yiminghe@gmail.com
 * @see http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/render", function (S, UIBase, UIStore) {

    /**
     * Base Render class for KISSY Component.
     * @class
     * @memberOf Component
     * @name Render
     * @extends UIBase
     */
    return UIBase.create([UIBase.Box.Render],
        /**
         * @lends Component.Render#
         */
        {

            /**
             * Get all css class name to be applied to the root element of this component for given state.
             * the css class names are prefixed with component name.
             * @param {String} [state] This component's state info.
             */
            getComponentCssClassWithState:function (state) {
                var self = this,
                    componentCls = this.__componentClasses;
                state = state || "";
                return self.getCssClassWithPrefix(componentCls.split(/\s+/).join(state + " ") + state);
            },

            /**
             * Get full class name (with prefix) for current component
             * @param classes {String} class names without prefixCls. Separated by space.
             * @function
             * @return {String} class name with prefixCls
             * @private
             */
            getCssClassWithPrefix:UIStore.getCssClassWithPrefix,

            createDom:function () {
                var self = this;
                self.get("el").addClass(self.getComponentCssClassWithState());
            },

            /**
             * Returns the dom element which is responsible for listening keyboard events.
             * @return {NodeList}
             */
            getKeyEventTarget:function () {
                return this.get("el");
            },

            /**
             * Return the dom element into which child component to be rendered.
             * @return {NodeList}
             */
            getContentElement:function () {
                var self = this;
                return self.get("contentEl") || self.get("el");
            },

            /**
             * @protected
             */
            _uiSetHighlighted:function (v) {
                var self = this,
                    componentCls = self.getComponentCssClassWithState("-hover"),
                    el = self.get("el");
                el[v ? 'addClass' : 'removeClass'](componentCls);
            },

            /**
             * @protected
             */
            _uiSetDisabled:function (v) {
                var self = this,
                    componentCls = self.getComponentCssClassWithState("-disabled"),
                    el = self.get("el");
                el[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr("aria-disabled", v);
                if (self.get("focusable")) {
                    //不能被 tab focus 到
                    self.getKeyEventTarget().attr("tabIndex", v ? -1 : 0);
                }
            },
            /**
             * @protected
             */
            _uiSetActive:function (v) {
                var self = this,
                    componentCls = self.getComponentCssClassWithState("-active");
                self.get("el")[v ? 'addClass' : 'removeClass'](componentCls)
                    .attr("aria-pressed", !!v);
            },
            /**
             * @protected
             */
            _uiSetFocused:function (v) {
                var self = this,
                    el = self.get("el"),
                    componentCls = self.getComponentCssClassWithState("-focused");
                el[v ? 'addClass' : 'removeClass'](componentCls);
            }

        }, {//  screen state
            ATTRS:/**
             * @lends Component.Render#
             */
            {
                /**
                 * see {@link Component.Controller#prefixCls}
                 */
                prefixCls:{},
                /**
                 * see {@link Component.Controller#focusable}
                 */
                focusable:{},
                /**
                 * see {@link Component.Controller#focused}
                 */
                focused:{},
                /**
                 * see {@link Component.Controller#active}
                 */
                active:{},
                /**
                 * see {@link Component.Controller#disabled}
                 */
                disabled:{},
                /**
                 * see {@link Component.Controller#highlighted}
                 */
                highlighted:{}
            }
        }, "Component_Render");
}, {
    requires:['uibase', './uistore']
});/**
 * @fileOverview storage for component's css
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uistore", function (S) {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         ui:Menu
         }
         */
    };

    function getUIConstructorByCssClass(cls) {
        var cs = cls.split(/\s+/), p = -1, ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && uic.priority > p) {
                ui = uic.ui;
            }
        }
        return ui;
    }

    function getCssClassByUIConstructor(constructor) {
        for (var u in uis) {
            var ui = uis[u];
            if (ui.ui == constructor) {
                return u;
            }
        }
        return 0;
    }

    function setUIConstructorByCssClass(cls, uic) {
        uis[cls] = uic;
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

    /**
     * @name UIStore
     * @namespace
     * @memberOf Component
     */
    var UIStore = /** @lends Component.UIStore */{
        getCssClassWithPrefix:getCssClassWithPrefix,
        /**
         * Get css class name for this component constructor.
         * @param {Function} constructor Component's constructor.
         * @type {Function}
         * @return {String}
         * @function
         */
        getCssClassByUIConstructor:getCssClassByUIConstructor,
        /**
         * Get component constructor by css class name.
         * @param {String} classNames Class names separated by space.
         * @type {Function}
         * @return {Function}
         * @function
         */
        getUIConstructorByCssClass:getUIConstructorByCssClass,
        /**
         * Associate css class with component constructor.
         * @type {Function}
         * @param {String} className Component's class name.
         * @param {Function} componentConstructor Component's constructor.
         * @function
         */
        setUIConstructorByCssClass:setUIConstructorByCssClass,

        /**
         * Component's constructor's priority enum.
         * Used for getCssClassByUIConstructor, when multiple component constructors are found.
         * @type Object
         */
        PRIORITY:{
            LEVEL1:10,
            LEVEL2:20,
            LEVEL3:30,
            LEVEL4:40,
            "LEVEL5":50,
            "LEVEL6":60
        }
    };

    UIStore.getCssClassWithPrefix = getCssClassWithPrefix;

    return UIStore;
});
