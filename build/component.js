/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:18
*/
/**
 * Setup component namespace.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base", function (S, UIBase, UIStore) {
    /**
     * @name Component
     * @namespace
     */
    var Component = {
        UIStore:UIStore,
        UIBase:UIBase
    };

    function extend() {
        var args = S.makeArray(arguments),
            ret,
            last = args[args.length - 1];
        args.unshift(this);
        if (last.xclass) {
            args.pop();
            args.push(last.xclass);
        }
        ret = UIBase.create.apply(UIBase, args);
        if (last.xclass) {
            UIStore.setUIConstructorByCssClass(last.xclass, {
                ui:ret,
                priority:last.priority
            });
        }
        ret.extend = extend;
        return ret;
    }

    /**
     * Shortcut for {@link Component.UIBase.create}.
     * @function
     */
    Component.define = function () {
        var args = S.makeArray(arguments), cls;
        cls = args.shift();
        return extend.apply(cls, args);
    }

    return Component;
}, {
    requires:['./uibase', './uistore']
});/**
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
        'component/delegateChildren',
        'component/decorateChildren',
        'component/decorateChild']
});/**
 * @fileOverview container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function (S, Controller, DelegateChildren, DecorateChildren) {
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
    return Controller.extend([DelegateChildren, DecorateChildren],
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
    requires:['./controller', './delegateChildren', './decorateChildren']
});/**
 * @fileOverview Base Controller class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/controller", function (S, Event, Component, UIBase, UIStore, Render, undefined) {

    function wrapperViewSetter(attrName) {
        return function (ev) {
            var self = this;
            // in case bubbled from sub component
            if (self == ev.target) {
                var value = ev.newVal,
                    view = self.get("view");
                view && view.set(attrName, value);
            }
        };
    }

    function wrapperViewGetter(attrName) {
        return function (v) {
            var self = this,
                view = self.get("view");
            return v === undefined ? view && view.get(attrName) : v;
        };
    }

    function initChild(self, c, elBefore) {
        // 生成父组件的 dom 结构
        self.create();
        var contentEl = self.getContentElement();
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
            c.create(undefined);
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
            attrs,
            cfg = {},
            Render = self.get('xrender');

        if (Render) {
            /**
             * 将渲染层初始化所需要的属性，直接构造器设置过去
             */
            attrs = self.getAttrs();
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
            return new Render(cfg);
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
     * @extends Component.UIBase
     * @extends Component.UIBase.Box
     */
    var Controller = Component.define([UIBase.Box],
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
                    listener,
                    n,
                    attrName,
                    attrCfg,
                    listeners = self.get("listeners"),
                    attrs = self.getAttrs();
                for (attrName in attrs) {
                    if (attrs.hasOwnProperty(attrName)) {
                        attrCfg = attrs[attrName];
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
                for (n in listeners) {
                    listener = listeners[n];
                    self.on(n, listener.fn || listener, listener.scope);
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


            _uiSetFocused:function (v) {
                if (v) {
                    this.getKeyEventTarget()[0].focus();
                }
            },

            /**
             * 子组件将要渲染到的节点，在 render 类上覆盖对应方法
             * @private
             */
            getContentElement:function () {
                var view = this.get('view');
                return view && view.getContentElement();
            },

            /**
             * 焦点所在元素即键盘事件处理元素，在 render 类上覆盖对应方法
             * @private
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
             * If destroy is true, calls {@link Component.UIBase.#destroy} on the removed child component,
             * and subsequently detaches the child's DOM from the document.
             * Otherwise it is the caller's responsibility to
             * clean up the child component's DOM.
             *
             * @param {Component.Controller} c The child component to be removed.
             * @param {Boolean} [destroy=false] If true,
             * calls {@link Component.UIBase.#destroy} on the removed child component.
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
             * calls {@link Component.UIBase.#destroy} on the removed child component.
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
                    isMouseActionButton = ev['which'] == 1,
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
                this.fire("focus");
            },

            /**
             * Handles blur events. Remove focused class.
             * @protected
             * @param {Event.Object} ev DOM event to handle.
             */
            handleBlur:function (ev) {
                this.set("focused", !ev);
                this.fire("blur");
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
                },

                /**
                 * Config listener on created.
                 * @example
                 * <code>
                 * {
                 *  click:{
                 *      scope:{x:1},
                 *      fn:function(){
                 *          alert(this.x);
                 *      }
                 *  }
                 * }
                 * </code>
                 */
                listeners:{
                    value:{}
                },

                xrender:{
                    value:Render
                }
            }
        });

    /**
     * Create a component instance using json with xclass
     * @param {Object} component Component's json notation with xclass attribute.
     * @param {Controller} self Component From which new component generated will inherit prefixCls
     * if component 's prefixCls is undefined.
     * @memberOf Component.Controller
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
    function create(component, self) {
        if (!(component instanceof Controller )) {
            var childConstructor, xclass;
            if (!(xclass = component['xclass'])) {
                S.log('no xclass in : ');
                S.log(component);
                S.error("create component error !");
            }
            if (self && !component.prefixCls) {
                component.prefixCls = self.get("prefixCls");
            }
            childConstructor = UIStore.getUIConstructorByCssClass(xclass);
            component = new childConstructor(component);
        }
        return component;
    }

    Component.create = create;

    return Controller;
}, {
    requires:['event', './base', './uibase', './uistore', './render']
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
KISSY.add("component/render", function (S, Component, UIBase, UIStore) {

    /**
     * Base Render class for KISSY Component.
     * @class
     * @memberOf Component
     * @name Render
     * @extends Component.UIBase
     */
    return Component.define([UIBase.Box.Render],
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
        });
}, {
    requires:['./base', './uibase', './uistore']
});/**
 * @fileOverview uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase", function (S, UIBase, Align, Box, BoxRender, Close, CloseRender, Constrain, ContentBox, ContentBoxRender, Drag, Loading, LoadingRender, Mask, MaskRender, Position, PositionRender, ShimRender, Resize, StdMod, StdModRender) {
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
        Constrain:Constrain,
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
        "./uibase/boxrender",
        "./uibase/close",
        "./uibase/closerender",
        "./uibase/constrain",
        "./uibase/contentbox",
        "./uibase/contentboxrender",
        "./uibase/drag",
        "./uibase/loading",
        "./uibase/loadingrender",
        "./uibase/mask",
        "./uibase/maskrender",
        "./uibase/position",
        "./uibase/positionrender",
        "./uibase/shimrender",
        "./uibase/resize",
        "./uibase/stdmod",
        "./uibase/stdmodrender"]
});/**
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
     * 得到会导致元素显示不全的祖先元素
     */
    function getOffsetParent(element) {
        // ie 这个也不是完全可行
        /**
         <div style="width: 50px;height: 100px;overflow: hidden">
         <div style="width: 50px;height: 100px;position: relative;" id="d6">
         元素 6 高 100px 宽 50px<br/>
         </div>
         </div>
         **/
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
     * Align extension class.
     * Align component with specified element.
     * @class
     * @memberOf Component.UIBase
     */
    function Align() {
    }


    Align.__getOffsetParent = getOffsetParent;

    Align.__getVisibleRectForElement = getVisibleRectForElement;

    Align.ATTRS =
    /**
     * @lends Component.UIBase.Align.prototype
     */
    {

        /**
         * Align configuration.
         * @type Object
         * @field
         * @example
         * <code>
         *     {
         *        node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
         *        points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
         *        offset: [0, 0]      // 有效值为 [n, m]
         *     }
         * </code>
         */
        align:{}
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

    Align.prototype =
    /**
     * @lends Component.UIBase.Align.prototype
     */
    {
        _uiSetAlign:function (v) {
            if (v) {
                this.align(v.node, v.points, v.offset, v.overflow);
            }
        },

        /*
         对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         @function
         @ignore
         @param {Element} node 参照元素, 可取配置选项中的设置, 也可是一元素
         @param {String[]} points 对齐方式
         @param {Number[]} [offset] 偏移
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
                self.set("x", newElRegion.left)
            }

            if (newElRegion.top != elRegion.top) {
                self.set("y", newElRegion.top)
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
         * @param {undefined|String|HTMLElement|NodeList} node Same as node config of {@link Component.UIBase.Align#align} .
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
 *  2012-04-26 yiminghe@gmail.com
 *   - 优化智能对齐算法
 *   - 慎用 resizeXX
 *
 *  2011-07-13 yiminghe@gmail.com note:
 *   - 增加智能对齐，以及大小调整选项
 **//**
 * @fileOverview UIBase
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('component/uibase/base', function (S, Base, Node, undefined) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        ucfirst = S.ucfirst,
        noop = S.noop;

    /**
     * UIBase for class-based component.
     * @class
     * @memberOf Component
     * @extends Base
     */
    function UIBase(config) {
        var self = this;

        // 读取用户设置的属性值并设置到自身
        Base.apply(self, arguments);
        // 根据 srcNode 设置属性值
        // 按照类层次执行初始函数，主类执行 initializer 函数，扩展类执行构造器函数
        initHierarchy(self, config);
        // 是否自动渲染
        config && config.autoRender && self.render();

        /**
         * @name Component.UIBase#afterRenderUI
         * @description fired when root node is ready
         * @event
         * @param e
         */


        /**
         * @name Component.UIBase#afterBindUI
         * @description fired when component 's internal event is binded.
         * @event
         * @param e
         */
    }

    /**
     * 模拟多继承
     * init attr using constructors ATTRS meta info
     */
    function initHierarchy(host, config) {

        var c = host.constructor;

        while (c) {

            // 从 markup 生成相应的属性项
            if (config &&
                config[SRC_NODE] &&
                c.HTML_PARSER) {
                if ((config[SRC_NODE] = Node.one(config[SRC_NODE]))) {
                    applyParser.call(host, config[SRC_NODE], c.HTML_PARSER);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }

        callMethodByHierarchy(host, "initializer", "constructor");

    }

    function callMethodByHierarchy(host, mainMethod, extMethod) {
        var c = host.constructor,
            extChains = [],
            ext,
            main,
            exts,
            t;

        // define
        while (c) {

            // 收集扩展类
            t = [];
            if (exts = c.__ks_exts) {
                for (var i = 0; i < exts.length; i++) {
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
            extChains[i] && extChains[i].call(host);
        }
    }

    /**
     * 销毁组件
     * 顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
     */
    function destroyHierarchy(host) {
        var c = host.constructor,
            extensions,
            d,
            i;

        while (c) {
            // 只触发该类真正的析构器，和父亲没关系，所以不要在子类析构器中调用 superclass
            if (c.prototype.hasOwnProperty("destructor")) {
                c.prototype.destructor.apply(host);
            }

            if ((extensions = c.__ks_exts)) {
                for (i = extensions.length - 1; i >= 0; i--) {
                    d = extensions[i] && extensions[i].prototype.__destructor;
                    d && d.apply(host);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }
    }

    function applyParser(srcNode, parser) {
        var host = this, p, v;

        // 从 parser 中，默默设置属性，不触发事件
        for (p in parser) {
            if (parser.hasOwnProperty(p)) {
                v = parser[p];

                // 函数
                if (S.isFunction(v)) {
                    host.__set(p, v.call(host, srcNode));
                }
                // 单选选择器
                else if (S.isString(v)) {
                    host.__set(p, srcNode.one(v));
                }
                // 多选选择器
                else if (S.isArray(v) && v[0]) {
                    host.__set(p, srcNode.all(v[0]))
                }
            }
        }
    }

    /**
     * 根据属性变化设置 UI
     */
    function bindUI(self) {
        var attrs = self.getAttrs(),
            attr, m;

        for (attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
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
    }

    /**
     * 根据当前（初始化）状态来设置 UI
     */
    function syncUI(self) {
        var v,
            f,
            attrs = self.getAttrs();
        for (var a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                var m = UI_SET + ucfirst(a);
                //存在方法，并且用户设置了初始值或者存在默认值，就同步状态
                if ((f = self[m])
                    // 用户如果设置了显式不同步，就不同步，比如一些值从 html 中读取，不需要同步再次设置
                    && attrs[a].sync !== false
                    && (v = self.get(a)) !== undefined) {
                    f.call(self, v);
                }
            }
        }
    }

    /**
     * Parse attribute from existing dom node.
     * @type Object
     * @memberOf Component.UIBase
     * @example
     * Overlay.HTML_PARSER={
     *    // el: root element of current component.
     *    "isRed":function(el){
     *       return el.hasClass("ks-red");
     *    }
     * };
     */
    UIBase.HTML_PARSER = {};

    UIBase.ATTRS =
    /**
     * @lends Component.UIBase#
     */
    {
        /**
         * Whether this component is rendered.
         * @type Boolean
         */
        rendered:{
            value:false
        },
        /**
         * Whether this component 's dom structure is created.
         * @type Boolean
         */
        created:{
            value:false
        }
    };

    S.extend(UIBase, Base,
        /**
         * @lends Component.UIBase.prototype
         */
        {

            /**
             * Create dom structure of this component.
             */
            create:function () {
                var self = this;
                // 是否生成过节点
                if (!self.get("created")) {
                    self.fire('beforeCreateDom');
                    callMethodByHierarchy(self, "createDom", "__createDom");
                    self.__set("created", true);
                    self.fire('afterCreateDom');
                }
                return self;
            },

            /**
             * Put dom structure of this component to document and bind event.
             */
            render:function () {
                var self = this;
                // 是否已经渲染过
                if (!self.get("rendered")) {
                    self.create(undefined);
                    self.fire('beforeRenderUI');
                    callMethodByHierarchy(self, "renderUI", "__renderUI");
                    self.fire('afterRenderUI');
                    self.fire('beforeBindUI');
                    bindUI(self);
                    callMethodByHierarchy(self, "bindUI", "__bindUI");
                    self.fire('afterBindUI');
                    self.fire('beforeSyncUI');
                    syncUI(self);
                    callMethodByHierarchy(self, "syncUI", "__syncUI");
                    self.fire('afterSyncUI');
                    self.__set("rendered", true);
                }
                return self;
            },

            /**
             * For overridden. DOM creation logic of subclass component.
             * @protected
             * @function
             */
            createDom:noop,

            /**
             * For overridden. Render logic of subclass component.
             * @protected
             * @function
             */
            renderUI:noop,

            /**
             * For overridden. Bind logic for subclass component.
             * @protected
             * @function
             */
            bindUI:noop,

            /**
             * For overridden. Sync attribute with ui.
             * protected
             * @function
             */
            syncUI:noop,


            /**
             * Destroy this component.
             */
            destroy:function () {
                var self = this;
                destroyHierarchy(self);
                self.fire('destroy');
                self.detach();
                return self;
            }
        },
        /**
         * @lends Component.UIBase
         */
        {
            /**
             * Create a new class which extends UIBase.
             * @param {Function|Function[]} base Parent class constructor.
             * @param {Function[]} extensions Class constructors for extending.
             * @param {Object} px Object to be mixed into new class 's prototype.
             * @param {Object} sx Object to be mixed into new class.
             * @returns {UIBase} A new class which extends UIBase.
             */
            create:function (base, extensions, px, sx) {
                var args = S.makeArray(arguments), t;
                if (S.isArray(base)) {
                    sx = px;
                    px = extensions;
                    extensions = /*@type Function[]*/base;
                    base = UIBase;
                }
                base = base || UIBase;
                if (S.isObject(extensions)) {
                    sx = px;
                    px = extensions;
                    extensions = [];
                }

                var name = "UIBaseDerived";

                if (S.isString(t = args[args.length - 1])) {
                    name = t;
                }

                function C() {
                    UIBase.apply(this, arguments);
                }

                // debug mode , give the right name for constructor
                // refer : http://limu.iteye.com/blog/1136712
                S.log("UIBase.create : " + name, eval("C=function " + name.replace(/[-.]/g, "_") + "(){ UIBase.apply(this, arguments);}"));

                S.extend(C, base, px, sx);

                if (extensions) {
                    C.__ks_exts = extensions;

                    var desc = {
                        // ATTRS:
                        // HTML_PARSER:
                    }, constructors = extensions['concat'](C);

                    // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                    // 主类最优先
                    S.each(constructors, function (ext) {
                        if (ext) {
                            // 合并 ATTRS/HTML_PARSER 到主类
                            S.each([ATTRS, HTML_PARSER], function (K) {
                                if (ext[K]) {
                                    desc[K] = desc[K] || {};
                                    // 不覆盖主类上的定义，因为继承层次上扩展类比主类层次高
                                    // 但是值是对象的话会深度合并
                                    // 注意：最好值是简单对象，自定义 new 出来的对象就会有问题(用 function return 出来)!
                                    S.mix(desc[K], ext[K], {
                                        deep:true
                                    });
                                }
                            });
                        }
                    });

                    S.each(desc, function (v, k) {
                        C[k] = v;
                    });

                    var prototype = {};

                    // 主类最优先
                    S.each(constructors, function (ext) {
                        if (ext) {
                            var proto = ext.prototype;
                            // 合并功能代码到主类，不覆盖
                            for (var p in proto) {
                                // 不覆盖主类，但是主类的父类还是覆盖吧
                                if (proto.hasOwnProperty(p)) {
                                    prototype[p] = proto[p];
                                }
                            }
                        }
                    });

                    S.each(prototype, function (v, k) {
                        C.prototype[k] = v;
                    });
                }
                return C;
            }
        });

    return UIBase;
}, {
    requires:["base", "node"]
});
/**
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **//**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/box', function (S) {

    /**
     * Box extension class.
     * Represent a dom element.
     * @class
     * @memberOf Component.UIBase
     * @namespace
     */
    function Box() {
    }

    Box.ATTRS =
    /**
     * @lends Component.UIBase.Box.prototype
     */
    {
        /**
         * component's html content
         * @type String
         */
        html:{
            view:true
        },
        /**
         * component's width
         * @type Number|String
         */
        width:{
            // 没有 _uiSetWidth，所以不需要设置 sync:false
            view:true
        },
        /**
         * component's height
         * @type Number|String
         */
        height:{
            view:true
        },
        /**
         * css class of component's root element
         * @type String
         */
        elCls:{
            view:true
        },
        /**
         * name-value pair css style of component's root element
         * @type Object
         */
        elStyle:{
            view:true
        },
        /**
         * name-value pair attribute of component's root element
         * @type Object
         */
        elAttrs:{
            view:true
        },
        /**
         * archor element where component insert before
         * @type NodeList
         */
        elBefore:{
            view:true
        },
        /**
         * readonly. root element of current component
         * @type NodeList
         */
        el:{
            view:true
        },

        /**
         * archor element where component append to
         * @type NodeList
         */
        render:{
            view:true
        },

        /**
         * component's visibleMode,use css "display" or "visibility" to show this component
         * @type String
         */
        visibleMode:{
            value:"display",
            view:true
        },

        /**
         * whether this component is visible
         * @type Boolean
         */
        visible:{
            view:true
        },

        /**
         * the node to parse for configuration values,passed to component's HTML_PARSER definition
         * @type NodeList
         */
        srcNode:{
            view:true
        }
    };


    Box.HTML_PARSER =
    /**
     * @private
     */
    {
        el:function (srcNode) {
            /**
             * 如果需要特殊的对现有元素的装饰行为
             */
            var self = this;
            if (self.decorateInternal) {
                self.decorateInternal(S.one(srcNode));
            }
            return srcNode;
        }
    };

    Box.prototype =
    /**
     * @lends Component.UIBase.Box#
     */
    {
        /**
         * @private
         */
        _uiSetVisible:function (isVisible) {
            this.fire(isVisible ? "show" : "hide");
        },

        /**
         * show component
         */
        show:function () {
            var self = this, view;
            if (!self.get("rendered")) {
                // 防止初始设置 false，导致触发 hide 事件
                // show 里面的初始一定是 true，触发 show 事件
                // 2012-03-28 : 用 set 而不是 __set :
                // - 如果 show 前调用了 hide 和 create，view 已经根据 false 建立起来了
                // - 也要设置 view
                //self.set("visible", true);
                // 2012-06-07 ，不能 set
                // 初始监听 visible ，得不到 el
                self.__set("visible", true);
                if (view = self.get("view")) {
                    view.set("visible", true);
                }
                self.render();
            } else {
                self.set("visible", true);
            }
            return self;
        },

        /**
         * hide component
         */
        hide:function () {
            var self = this;
            self.set("visible", false);
            return self;
        }
    };

    return Box;
});
/**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/boxrender', function (S, Node) {

    var $ = S.all, doc = S.Env.host.document;


    function BoxRender() {
    }

    BoxRender.ATTRS = {
        el:{
            //容器元素
            setter:function (v) {
                return $(v);
            }
        },
        // 构建时批量生成，不需要执行单个
        elCls:{
            sync:false
        },
        elStyle:{
            sync:false
        },
        width:{
            sync:false
        },
        height:{
            sync:false
        },
        elTagName:{
            sync:false,
            // 生成标签名字
            value:"div"
        },
        elAttrs:{
            sync:false
        },

        html:{
            // !! srcNode 和 html 不能同时设置
            sync:false
        },
        elBefore:{
        },
        render:{},
        visible:{
        },
        visibleMode:{

        }
    };

    BoxRender.construct = constructEl;

    function constructEl(cls, style, width, height, tag, attrs, html) {
        style = style || {};
        html = html || "";
        if (typeof html !== "string") {
            html = "";
        }

        if (width) {
            style.width = typeof width == "number" ? (width + "px") : width;
        }

        if (height) {
            style.height = typeof height == "number" ? (height + "px") : height;
        }

        var styleStr = '';

        for (var s in style) {
            if (style.hasOwnProperty(s)) {
                styleStr += s + ":" + style[s] + ";";
            }
        }

        var attrStr = '';

        for (var a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                attrStr += " " + a + "='" + attrs[a] + "'" + " ";
            }
        }

        return "<" + tag + (styleStr ? (" style='" + styleStr + "' ") : "")
            + attrStr + (cls ? (" class='" + cls + "' ") : "")
            + ">" + html + "<" + "/" + tag + ">";
        //return ret;
    }

    BoxRender.HTML_PARSER =
    /**
     * @ignore
     */
    {
        html:function (el) {
            return el.html();
        }
    };

    BoxRender.prototype =
    /**
     * @lends Component.UIBase.Box.Render#
     */
    {

        __renderUI:function () {
            var self = this;
            // 新建的节点才需要摆放定位
            if (self.__boxRenderNew) {
                var render = self.get("render"),
                    el = self.get("el"),
                    elBefore = self.get("elBefore");
                if (elBefore) {
                    el.insertBefore(elBefore);
                }
                else if (render) {
                    el.appendTo(render);
                }
                else {
                    el.appendTo(doc.body);
                }
            }
        },

        /**
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom:function () {
            var self = this,
                elCls = self.get("elCls"),
                elStyle = self.get("elStyle"),
                width = self.get("width"),
                height = self.get("height"),
                html = self.get("html"),
                elAttrs = self.get("elAttrs"),
                el = self.get("el");
            if (!el) {
                self.__boxRenderNew = true;
                el = new Node(constructEl(elCls,
                    elStyle,
                    width,
                    height,
                    self.get("elTagName"),
                    elAttrs,
                    html));
                self.__set("el", el);
            }
            // 通过 srcNode 过来的
            else {
                if (elCls) {
                    el.addClass(elCls);
                }
                if (elStyle) {
                    el.css(elStyle);
                }
                if (width !== undefined) {
                    el.width(width);
                }
                if (height !== undefined) {
                    el.height(height);
                }
                /*
                 srcNode 就是原来的内容，也可以不用设置 html
                 if (html !== undefined &&
                 // 防止冲掉 el 原来的子元素引用 !!
                 html !== el.html()) {
                 el.html(html);
                 }
                 */
                if (elAttrs) {
                    el.attr(elAttrs);
                }
            }
        },

        _uiSetElAttrs:function (attrs) {
            this.get("el").attr(attrs);
        },

        _uiSetElCls:function (cls) {
            this.get("el").addClass(cls);
        },

        _uiSetElStyle:function (style) {
            this.get("el").css(style);
        },

        _uiSetWidth:function (w) {
            this.get("el").width(w);
        },

        _uiSetHeight:function (h) {
            var self = this;
            self.get("el").height(h);
        },

        _uiSetHtml:function (c) {
            this.get("el").html(c);
        },

        _uiSetVisible:function (isVisible) {
            var el = this.get("el"),
                visibleMode = this.get("visibleMode");
            if (visibleMode == "visibility") {
                el.css("visibility", isVisible ? "visible" : "hidden");
            } else {
                el.css("display", isVisible ? "" : "none");
            }
        },

        __destructor:function () {
            //S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.remove();
            }
        }
    };

    return BoxRender;
}, {
    requires:['node']
});
/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/close", function () {

    /**
     * Close extension class.
     * Represent a close button.
     * @class
     * @memberOf Component.UIBase
     */
    function Close() {
    }

    var HIDE = "hide";
    Close.ATTRS =
    /**
     * @lends Component.UIBase.Close.prototype
     */
    {
        /**
         * Whether close button is visible.
         * Default: true.
         * @type Boolean
         */
        closable:{
            value:true,
            view:true
        },

        /**
         * Close button.
         */
        closeBtn:{
            view:true
        },

        /**
         * Whether to destroy or hide current element when click close button.
         * Default: "hide". Can set "destroy" to destroy it when click close button.
         * @type String
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
                    self[actions[self.get("closeAction")] || HIDE]();
                    ev.preventDefault();
                });
            }
        },
        __destructor:function () {
            var btn = this.get("closeAction");
            btn && btn.detach();
        }
    };
    return Close;

});/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/closerender", function (S, Node) {

    var CLS_PREFIX = 'ks-ext-';

    function getCloseBtn() {
        return new Node("<a " +
            "tabindex='0' " +
            "href='javascript:void(\"关闭\")' " +
            "role='button' " +
            "class='" + CLS_PREFIX + "close" + "'>" +
            "<span class='" +
            CLS_PREFIX + "close-x" +
            "'>关闭<" + "/span>" +
            "<" + "/a>");
    }

    function Close() {
    }

    Close.ATTRS = {
        closable:{
        },
        closeBtn:{
        }
    };

    Close.HTML_PARSER = {
        closeBtn:function (el) {
            return el.one("." + CLS_PREFIX + 'close');
        }
    };

    Close.prototype = {
        _uiSetClosable:function (v) {
            var self = this,
                btn = self.get("closeBtn");
            if (v) {
                if (!btn) {
                    self.__set("closeBtn", btn = getCloseBtn());
                }
                btn.appendTo(self.get("el"), undefined);
            } else {
                if (btn) {
                    btn.remove();
                }
            }
        }
    };

    return Close;

}, {
    requires:["node"]
});/**
 * @fileOverview constrain extension for kissy
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add("component/uibase/constrain", function (S, DOM, Node) {

    /**
     * Constrain extension class.
     * Constrain component to specified region
     * @class
     * @memberOf Component.UIBase
     */
    function Constrain() {

    }

    Constrain.ATTRS =
    /**
     * @lends Component.UIBase.Constrain.prototype
     */
    {
        /**
         * Config constrain region.
         * True: viewport
         * Node: specified element.
         * false: no constrain region.
         * @type NodeList|Boolean
         */
        constrain:{
            //不限制
            //true:viewport限制
            //node:限制在节点范围
            value:false
        }
    };

    /**
     * 获取受限区域的宽高, 位置
     * @return {Object | undefined} {left: 0, top: 0, maxLeft: 100, maxTop: 100}
     */
    function _getConstrainRegion(constrain) {
        var ret = null;
        if (!constrain) {
            return ret;
        }
        var el = this.get("el");
        if (constrain !== true) {
            constrain = Node.one(constrain);
            ret = constrain.offset();
            S.mix(ret, {
                maxLeft:ret.left + constrain.outerWidth() - el.outerWidth(),
                maxTop:ret.top + constrain.outerHeight() - el.outerHeight()
            });
        }
        // 没有指定 constrain, 表示受限于可视区域
        else {
            ret = {
                left:DOM.scrollLeft(),
                top:DOM.scrollTop()
            };
            S.mix(ret, {
                maxLeft:ret.left + DOM.viewportWidth() - el.outerWidth(),
                maxTop:ret.top + DOM.viewportHeight() - el.outerHeight()
            });
        }

        return ret;
    }

    Constrain.prototype = {

        __renderUI:function () {
            var self = this,
                attrs = self.getAttrs(),
                xAttr = attrs["x"],
                yAttr = attrs["y"],
                oriXSetter = xAttr["setter"],
                oriYSetter = yAttr["setter"];
            xAttr.setter = function (v) {
                var r = oriXSetter && oriXSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.left),
                    _ConstrainExtRegion.maxLeft);
            };
            yAttr.setter = function (v) {
                var r = oriYSetter && oriYSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.top),
                    _ConstrainExtRegion.maxTop);
            };
            self.addAttr("x", xAttr);
            self.addAttr("y", yAttr);
        }
    };


    return Constrain;

}, {
    requires:["dom", "node"]
});/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentbox", function () {

    /**
     * ContentBox extension class.
     * Represent inner element of component's root element.
     * @class
     * @memberOf Component.UIBase
     */
    function ContentBox() {
    }

    ContentBox.ATTRS =
    /**
     * @lends Component.UIBase.ContentBox#
     */
    {
        /**
         * content of component's content box
         * @type NodeList|String
         */
        content:{
            view:true,
            sync:false
        },

        /**
         * readonly! content box's element of component
         * @type NodeList
         */
        contentEl:{
            view:true
        },

        /**
         * name-value pair attribute of component's content box element
         * @type Object
         */
        contentElAttrs:{
            view:true
        },

        /**
         * name-value pair css style of component's content box element
         * @type Object
         */
        contentElStyle:{
            view:true
        },

        /**
         * tag name of contentbox 's root element.
         * Default: "div"
         * @type String
         */
        contentTagName:{
            view:true
        }
    };

    return ContentBox;
});/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentboxrender", function (S, Node, BoxRender) {


    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl:{},
        contentElAttrs:{},
        contentElCls:{},
        contentElStyle:{},
        contentTagName:{
            value:"div"
        },
        content:{
            sync:false
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    ContentBoxRender.HTML_PARSER = {
        content:function (el) {
            return el[0].innerHTML;
        }
    };

    var constructEl = BoxRender.construct;

    ContentBoxRender.prototype = {

        // no need ,shift create work to __createDom
        __renderUI:function () {
        },

        __createDom:function () {
            var self = this,
                contentEl,
                c = self.get("content"),
                el = self.get("el"),
                html = "",
                elChildren = S.makeArray(el[0].childNodes);

            if (elChildren.length) {
                html = el[0].innerHTML
            }

            // el html 和 c 相同，直接 append el的子节点
            if (c == html) {
                c = "";
            }

            contentEl = new Node(constructEl("ks-contentbox "
                + (self.get("contentElCls") || ""),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"),
                c));

            contentEl.appendTo(el);

            self.__set("contentEl", contentEl);
            // on content,then read from box el
            if (!c) {
                for (var i = 0, l = elChildren.length; i < l; i++) {
                    contentEl.append(elChildren[i]);
                }
            } else if (typeof c !== 'string') {
                contentEl.append(c);
            }
        },

        _uiSetContentElCls:function (cls) {
            this.get("contentEl").addClass(cls);
        },

        _uiSetContentElAttrs:function (attrs) {
            this.get("contentEl").attr(attrs);
        },

        _uiSetContentElStyle:function (v) {
            this.get("contentEl").css(v);
        },

        _uiSetContent:function (c) {
            if (typeof c == "string") {
                this.get("contentEl").html(c);
            } else {
                this.get("contentEl").empty().append(c);
            }
        }
    };

    return ContentBoxRender;
}, {
    requires:["node", "./boxrender"]
});/**
 * @fileOverview drag extension for position
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/drag", function (S) {

    /**
     * Drag extension class.
     * Make element draggable.
     * @class
     * @memberOf Component.UIBase
     */
    function Drag() {
    }

    Drag.ATTRS =

    /**
     * @lends Component.UIBase.Drag
     */
    {
        /**
         * Current draggable element's handlers.
         * See {@link DD.Draggable#handlers}
         */
        handlers:{
            value:[]
        },
        /**
         * Whether current element is draggable.
         * @type Boolean
         */
        draggable:{value:true}
    };

    function dragExtAction(ev) {
        this.set("xy", [ev.left, ev.top]);
    }

    Drag.prototype = {

        _uiSetHandlers:function (v) {
            var d;
            if (v && v.length > 0 && (d = this.__drag)) {
                d.set("handlers", v);
            }
        },

        __bindUI:function () {
            var DD = S.require("dd") || {},
                Draggable = DD.Draggable,
                d,
                self = this,
                dragCfg = self.get("draggable"),
                el = self.get("el");
            if (dragCfg && Draggable) {
                if (dragCfg === true) {
                    dragCfg = {};
                }
                d = self.__drag = new Draggable({
                    node:el,
                    move:dragCfg.proxy
                });

                if (dragCfg.proxy) {
                    dragCfg.proxy.moveOnEnd = false;
                    d.on("dragend", function () {
                        var proxyOffset = p.get("proxyNode").offset();
                        el.css("visibility", "");
                        self.set("x", proxyOffset.left);
                        self.set("y", proxyOffset.top);
                    });
                    var p = self.__proxy = new DD.Proxy(dragCfg.proxy);
                    p.attachDrag(d);
                } else {
                    d.on("drag", dragExtAction, self);
                }

                if (dragCfg.scroll) {
                    var s = self.__scroll = new DD.Scroll(dragCfg.scroll);
                    s.attachDrag(d);
                }

            }
        },

        _uiSetDraggable:function (v) {
            var d = this.__drag;
            d && d.set("disabled", !v);
        },

        __destructor:function () {
            var self = this,
                p = self.__proxy,
                s = self.__scroll,
                d = self.__drag;
            d && d.destroy();
            s && s.destroy();
            p && p.destroy();
        }

    };
    return Drag;

});/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/loading", function () {

    /**
     * Loading extension class.
     * Make component to be able to mask loading.
     * @class
     * @memberOf Component.UIBase
     */
    function Loading() {
    }

    Loading.prototype =
    /**
     * @lends Component.UIBase.Loading#
     */
    {
        /**
         * mask component as loading
         */
        loading:function () {
            this.get("view").loading();
            return this;
        },

        /**
         * unmask component as loading
         */
        unloading:function () {
            this.get("view").unloading();
            return this;
        }
    };

    return Loading;

});/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/loadingrender", function(S, Node) {

    function Loading() {
    }

    Loading.prototype = {
        loading:function() {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new Node("<div " +
                    "class='" +
                    "ks-ext-loading'" +
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

        unloading:function() {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

}, {
    requires:['node']
});/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/mask", function () {

    /**
     * Mask extension class.
     * Make component to be able to show with mask.
     * @class
     * @memberOf Component.UIBase
     */
    function Mask() {
    }

    Mask.ATTRS =
    /**
     * @lends Component.UIBase.Mask#
     */
    {
        /**
         * Whether show mask layer when component shows
         * @type Boolean
         */
        mask:{
            value:false
        },
        /**
         * Mask node for current overlay 's mask.
         * @type {NodeList}
         */
        maskNode:{
            view:true
        },
        /**
         * Whether to share mask with other overlays.
         * Default: true.
         * @type {Boolean}
         */
        maskShared:{
            value:true,
            view:true
        }
    };

    Mask.prototype = {

        __bindUI:function () {
            var self = this,
                view = self.get("view"),
                _maskExtShow = view._maskExtShow,
                _maskExtHide = view._maskExtHide;
            if (self.get("mask")) {
                self.on("show", _maskExtShow, view);
                self.on("hide", _maskExtHide, view);
            }
        }
    };


    return Mask;
}, {requires:["ua"]});/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/maskrender", function (S, UA, Node) {

    /**
     * 每组相同 prefixCls 的 position 共享一个遮罩
     */
    var maskMap = {
            /**
             * {
             *  node:
             *  num:
             * }
             */

        },
        ie6 = (UA['ie'] === 6),
        $ = Node.all;

    function getMaskCls(self) {
        return self.get("prefixCls") + "ext-mask";
    }

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask(maskCls) {
        var mask = $("<div " +
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
        /**
         * 点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown", function (e) {
            e.preventDefault();
        });
        return mask;
    }

    function Mask() {
    }

    Mask.prototype = {

        _maskExtShow:function () {
            var self = this,
                maskCls = getMaskCls(self),
                maskDesc = maskMap[maskCls],
                maskShared = self.get("maskShared"),
                mask = self.get("maskNode");
            if (!mask) {
                if (maskShared) {
                    if (maskDesc) {
                        mask = maskDesc.node;
                    } else {
                        mask = initMask(maskCls);
                        maskDesc = maskMap[maskCls] = {
                            num:0,
                            node:mask
                        };
                    }
                } else {
                    mask = initMask(maskCls);
                }
                self.__set("maskNode", mask);
            }
            mask.css("z-index", self.get("zIndex") - 1);
            if (maskShared) {
                maskDesc.num++;
            }
            if (!maskShared || maskDesc.num == 1) {
                mask.show();
            }
        },

        _maskExtHide:function () {
            var self = this,
                maskCls = getMaskCls(self),
                maskDesc = maskMap[maskCls],
                maskShared = self.get("maskShared"),
                mask = self.get("maskNode");
            if (maskShared && maskDesc) {
                maskDesc.num = Math.max(maskDesc.num - 1, 0);
                if (maskDesc.num == 0) {
                    mask.hide();
                }
            } else {
                mask.hide();
            }
        },

        __destructor:function () {
            var self = this,
                maskShared = self.get("maskShared"),
                mask = self.get("maskNode");
            if (self.get("mask")) {
                if (maskShared) {
                    if (self.get("visible")) {
                        self._maskExtHide();
                    }
                } else {
                    mask.remove();
                }
            }
        }

    };

    return Mask;
}, {
    requires:["ua", "node"]
});

/**
 * TODO
 *  - mask index 隐藏时不会恢复 z-index，需要业务架构自己实现 DialogManager
 **//**
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/position", function (S) {

    /**
     * Position extensiong class.
     * Make component positionable
     * @class
     * @memberOf Component.UIBase
     */
    function Position() {
    }

    Position.ATTRS =
    /**
     * @lends Component.UIBase.Position#
     */
    {
        /**
         * Horizontal axis
         * @type Number
         */
        x:{
            view:true
        },
        /**
         * Vertical axis
         * @type Number
         */
        y:{
            view:true
        },
        /**
         * Horizontal and vertical axis.
         * @type Number[]
         */
        xy:{
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter:function (v) {
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
            /**
             * xy 纯中转作用
             */
            getter:function () {
                return [this.get("x"), this.get("y")];
            }
        },
        /**
         * z-index value.
         * @type Number
         */
        zIndex:{
            view:true
        }
    };


    Position.prototype =
    /**
     * @lends Component.UIBase.Position.prototype
     */
    {
        /**
         * Move to absolute position.
         * @param {Number|Number[]} x
         * @param {Number} [y]
         * @example
         * <code>
         * move(x, y);
         * move(x);
         * move([x,y])
         * </code>
         */
        move:function (x, y) {
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
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author  yiminghe@gmail.com
 */
KISSY.add("component/uibase/positionrender", function () {

    var ZINDEX = 9999;

    function Position() {
    }

    Position.ATTRS = {
        x:{
            // 水平方向绝对位置
            valueFn:function () {
                var self = this;
                // 读到这里时，el 一定是已经加到 dom 树中了，否则报未知错误
                // el 不在 dom 树中 offset 报错的
                // 最早读就是在 syncUI 中，一点重复设置(读取自身 X 再调用 _uiSetX)无所谓了
                return self.get("el") && self.get("el").offset().left;
            }
        },
        y:{
            // 垂直方向绝对位置
            valueFn:function () {
                var self = this;
                return self.get("el") && self.get("el").offset().top;
            }
        },
        zIndex:{
            value:ZINDEX
        }
    };


    Position.prototype = {

        __createDom:function () {
            this.get("el").addClass("ks-ext-position");
        },

        _uiSetZIndex:function (x) {
            this.get("el").css("z-index", x);
        },

        _uiSetX:function (x) {
            this.get("el").offset({
                left:x
            });
        },

        _uiSetY:function (y) {
            this.get("el").offset({
                top:y
            });
        }
    };

    return Position;
});/**
 * @fileOverview resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/resize", function (S) {

    /**
     * Resizable extension class.
     * Make component resizable
     * @class
     * @memberOf Component.UIBase
     */
    function Resize() {
    }

    Resize.ATTRS =
    /**
     * @lends Component.UIBase.Resize.prototype
     */
    {
        /**
         * Resizable configuration.
         * See {@link Resizable}
         * @example
         * <code>
         *  {
         *    minWidth:100,
         *    maxWidth:1000,
         *    minHeight:100,
         *    maxHeight:1000,
         *    handlers:["b","t","r","l","tr","tl","br","bl"]
         *  }
         * </code>
         * @type Object
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
 * @fileOverview shim for ie6 ,require box-ext
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/shimrender", function () {
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
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmod", function () {


    /**
     * StdMod extension class.
     * Generate head, body, foot for component.
     * @class
     * @memberOf Component.UIBase
     */
    function StdMod() {
    }

    StdMod.ATTRS =
    /**
     * @lends Component.UIBase.StdMod#
     */
    {
        /**
         * Header element of dialog. Readonly
         * @type Node
         */
        header:{
            view:true
        },
        /**
         * Body element of dialog. Readonly
         * @type Node
         */
        body:{
            view:true
        },
        /**
         * Footer element of dialog. Readonly
         * @type Node
         */
        footer:{
            view:true
        },
        /**
         * Key-value map of body element's style.
         * @type Object
         */
        bodyStyle:{
            view:true
        },
        /**
         * Key-value map of footer element's style.
         * @type Object
         */
        footerStyle:{
            view:true
        },
        /**
         * Key-value map of header element's style.
         * @type Object
         */
        headerStyle:{
            view:true
        },
        /**
         * Html content of header element.
         * @type NodeList|String
         */
        headerContent:{
            view:true
        },
        /**
         * Html content of body element.
         * @type NodeList|String
         */
        bodyContent:{
            view:true
        },
        /**
         * Html content of footer element.
         * @type NodeList|String
         */
        footerContent:{
            view:true
        }
    };

    return StdMod;

});/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmodrender", function (S, Node) {


    var CLS_PREFIX = "ks-stdmod-";

    function StdMod() {
    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
        },
        bodyStyle:{
            sync:false
        },
        footerStyle:{
            sync:false
        },
        headerStyle:{
            sync:false
        },
        headerContent:{
            sync:false
        },
        bodyContent:{
            sync:false
        },
        footerContent:{
            sync:false
        }
    };

    function serialize(css) {
        var str = "";
        if (css) {
            for (var i in css) {
                if (css.hasOwnProperty(i)) {
                    str += i + ":" + css[i] + ";"
                }
            }
        }
        return str;
    }

    StdMod.HTML_PARSER = {
        header:function (el) {
            return el.one("." + CLS_PREFIX + "header");
        },
        body:function (el) {
            return el.one("." + CLS_PREFIX + "body");
        },
        footer:function (el) {
            return el.one("." + CLS_PREFIX + "footer");
        }
    };

    function renderUI(self, part) {
        var el = self.get("contentEl"),
            style = self.get(part + "Style"),
            content = self.get(part + "Content"),
            isString = S.isString(content),
            partEl = self.get(part);
        if (!partEl) {
            style = serialize(style);
            partEl = new Node("<div class='" +
                CLS_PREFIX + part + "'" +
                " " +
                (style ? ("style='" + style + "'") : "") +
                " >" +
                (isString ? content : "") +
                "</div>");
            if (!isString) {
                partEl.append(content);
            }
            partEl.appendTo(el);
            self.__set(part, partEl);
        } else if (style) {
            partEl.css(style);
        }
    }


    function _setStdModContent(self, part, v) {
        part = self.get(part);
        if (S.isString(v)) {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    StdMod.prototype = {

        __createDom:function () {
            renderUI(this, "header");
            renderUI(this, "body");
            renderUI(this, "footer");
        },

        _uiSetBodyStyle:function (v) {
            this.get("body").css(v);
        },

        _uiSetHeaderStyle:function (v) {
            this.get("header").css(v);
        },
        _uiSetFooterStyle:function (v) {
            this.get("footer").css(v);
        },

        _uiSetBodyContent:function (v) {
            _setStdModContent(this, "body", v);
        },

        _uiSetHeaderContent:function (v) {
            _setStdModContent(this, "header", v);
        },

        _uiSetFooterContent:function (v) {
            _setStdModContent(this, "footer", v);
        }
    };

    return StdMod;

}, {
    requires:['node']
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
        var cs = cls.split(/\s+/), p = -1, t, ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && (t = uic.priority) > p) {
                p = t;
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
        setUIConstructorByCssClass:setUIConstructorByCssClass
    };

    UIStore.getCssClassWithPrefix = getCssClassWithPrefix;

    return UIStore;
});
