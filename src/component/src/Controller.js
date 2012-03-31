/**
 * @fileOverview model and control base class for kissy
 * @author yiminghe@gmail.com
 * @see http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/Controller", function (S, Event, UIBase, UIStore, Render) {

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


    function initChild(self, c, elBefore) {
        // If this (parent) component doesn't have a DOM yet, call createDom now
        // to make sure we render the child component's element into the correct
        // parent element (otherwise render_ with a null first argument would
        // render the child into the document body, which is almost certainly not
        // what we want).
        self.create();
        var contentEl = self.getContentElement();
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
            // 设置好，render 时插入到对应位置，这里不需要了
            // contentEl[0].insertBefore(c.get("el")[0], elBefore && elBefore[0] || null);
        }
    }

    /**
     * 不使用 valueFn
     * 只有 render 时需要找到默认，其他时候不需要，防止莫名其妙初始化
     */
    function getDefaultView() {
        // 逐层找默认渲染器
        var self = this,
            c = self.constructor,
            DefaultRender;

        while (c && !DefaultRender) {
            DefaultRender = c['DefaultRender'];
            c = c.superclass && c.superclass.constructor;
        }
        if (DefaultRender) {
            /**
             * 将渲染层初始化所需要的属性，直接构造器设置过去
             */
            var attrs = self['__attrs'] || {},
                cfg = {};
            for (var attrName in attrs) {
                if (attrs.hasOwnProperty(attrName)) {
                    var attrCfg = attrs[attrName], v;
                    if (attrCfg.view) {
                        // 只设置用户设置的值
                        // 考虑 c 上的默认值
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

    function getClsByHierarchy(self) {
        if (self.__componentClasses) {
            return self.__componentClasses;
        }
        var constructor = self.constructor, re = [];
        while (constructor && constructor != Controller) {
            var cls = UIStore.getClsByUI(constructor);
            if (cls) {
                re.push(cls);
            }
            constructor = constructor.superclass && constructor.superclass.constructor;
        }
        return self.__componentClasses = re.join(" ");
    }


    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    /**
     * model and control for component
     * @class
     * @memberOf Component
     * @name Controller
     * @extends UIBase
     * @extends UIBase.Box
     */
    var Controller = UIBase.create([UIBase.Box],
        /** @lends Component.Controller.prototype */
        {

            __CLASS:"Component.Controller",

            getCls:UIStore.getCls,

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
                            self.on("after" + capitalFirst(attrName) + "Change",
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
             * control 层的渲染 ui 就是 render view
             * finally，不能被 override
             */
            renderUI:function () {
                var self = this, i, child;
                self.get("view").render();
                //then render my children
                var children = self.get("children");
                for (i = 0; i < children.length; i++) {
                    child = children[i];
                    // 不在 Base 初始化设置属性时运行，防止和其他初始化属性冲突
                    initChild(self, child);
                    child.render();
                }
            },

            /**
             * 控制层的 createDom 实际上就是调用 view 层的 create 来创建真正的节点
             */
            createDom:function () {
                var self = this;
                var view = self.get("view") || getDefaultView.call(self);
                view.create();
                view._renderCls(getClsByHierarchy(self));
                if (!self.get("allowTextSelection_")) {
                    view.get("el").unselectable();
                }
                self.__set("view", view);
            },

            /**
             * Returns the DOM element into which child components are to be rendered,
             or null if the container itself hasn't been rendered yet.  Overrides
             */
            getContentElement:function () {
                var view = this.get('view');
                return view && view.getContentElement();
            },

            /**
             *
             * @param c  children to be added
             * @param {int=} index  position to be inserted
             */
            addChild:function (c, index) {
                var self = this,
                    children = self.get("children"),
                    elBefore = null;
                if (index !== undefined) {
                    children.splice(index, 0, c);
                    elBefore = children[index] || null;
                } else {
                    children.push(c);
                }
                initChild(self, c, elBefore);
            },

            /**
             * @public
             * @param c
             * @param destroy
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
            },

            removeChildren:function (destroy) {
                var self = this,
                    i,
                    t = [].concat(self.get("children"));
                for (i = 0; i < t.length; i++) {
                    self.removeChild(t[i], destroy);
                }
                self.__set("children", []);
            },

            getChildAt:function (index) {
                var children = this.get("children");
                return children[index];
            },

            _uiSetHandleMouseEvents:function (v) {
                var self = this,
                    el = self.get("el");
                if (v) {
                    el.on("mouseenter", self._handleMouseEnter, self);
                    el.on("mouseleave", self._handleMouseLeave, self);
                    el.on("mousedown", self._handleMouseDown, self);
                    el.on("mouseup", self._handleMouseUp, self);
                    el.on("dblclick", self._handleDblClick, self);
                } else {
                    el.detach("mouseenter", self._handleMouseEnter, self);
                    el.detach("mouseleave", self._handleMouseLeave, self);
                    el.detach("mousedown", self._handleMouseDown, self);
                    el.detach("mouseup", self._handleMouseUp, self);
                    el.detach("dblclick", self._handleDblClick, self);
                }
            },

            _handleDblClick:function (e) {
                var self = this;
                if (!self.get("disabled")) {
                    self._performInternal(e);
                }
            },

            _isMouseEventWithinElement:function (e, elem) {
                var relatedTarget = e.relatedTarget;
                if (!relatedTarget) {
                    return false;
                }
                // 在里面或等于自身都不算 mouseenter/leave
                if (relatedTarget === elem[0]
                    || elem.contains(relatedTarget)) {
                    return true;
                }
            },

            _handleMouseOver:function (e) {
                var self = this,
                    el = self.get("el");
                if (self.get("disabled")) {
                    return true;
                }
                if (!self._isMouseEventWithinElement(e, el)) {
                    self._handleMouseEnter(e);
                }
            },


            _handleMouseOut:function (e) {
                var self = this,
                    el = self.get("el");
                if (self.get("disabled")) {
                    return true;
                }
                if (!self._isMouseEventWithinElement(e, el)) {
                    self._handleMouseLeave(e);
                }
            },

            /**
             * root element handler for mouse enter
             * @param [e]
             */
            _handleMouseEnter:function (e) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                if (0) {
                    S.log(e);
                }
                self.set("highlighted", true);
            },

            /**
             * root element handler for mouse leave
             */
            _handleMouseLeave:function (e) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                if (1 > 2) {
                    S.log(e);
                }
                self.set("active", false);
                self.set("highlighted", false);
            },

            /**
             * root element handler for mouse down
             * @param ev
             */
            _handleMouseDown:function (ev) {
                var self = this, el;
                if (self.get("disabled")) {
                    return true;
                }
                if (ev.which == 1 && self.get("activeable")) {
                    self.set("active", true);
                }
                el = self.getKeyEventTarget();
                // 左键，否则 unselectable 在 ie 下鼠标点击获得不到焦点
                if (ev.which == 1 && el.attr("tabindex") >= 0) {
                    el[0].focus();
                }
                // Cancel the default action unless the control
                // allows text selection.
                if (ev.which == 1 && !self.get("allowTextSelection_")) {
                    // firefox/chrome 不会引起焦点转移
                    var n = ev.target.nodeName;
                    n = n && n.toLowerCase();
                    // do not prevent focus when click on editable element
                    if (n != "input" && n != "textarea") {
                        ev.preventDefault();
                    }
                }
            },

            /**
             * whether component can receive focus
             */
            _uiSetFocusable:function (v) {
                var self = this,
                    el = self.getKeyEventTarget();
                if (v) {
                    el.on("focus", self._handleFocus, self);
                    el.on("blur", self._handleBlur, self);
                    el.on("keydown", self._handleKeydown, self);
                } else {
                    el.detach("focus", self._handleFocus, self);
                    el.detach("blur", self._handleBlur, self);
                    el.detach("keydown", self._handleKeydown, self);
                }
            },

            _uiSetFocused:function (v) {
                this._forwardSetAttrToView("focused", v);
            },

            _uiSetHighlighted:function (v) {
                this._forwardSetAttrToView("highlighted", v);
            },

            _forwardSetAttrToView:function (attrName, v) {
                var view = this.get("view");
                view["_set" + capitalFirst(attrName)].call(view, v, getClsByHierarchy(this));
            },


            _uiSetDisabled:function (v) {
                this._forwardSetAttrToView("disabled", v);
            },


            _uiSetActive:function (v) {
                this._forwardSetAttrToView("active", v);
            },

            /**
             * 焦点所在元素即键盘事件处理元素
             */
            getKeyEventTarget:function () {
                return this.get("view").getKeyEventTarget();
            },
            /**
             * root element handler for mouse up
             */
            _handleMouseUp:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                // 左键
                if (self.get("active") && ev.which == 1) {
                    self._performInternal(ev);
                    self.set("active", false);
                }
            },
            /**
             * root element handler for focus
             */
            _handleFocus:function () {
                this.set("focused", true);
            },
            /**
             * root element handler for blur
             */
            _handleBlur:function () {
                this.set("focused", false);
            },

            _handleKeyEventInternal:function (ev) {
                if (ev.keyCode == Event.KeyCodes.ENTER) {
                    return this._performInternal(ev);
                }
            },
            /**
             * root element handler for keydown
             * @param ev
             */
            _handleKeydown:function (ev) {
                var self = this;
                if (self.get("disabled")) {
                    return true;
                }
                if (self._handleKeyEventInternal(ev)) {
                    ev.halt();
                    return true;
                }
            },

            /**
             * root element handler for click
             */
            _performInternal:function (e) {
                if (0) {
                    alert(e);
                }
            },

            destructor:function () {
                var self = this,
                    i,
                    children = self.get("children");
                for (i = 0; i < children.length; i++) {
                    children[i].destroy();
                }
                var view = self.get("view");
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
                /*
                 session state
                 */

                // 是否绑定鼠标事件
                handleMouseEvents:{
                    value:true
                },

                // 是否支持焦点处理
                focusable:{
                    /*
                     observer synchronization , model 分成两类：
                     view 负责监听 view 类 model 变化更新界面
                     control 负责监听 control 类变化改变逻辑
                     problem : Observer behavior is hard to understand and debug because it's implicit behavior.

                     Keeping screen state and session state synchronized is an important task
                     Data Binding
                     */
                    view:true,
                    value:true
                    /*
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
                     */
                    // sync
                },

                activeable:{
                    value:true
                },

                focused:{},

                active:{},

                highlighted:{},

                //子组件
                children:{
                    value:[]
                },

                // 转交给渲染层
                prefixCls:{
                    view:true,
                    value:"ks-"
                },

                // 父组件
                // Parent component to which events will be propagated.
                parent:{
                },

                //渲染层
                view:{
                },

                //是否禁用
                disabled:{},

                // 是否允许 DOM 结构内的文字选定
                allowTextSelection_:{
                    value:false
                }
            },

            DefaultRender:Render
        });

    if (0) {
        Controller._uiSetHandleMouseEvents()._uiSetActive();
    }

    return Controller;
}, {
    requires:['event', 'uibase', './uistore', './render']
});
/**
 *  Note:
 *  控制层元属性配置中 view 的作用
 *   - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 *   - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中
 **/