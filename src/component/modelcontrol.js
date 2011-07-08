/**
 * model and control base class for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/modelcontrol", function(S, UIBase) {

    function wrapperViewSetter(attrName) {
        return function(value) {
            this.get("view").set(attrName, value);
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
            var attrs = self.__attrs,cfg = {};
            for (var attrName in attrs) {
                if (attrs.hasOwnProperty(attrName)) {
                    var attrCfg = attrs[attrName],v;
                    if (attrCfg.view
                        // 如果用户没设，不要帮他设 undefined
                        // attribute get 判断是 name in attrs
                        // 使用 get ，属性可以只在控制层设置默认值，如果有有效值，这里通过参数传给 view 层
                        && (v = self.get(attrName)) !== undefined) {
                        cfg[attrName] = v;
                    }
                }
            }
            return new DefaultRender(cfg);
        }
        return 0;
    }

    return UIBase.create([UIBase.Box], {

            renderUI:function() {
                var self = this;
                self.get("view").render();
                //then render my children
                var children = self.get("children");
                S.each(children, function(child) {
                    child.render();
                });
            },

            createDom:function() {
                var self = this;
                /**
                 * 将 view 的属性转发过去
                 * 用户一般实际上只需在一个地点设置
                 */
                var attrs = self.__attrs;
                for (var attrName in attrs) {
                    if (attrs.hasOwnProperty(attrName)) {
                        var attrCfg = attrs[attrName];
                        if (attrCfg.view && !self['_uiSet' + capitalFirst(attrName)]) {
                            self['_uiSet' + capitalFirst(attrName)] = wrapperViewSetter(attrName);
                        }
                    }
                }
                var view = self.get("view") || getDefaultView.call(self);
                if (!view) {
                    S.error("no view for");
                    S.error(self.constructor);
                    return;
                }
                view.create();
                self.set("view", view);
            },

            getContentElement:function() {
                var view = this.get('view');
                return view.get("contentEl") || view.get("el");
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

            _initChild:function(c, elBefore) {
                var self = this;
                self.create();
                var contentEl = self.getContentElement();
                c.set("parent", self);
                c.set("render", contentEl);
                c.set("elBefore", elBefore);
                // 之前设好属性，view ，logic 同步还没 bind ,create 不是 render ，还没有 bindUI
                c.create();
                contentEl[0].insertBefore(c.get("el")[0], elBefore && elBefore[0]||null);
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

            _uiSetSupportFocused:function(v) {
                var self = this,
                    view = self.get("view"),
                    el = view.get("el");
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
                supportFocused:{
                    value:true
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
                    view:true,
                    value:"ks-"
                },

                render:{
                    view:true
                },

                //父组件
                parent:{
                },

                //渲染层
                view:{
                },

                //是否禁用
                disabled:{
                    value:false,
                    view:true
                }
            }
        });

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }
}, {
    requires:['uibase']
});
/**
 *  Note:
 *  控制层元属性配置中 view 的作用
 *   - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 *   - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中
 **/