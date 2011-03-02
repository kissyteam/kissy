/**
 * model and control base class for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component/modelcontrol", function(S, UIBase) {
    return UIBase.create([], {

        renderUI:function() {
            var view = this.get("view");

            //first render myself to my parent
            if (this.get("parent")) {
                var pv = this.get("parent").get("view");
                view.set("render", pv.get("contentEl") || pv.get("el"));
            }
            view.render();

            //then render my children
            var children = this.get("children");
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

        _forwordStateToView:function(state, value) {
            this.get("view").set(state, value);
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
            srcNode:{},

            //父组件
            parent:{},

            //渲染层
            view:{

                valueFn:function() {
                    var DefaultRender = this.constructor['DefaultRender'];
                    if (DefaultRender) {
                        return new DefaultRender({
                            srcNode:this.get("srcNode"),
                            render:this.get("render")
                        });
                    }
                }

            },

            //是否禁用
            disabled:{
                value:false
            }
        }
    });
}, {
    requires:['uibase']
});