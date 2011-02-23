/**
 * render aria from menu according to current menuitem
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {
    var MenuRender = UIBase.create(Component.Render, [
        UIBase.Box,
        UIBase.Contentbox,
        UIBase.Position,
        UA['ie'] === 6 ? UIBase.Shim : null,
        UIBase.Align
    ], {

        renderUI:function() {
            var el = this.get("el");
            el.attr("role", "menu");
            el.attr("aria-haspopup", true);
            //接受键盘焦点
            el.attr("tabindex", 0);
        },

        _uiSetHighlightedItem:function(v) {

            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("view").get("el"),
                    id = menuItemEl.attr("id");
                if (!id) {
                    menuItemEl.attr("id", id = S.guid("ks-menuitem"));
                }
                el.attr("aria-activedescendant", id);
            } else {
                el.attr("aria-activedescendant", " ");
            }
        },

        _uiSetDisabled:function(v) {
            if (this.get("focusable"))
                this.get("el").attr("tabindex", v ? -1 : 0);
        },

        _uiFocusable:function(v) {
            if (!this.get("disabled")) {
                if (v) {
                    this.get("el").attr("tabindex", 0);
                } else {
                    this.get("el").removeAttr("tabindex");
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
            elCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "menu "
                        + this.get("prefixCls") + "menu-vertical";
                }
            },
            prefixCls:{
                value:"goog-"
            },
            focusable:{}
        }
    });
    return MenuRender;
}, {
    requires:['ua','uibase','component']
});