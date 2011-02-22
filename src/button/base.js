/**
 * Model and Control for button
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, UIBase) {

    return UIBase.create([], {

        renderUI:function() {
            var view = this.get("view");
            view.render();
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
            if (self.get("disabled")) return false;
            this._forwordToView('_handleMouseEnter', ev);
        },
        /**
         * root element handler for mouse leave
         * @param ev
         */
        _handleMouseLeave:function(ev) {
            if (self.get("disabled")) return false;
            this._forwordToView('_handleMouseLeave', ev);
        },
        /**
         * root element handler for mouse down
         * @param ev
         */
        _handleMouseDown:function(ev) {
            if (self.get("disabled")) return false;
            this._forwordToView('_handleMouseDown', ev);
        },
        /**
         * root element handler for mouse up
         * @param ev
         */
        _handleMouseUp:function(ev) {
            if (self.get("disabled")) return false;
            this._forwordToView('_handleMouseUp', ev);
        },
        /**
         * root element handler for focus
         * @param ev
         */
        _handleFocus:function(ev) {
            if (self.get("disabled")) return false;
            this._forwordToView('_handleFocus', ev);
        },
        /**
         * root element handler for blur
         * @param ev
         */
        _handleBlur:function(ev) {
            if (self.get("disabled")) return false;
            this._forwordToView('_handleBlur', ev);
        },
        /**
         * root element handler for keydown
         * @param ev
         */
        _handleKeydown:function(ev) {
            if (self.get("disabled")) return false;
            var self = this,view = self.get("view");
            if (!view['_handleKeydown']) return;
            if (ev.keyCode == 13 || ev.keyCode == 32) {
                this._handleClick();
            } else {
                view['_handleKeydown'](ev);
            }
        },
        /**
         * root element handler for mouse enter
         * @param ev
         */
        _handleClick:function() {
            if (self.get("disabled")) return false;
            this._forwordToView("_handleClick");
            self.fire("click");
        },

        //model 中数据属性变化后要更新到 view 层
        _uiSetContent:function(v) {
            var view = this.get("view");
            view.set("content", v);
        },

        _uiSetDisabled:function(d) {
            var view = this.get("view");
            view.set("disabled", d);
        },

        _uiSetTooltip:function(t) {
            var view = this.get("view");
            view.set("tooltip", t);
        },
        _uiSetDescribedby:function(d) {
            if (d === undefined) return;
            var view = this.get("view");
            view.set("describedby", d);
        },
        destructor:function() {
            var view = this.get("view");
            var el = view.get("el");
            el.detach();
            view.destroy();
        }

    }, {
        ATTRS:{
            value:{},
            content:{
                //如果没有用户值默认值，则要委托给 view 层
                //比如 view 层使用 html_parser 来利用既有元素
                valueFn:function() {
                    return this.get("view").get("content");
                }
            },
            describedby:{},
            tooltip:{},
            view:{},
            disabled:{}
        }
    });

}, {
    requires:['uibase']
});