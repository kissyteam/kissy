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
            if (view['_handleMouseEnter']) {
                el.on("mouseenter", view['_handleMouseEnter'], view);
            }
            if (view['_handleMouseLeave']) {
                el.on("mouseleave", view['_handleMouseLeave'], view);
            }
            if (view['_handleMouseDown']) {
                el.on("mousedown", view['_handleMouseDown'], view);
            }
            if (view['_handleMouseUp']) {
                el.on("mouseup", view['_handleMouseUp'], view);
            }
            if (view['_handleFocus']) {
                el.on("focus", view['_handleFocus'], view);
            }
            if (view['_handleBlur']) {
                el.on("blur", view['_handleBlur'], view);
            }

            function perform(e) {
                if (self.get("disabled")) return;
                if (view['_handleClick']) {
                    view['_handleClick'](e);
                }
                self.fire("click");
            }

            if (view['_handleKeydown']) {
                el.on("keydown", function(ev) {
                    if (ev.keyCode == 13 || ev.keyCode == 32) {
                        perform(ev);
                    } else {
                        view['_handleKeydown'](ev);
                    }
                });
            }
            el.on("click", perform);
        },

        _uiSetContent:function(v) {
            var view = this.get("view");
            view.set("content", v);
        },

        _uiSetDisabled:function(d) {
            var view = this.get("view");
            view.set("disabled", d);
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
            content:{},
            view:{},
            disabled:{}
        }
    });

}, {
    requires:['uibase']
});