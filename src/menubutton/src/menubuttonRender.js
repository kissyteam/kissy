/**
 * @fileOverview render aria and drop arrow for menubutton
 * @author  yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonRender", function (S, Button) {

    var MENU_BUTTON_TMPL = '<div class="ks-inline-block ' +
            'ks-menu-button-caption">{content}<' + '/div>' +
            '<div class="ks-inline-block ' +
            'ks-menu-button-dropdown">' +
            '<div class=' +
            '"ks-menu-button-dropdown-inner">' +
            '<' + '/div>' +
            '<' + '/div>',
        CAPTION_CLS = "ks-menu-button-caption",
        COLLAPSE_CLS = "menu-button-open";

    return Button.Render.extend({

        createDom:function () {
            var self = this,
                el = self.get("el"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:self.get("html")
                });
            el.html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetHtml:function (v) {
            var caption = this.get("el").one("." + CAPTION_CLS);
            caption.html("");
            v && caption.append(v);
        },

        _uiSetCollapsed:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithPrefix(COLLAPSE_CLS);
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        _uiSetActiveItem:function (v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS:{
            activeItem:{
            },
            collapsed:{
            }
        }
    });
}, {
    requires:['button']
});