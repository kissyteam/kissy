/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * model and control base class for kissy
 * @author:yiminghe@gmail.com
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
        var c = this.constructor,DefaultRender;
        while (c && !DefaultRender) {
            DefaultRender = c['DefaultRender'];
            c = c.superclass && c.superclass.constructor;
        }
        if (DefaultRender) {
            /**
             * 将渲染层初始化所需要的属性，直接构造器设置过去
             */
            var attrs = this.__attrs,cfg = {};
            for (var attrName in attrs) {
                if (attrs.hasOwnProperty(attrName)) {
                    var attrCfg = attrs[attrName];
                    if (attrCfg.view
                        //如果用户没设，不要帮他设 undefined
                        //attribute get 判断是 name in attrs
                        && this.__attrVals[attrName] !== undefined) {
                        cfg[attrName] = this.__attrVals[attrName];
                    }
                }
            }
            return new DefaultRender(cfg);
        }
        return undefined;
    }

    return UIBase.create([UIBase.Box], {

        renderUI:function() {
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
            }
            self.set("view", view);
            //first render myself to my parent
            if (self.get("parent")) {
                var pv = self.get("parent").get("view");
                view.set("render", pv.get("contentEl") || pv.get("el"));
            }
            view.render();

            //then render my children
            var children = self.get("children");
            S.each(children, function(child) {
                child.render();
            });
        },

        /**
         *
         * @param c  children to be added
         * @param {int=} index  position to be inserted
         */
        addChild:function(c, index) {
            var children = this.get("children");
            if (index) {
                children.splice(index, 0, c);
            } else {
                children.push(c);
            }
            c.set("parent", this);
        },

        removeChild:function(c) {
            var children = this.get("children");
            var index = S.indexOf(c, children);
            if (index != -1) children.splice(index, 1);
            c.destroy();
        },

        bindUI:function() {
            var self = this,view = self.get("view");
            var el = view.get("el");
            el.on("mouseenter", self._handleMouseEnter, self);
            el.on("mouseleave", self._handleMouseLeave, self);
            el.on("mousedown", self._handleMouseDown, self);
            el.on("mouseup", self._handleMouseUp, self);
            el.on("focus", self._handleFocus, self);
            el.on("blur", self._handleBlur, self);
            el.on("keydown", self._handleKeydown, self);
            el.on("click", self._handleClick, self);

        },

        _forwordToView:function(method, ev) {
            var self = this,view = self.get("view");
            view[method] && view[method](ev);
        },


        /**
         * root element handler for mouse enter
         * @param ev
         */
        _handleMouseEnter:function(ev) {
            if (this.get("disabled")) return false;
            this._forwordToView('_handleMouseEnter', ev);
        },
        /**
         * root element handler for mouse leave
         * @param ev
         */
        _handleMouseLeave:function(ev) {
            if (this.get("disabled")) return false;
            this._forwordToView('_handleMouseLeave', ev);
        },
        /**
         * root element handler for mouse down
         * @param ev
         */
        _handleMouseDown:function(ev) {
            if (this.get("disabled")) return false;
            this._forwordToView('_handleMouseDown', ev);
        },
        /**
         * root element handler for mouse up
         * @param ev
         */
        _handleMouseUp:function(ev) {
            if (this.get("disabled")) return false;
            this._forwordToView('_handleMouseUp', ev);
        },
        /**
         * root element handler for focus
         * @param ev
         */
        _handleFocus:function(ev) {
            if (this.get("disabled")) return false;
            this._forwordToView('_handleFocus', ev);
        },
        /**
         * root element handler for blur
         * @param ev
         */
        _handleBlur:function(ev) {
            if (this.get("disabled")) return false;
            this._forwordToView('_handleBlur', ev);
        },
        /**
         * root element handler for keydown
         * @param ev
         */
        _handleKeydown:function(ev) {

            if (this.get("disabled")) return false;
            var self = this,view = self.get("view");
            if (!view['_handleKeydown']) return;
            if (ev.keyCode == 13 || ev.keyCode == 32) {
                this._handleClick();
                ev.preventDefault();
            } else {
                return view['_handleKeydown'](ev);
            }
        },

        /**
         * root element handler for mouse enter
         */
        _handleClick:function() {
            if (this.get("disabled")) return false;
            this._forwordToView("_handleClick");
            this.fire("click");
        },

        _uiSetDisabled:function(d) {
            var view = this.get("view");
            view.set("disabled", d);
        },

        destructor:function() {
            var children = this.get("children");
            S.each(children, function(child) {
                child.destroy();
            });
            var view = this.get("view");
            var el = view.get("el");
            el.detach();
            view.destroy();
        }

    }, {
        ATTRS:{
            //子组件
            children:{
                value:[],
                setter:function(v) {
                    var self = this;
                    //自动给儿子组件加入父亲链
                    S.each(v, function(c) {
                        c.set("parent", self);
                    });
                }
            },

            //转交给渲染层
            //note1 : 兼容性考虑
            //note2 : 调用者可以完全不需要接触渲染层
            srcNode:{
                view:true
            },

            render:{
                view:true
            },

            //父组件
            parent:{},

            //渲染层
            view:{},

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
});/**
 * render base class for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component/render", function(S, UIBase) {
    return UIBase.create([UIBase.Box.Render], {

    }, {
        ATTRS:{
            //从 maskup 中渲染
            srcNode:{},
            prefixCls:{
                value:""
            },
            //是否禁用
            disabled:{
                value:false
            }
        }
    });
}, {
    requires:['uibase']
});/**
 * mvc based component framework for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component", function(S, ModelControl, Render) {
    return {
        ModelControl:ModelControl,
        Render:Render
    };
}, {
    requires:['component/modelcontrol','component/render']
});
