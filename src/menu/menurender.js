/**
 * render aria from menu according to current menuitem
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {
    function setActiveDescendant(self, v) {
        var el = self.get("el");

        if (v) {
            var menuItemEl = v.get("view").get("el"),
                id = menuItemEl.attr("id");
            S.log("set aria-activedescendant " + id);
            el.attr("aria-activedescendant", id);
        } else {
            S.log("remove aria-activedescendant ");
            el.attr("aria-activedescendant", "");
        }
    }

    var MenuRender = UIBase.create(Component.Render, [

        UIBase.Contentbox.Render,
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], {

        renderUI:function() {
            var el = this.get("el");
            el.attr("role", "menu");
            el.attr("aria-haspopup", true);
        },


        _uiSetHighlightedItem:function(v) {
            setActiveDescendant(this, v);
        },

        _uiSetActiveItem:function(v) {
            setActiveDescendant(this, v);
        },

        _uiSetDisabled:function(v) {
            if (this.get("focusable")) {
                //接受键盘焦点
                this.get("el").attr("tabindex", v ? -1 : 0);
            }
        },

        _uiSetFocusable:function(v) {
            if (!this.get("disabled")) {

                if (v) {
                } else {
                    this.get("el").unselectable();
                    this.get("el").attr("onmousedown", "return false;");
                }
            }
        },

        /**
         * just a tag
         * allow keydown
         */
        _handleKeydown:function() {

        }

    }, {
        ATTRS:{
            highlightedItem:{},
            activeItem:{},
            elCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "menu "
                        + this.get("prefixCls") + "menu-vertical";
                }
            },
            prefixCls:{
                value:"goog-"
            },
            focusable:{
                value:true
            }
        }
    });
    return MenuRender;
}, {
    requires:['ua','uibase','component']
});