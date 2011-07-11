/**
 * render aria and drop arrow for menubutton
 * @author: yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block {prefixCls}menu-button-caption"></div>' +
        '<div class="{prefixCls}inline-block {prefixCls}menu-button-dropdown">&nbsp;</div>';

    return UIBase.create(Button.Render, {
        renderUI:function() {
        },

        createDom:function() {
            var el = this.get("el");
            el.one("div").one("div").html(S.substitute(MENU_BUTTON_TMPL, {
                prefixCls:this.get("prefixCls")
            }));
            //带有 menu
            el.attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            if (v == undefined) return;
            this.get("el").one("." + this.get("prefixCls") + "menu-button-caption").html(v);
        },

        _uiSetCollapsed:function(v) {
            var el = this.get("el"),prefixCls = this.get("prefixCls") + "menu-button";
            if (!v) {
                el.addClass(prefixCls + "menu-button-open");
                el.attr("aria-expanded", true);
            } else {
                el.removeClass(prefixCls + "menu-button-open");
                el.attr("aria-expanded", false);
            }
        },

        _uiSetActiveItem:function(v) {
            //S.log("button set aria " + (v && v.get("view").get("el").attr("id")) || "");
            this.get("el").attr("aria-activedescendant", (v && v.get("view").get("el").attr("id")) || "");
        }
    }, {
        ATTRS:{
            activeItem:{
            },
            collapsed:{
                value:true
            }
        }
    });
}, {
    requires:['uibase','button']
});