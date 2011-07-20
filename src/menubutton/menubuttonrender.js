/**
 * render aria and drop arrow for menubutton
 * @author: yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-caption">{content}</div>' +
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

        createDom:function() {
            var el = this.get("contentEl"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:this.get("content") || "",
                    prefixCls:this.get("prefixCls")
                });
            el.one("div")
                .html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            var caption = this.get("el").one("." + getCls(this, CAPTION_CLS));
            caption.html("");
            caption.append(v);
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