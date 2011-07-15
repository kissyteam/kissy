/**
 * render aria and drop arrow for menubutton
 * @author: yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-caption"></div>' +
        '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-dropdown">&nbsp;</div>',
        CAPTION_CLS = "{prefixCls}menu-button-caption",
        COLLAPSE_CLS = "{prefixCls}menu-button-open";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }


    return UIBase.create(Button.Render, {
        renderUI:function() {
        },

        createDom:function() {
            var el = this.get("el");
            el.one("div").one("div").html(getCls(this, MENU_BUTTON_TMPL));
            //带有 menu
            el.attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            if (v == undefined) return;
            this.get("el").one("." + getCls(this, CAPTION_CLS)).html(v);
        },

        _uiSetCollapsed:function(v) {
            var el = this.get("el"),cls = getCls(this, COLLAPSE_CLS);
            if (!v) {
                el.addClass(cls);
                el.attr("aria-expanded", true);
            } else {
                el.removeClass(cls);
                el.attr("aria-expanded", false);
            }
        },

        _uiSetActiveItem:function(v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("view").get("el").attr("id")) || "");
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