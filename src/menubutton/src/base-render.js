/**
 * render aria and drop arrow for menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/base-render", function (S, Button, MenuButtonTpl) {

    return Button.Render.extend({
        initializer: function () {
            S.mix(this.get('elAttrs'), {
                'aria-expanded': false,
                'aria-haspopup': true
            });
            this.get('childrenElSelectors')['contentEl'] =
                '#ks-menu-button-caption{id}';
        },

        _onSetContent: function (v) {
            this.get('contentEl').html(v).unselectable();
        },

        _onSetCollapsed: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithPrefix("menu-button-open");
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        setAriaActiveDescendant: function (v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: MenuButtonTpl
            },
            collapsed: {
                value: true,
                sync: 0
            }
        },
        HTML_PARSER: {
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') + "menu-button-caption");
            }
        }
    });
}, {
    requires: ['button', './menubutton-tpl']
});