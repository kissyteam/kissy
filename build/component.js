/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 18:42
*/
/**
 * container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function(S, UIBase, MC, UIStore) {

    return UIBase.create(MC, {
        bindUI:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el");
            el.on("mousedown mouseup mouseover mouseout", self._handleChildMouseEvents, self);
        },
        _handleChildMouseEvents:function(e) {
            var control = this.getOwnerControl(S.one(e.target)[0]);
            if (control) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case "mousedown":
                        control._handleMouseDown(e);
                        break;
                    case "mouseup":
                        control._handleMouseUp(e);
                        break;
                    case "mouseover":
                        control._handleMouseOver(e);
                        break;
                    case "mouseout":
                        control._handleMouseOut(e);
                        break;
                }
            }
        },

        decorateInternal:function(el) {
            var self = this;
            self.set("el", el);
            self.decorateChildren(el);
        },
        /**
         * container 需要在装饰时对儿子特殊处理，递归装饰
         */
        decorateChildren:function(el) {
            var self = this,children = el.children();
            children.each(function(c) {
                var cls = c.attr("class") || "",
                    prefixCls = self.get("prefixCls");
                // 过滤掉特定前缀
                cls = cls.replace(new RegExp("(?:^|\\s+)" + prefixCls, "ig"), "");
                var UI = UIStore.getUIByClass(cls);
                if (!UI) {
                    S.log(c);
                    S.error("can not find ui from this markup");
                }
                self.addChild(new UI({
                    srcNode:c,
                    prefixCls:prefixCls
                }));
            });
        },
        getOwnerControl:function(node) {
            var self = this,
                children = self.get("children"),
                len = children.length,
                elem = this.get('view').get("el")[0];
            while (node && node !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("view").get("el")[0] === node) {
                        return children[i];
                    }
                }
                node = node.parentNode;
            }
            return null;
        }

    });

}, {
    requires:['uibase','./modelcontrol','./uistore']
});/**
 * model and control base class for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/modelcontrol", function(S, UIBase) {

    function wrapperViewSetter(attrName) {
        return function(ev) {
            var value = ev.newVal;
            this.get("view") && this.get("view").set(attrName, value);
        };
    }

    function wrapperViewGetter(attrName) {
        return function(v) {
            return v || this.get("view") && this.get("view").get(attrName);
        };
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
            var attrs = self.__attrs,
                attrVals = self.__attrVals,
                cfg = {};
            for (var attrName in attrs) {
                if (attrs.hasOwnProperty(attrName)) {
                    var attrCfg = attrs[attrName],v;
                    if (attrCfg.view) {
                        if ((v = attrVals[attrName]) !== undefined) {
                            cfg[attrName] = v;
                        }
                    }
                }
            }
            return new DefaultRender(cfg);
        }
        return 0;
    }

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    return UIBase.create([UIBase.Box], {

            initializer:function() {
                /**
                 * 整理属性，对纯属于 view 的属性，添加 getter setter 直接到 view
                 */
                var self = this,
                    attrs = self.__attrs;
                for (var attrName in attrs) {
                    if (attrs.hasOwnProperty(attrName)) {
                        var attrCfg = attrs[attrName];
                        if (attrCfg.view) {
                            // setter 不应该有实际操作，仅用于正规化比较好
                            // attrCfg.setter = wrapperViewSetter(attrName);
                            self.on("after" + capitalFirst(attrName) + "Change",
                                wrapperViewSetter(attrName));
                            attrCfg.getter = wrapperViewGetter(attrName);
                        }
                    }
                }

            },

            /**
             * control 层的渲染 ui 就是 render view
             */
            renderUI:function() {
                var self = this;
                self.get("view").render();
                //then render my children
                var children = self.get("children");
                S.each(children, function(child) {
                    child.render();
                });
            },

            /**
             * 控制层的 createDom 实际上就是调用 view 层的 create 来创建真正的节点
             */
            createDom:function() {
                var self = this;
                var view = self.get("view") || getDefaultView.call(self);
                if (!view) {
                    S.error("no view for");
                    S.error(self.constructor);
                    return;
                }
                view.create();
                if (!self.get("allowTextSelection_")) {
                    view.get("el").unselectable();
                }
                self.set("view", view);
            },

            /**
             * Returns the DOM element into which child components are to be rendered,
             or null if the container itself hasn't been rendered yet.  Overrides
             */
            getContentElement:function() {
                var view = this.get('view');
                return view && view.getContentElement();
            },



            _initChild:function(c, elBefore) {
                var self = this;
                // If this (parent) component doesn't have a DOM yet, call createDom now
                // to make sure we render the child component's element into the correct
                // parent element (otherwise render_ with a null first argument would
                // render the child into the document body, which is almost certainly not
                // what we want).
                self.create();
                var contentEl = self.getContentElement();
                c.set("parent", self);
                c.set("render", contentEl);
                c.set("elBefore", elBefore);
                // 如果 parent 已经渲染好了子组件也要立即渲染，就 创建 dom ，绑定事件
                if (this.get("rendered")) {
                    c.render();
                }
                // 如果 parent 也没渲染，子组件 create 出来和 parent 节点关联
                // 子组件和 parent 组件一起渲染
                else {
                    // 之前设好属性，view ，logic 同步还没 bind ,create 不是 render ，还没有 bindUI
                    c.create();
                    contentEl[0].insertBefore(c.get("el")[0], elBefore && elBefore[0] || null);

                }
            },

            /**
             *
             * @param c  children to be added
             * @param {int=} index  position to be inserted
             */
            addChild:function(c, index) {
                var self = this,
                    children = self.get("children"),
                    elBefore = children[index];
                if (index) {
                    children.splice(index, 0, c);
                } else {
                    children.push(c);
                }
                self._initChild(c, elBefore);
            },

            removeChild:function(c, destroy) {
                var children = this.get("children"),
                    index = S.indexOf(c, children);
                if (index != -1) {
                    children.splice(index, 1);
                }
                if (destroy) {
                    c.destroy();
                }
            },

            removeChildren:function(destroy) {
                S.each(this.get("children"), function(c) {
                    destroy && c.destroy();
                });
                this.set("children", []);
            },

            getChildAt:function(index) {
                var children = this.get("children");
                return children[index];
            },

            _uiSetHandleMouseEvents:function(v) {
                var self = this,
                    view = self.get("view"),
                    el = view.get("el");
                if (v) {
                    el.on("mouseenter", self._handleMouseEnter, self);
                    el.on("mouseleave", self._handleMouseLeave, self);
                    el.on("mousedown", self._handleMouseDown, self);
                    el.on("mouseup", self._handleMouseUp, self);
                    el.on("click", self._handleClick, self);
                } else {
                    el.detach("mouseenter", self._handleMouseEnter, self);
                    el.detach("mouseleave", self._handleMouseLeave, self);
                    el.detach("mousedown", self._handleMouseDown, self);
                    el.detach("mouseup", self._handleMouseUp, self);
                    el.detach("click", self._handleClick, self);
                }
            },

            isMouseEventWithinElement_:function(e, elem) {
                var relatedTarget = e.relatedTarget;
                relatedTarget = relatedTarget && S.one(relatedTarget)[0];
                if (!relatedTarget) {
                    return false;
                }
                // 在里面或等于自身都不算 mouseenter/leave
                if (relatedTarget === elem[0] || elem.contains(relatedTarget)) {
                    return true;
                }
            },
            _forwordToView:function(method, ev) {
                var self = this,
                    view = self.get("view");
                view[method] && view[method](ev);
            },

            _handleMouseOver:function(e) {
                if (this.get("disabled")) {
                    return true;
                }
                var self = this,
                    view = self.get("view"),
                    el = view.get("el");
                if (!self.isMouseEventWithinElement_(e, el)) {
                    self._handleMouseEnter(e);
                }
            },


            _handleMouseOut:function(e) {
                if (this.get("disabled")) {
                    return true;
                }
                var self = this,
                    view = self.get("view"),
                    el = view.get("el");
                if (!self.isMouseEventWithinElement_(e, el)) {
                    self._handleMouseLeave(e);
                }
            },

            /**
             * root element handler for mouse enter
             * @param ev
             */
            _handleMouseEnter:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView('_handleMouseEnter', ev);
            },
            /**
             * root element handler for mouse leave
             * @param ev
             */
            _handleMouseLeave:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView('_handleMouseLeave', ev);
            },
            /**
             * root element handler for mouse down
             * @param ev
             */
            _handleMouseDown:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView('_handleMouseDown', ev);
                var el = this.getKeyEventTarget();
                // 左键，否则 unselectable 在 ie 下鼠标点击获得不到焦点
                if (ev.which == 1 && el.attr("tabindex") >= 0) {
                    this.getKeyEventTarget()[0].focus();
                }
                // Cancel the default action unless the control allows text selection.
                if (ev.which == 1 && !this.get("allowTextSelection_")) {
                    // firefox 不会引起焦点转移
                    ev.preventDefault();
                }
            },
            /**
             * whether component can receive focus
             */
            _uiSetFocusable:function(v) {
                var self = this,
                    el = self.getKeyEventTarget();
                if (v) {
                    el.on("focus", self._handleFocus, self);
                    el.on("blur", self._handleBlur, self);
                    el.on("keydown", self.__handleKeydown, self);
                } else {
                    el.detach("focus", self._handleFocus, self);
                    el.detach("blur", self._handleBlur, self);
                    el.detach("keydown", self.__handleKeydown, self);
                }
            },

            /**
             * 焦点所在元素即键盘事件处理元素
             */
            getKeyEventTarget:function() {
                return this.get("view").getKeyEventTarget();
            },
            /**
             * root element handler for mouse up
             * @param ev
             */
            _handleMouseUp:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView('_handleMouseUp', ev);
            },
            /**
             * root element handler for focus
             * @param ev
             */
            _handleFocus:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView('_handleFocus', ev);
            },
            /**
             * root element handler for blur
             * @param ev
             */
            _handleBlur:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView('_handleBlur', ev);
            },

            _handleKeydown:function(ev) {
                this._forwordToView('_handleKeydown', ev);
            },
            /**
             * root element handler for keydown
             * @param ev
             */
            __handleKeydown:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                var self = this,
                    view = self.get("view");
                // 默认情况下空格和 enter 直接交给 click 负责
                if (ev.keyCode == 13 || ev.keyCode == 32) {
                    ev.preventDefault();
                    return self._handleClick(ev);
                } else {
                    return this._handleKeydown(ev);
                }
            },

            /**
             * root element handler for mouse enter
             */
            _handleClick:function(ev) {
                if (this.get("disabled")) {
                    return true;
                }
                this._forwordToView("_handleClick", ev);
            },

            _uiSetDisabled:function(d) {
                var view = this.get("view");
                view.set("disabled", d);
            },

            destructor:function() {
                var self = this;
                var children = self.get("children");
                S.each(children, function(child) {
                    child.destroy();
                });
                var view = self.get("view");
                if (view) {
                    view.destroy();
                }
            }
        },
        {
            ATTRS:{

                // 是否绑定鼠标事件
                handleMouseEvents:{
                    value:true
                },

                // 是否支持焦点处理
                focusable:{
                    view:true
                },

                //子组件
                children:{
                    value:[],
                    setter:function(v) {
                        var self = this;
                        //自动给儿子组件加入父亲链
                        S.each(v, function(c) {
                            self._initChild(c);
                        });
                    }
                },

                //转交给渲染层
                //note1 : 兼容性考虑
                //note2 : 调用者可以完全不需要接触渲染层
                srcNode:{
                    view:true
                },

                // 转交给渲染层
                prefixCls:{
                    view:true
                },

                render:{
                    view:true
                },

                // 父组件
                // Parent component to which events will be propagated. 
                parent:{
                },

                //渲染层
                view:{
                },

                //是否禁用
                disabled:{
                    view:true
                },

                // 是否允许 DOM 结构内的文字选定
                allowTextSelection_:{
                    value:false
                }
            }
        });
}, {
    requires:['uibase']
});
/**
 *  Note:
 *  控制层元属性配置中 view 的作用
 *   - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 *   - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中
 **//**
 * render base class for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/render", function(S, UIBase) {
    return UIBase.create([UIBase.Box.Render], {

        getCls:function(cls) {
            var cs = cls.split(/\s+/);
            for (var i = 0; i < cs.length; i++) {
                cs[i] = this.get("prefixCls") + cs[i];
            }
            return cs.join(" ");
        },

        getKeyEventTarget:function() {
            return this.get("el");
        },

        getContentElement:function() {
            return this.get("contentEl") || this.get("el");
        },

        _uiSetFocusable:function(v) {
            var el = this.getKeyEventTarget(),
                tabindex = el.attr("tabindex");
            if (tabindex >= 0 && !v) {
                el.attr("tabindex", -1);
            } else if (!(tabindex >= 0) && v) {
                el.attr("tabindex", 0);
            }
        }
    }, {
        ATTRS:{
            //从 maskup 中渲染
            srcNode:{},
            prefixCls:{
                value:"ks-"
            },
            focusable:{
                value:true
            },
            //是否禁用
            disabled:{
                value:false
            }
        }
    });
}, {
    requires:['uibase']
});KISSY.add("component/uistore", function() {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         ui:Menu
         }
         */
    };

    function getUIByClass(cls) {
        var cs = cls.split(/\s+/),p = -1,ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && uic.priority > p) {
                ui = uic.ui;
            }
        }
        return ui;
    }

    function setUIByClass(cls, uic) {
        uis[cls] = uic;
    }

    return {
        getUIByClass:getUIByClass,
        setUIByClass:setUIByClass
    };
});/**
 * mvc based component framework for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component", function(S, ModelControl, Render, Container, UIStore) {
    return {
        ModelControl:ModelControl,
        Render:Render,
        Container:Container,
        UIStore:UIStore
    };
}, {
    requires:['component/modelcontrol','component/render','component/container','component/uistore']
});
