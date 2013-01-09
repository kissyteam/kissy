/**
 *  render aria and drop arrow for menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/baseRender", function (S, Button) {

    var CAPTION_TMPL = '<div class="{prefixCls}menu-button-caption"><' + '/div>',

        DROP_TMPL =
            // 背景
            '<div class="{prefixCls}menu-button-dropdown">' +
                // 箭头
                '<div class=' +
                '"{prefixCls}menu-button-dropdown-inner">' +
                '<' + '/div>' +
                '<' + '/div>',
        COLLAPSE_CLS = "menu-button-open";

    return Button.Render.extend({

        createDom: function () {
            var self = this,
                el = self.get("el");
            el.append(S.substitute(DROP_TMPL, {
                prefixCls: this.get('prefixCls')
            }))
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _onSetCollapsed: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithPrefix(COLLAPSE_CLS);
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        _onSetActiveItem: function (v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS: {
            contentEl: {
                valueFn: function () {
                    return S.all(S.substitute(CAPTION_TMPL, {
                        prefixCls: this.get('prefixCls')
                    }));
                }
            },
            activeItem: {
            },
            collapsed: {
                value: true
            }
        },
        HTML_PARSER: {
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') + "menu-button-caption");
            }
        }
    });
}, {
    requires: ['button']
});