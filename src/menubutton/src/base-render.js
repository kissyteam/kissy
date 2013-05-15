/**
 * render aria and drop arrow for menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/base-render", function (S, Button, Extension) {

    return Button.Render.extend([Extension.ContentRender], {
        initializer: function () {
            S.mix(this.get('elAttrs'), {
                'aria-expanded': false,
                'aria-haspopup': true
            });
        },

        _onSetCollapsed: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithPrefix("menu-button-open");
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        setAriaActiveDescendant: function (v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el")[0].id) || "");
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: Extension.ContentRender.ContentTpl +
                    '<div class="{{prefixCls}}menu-button-dropdown">' +
                    '<div class="{{prefixCls}}menu-button-dropdown-inner">' +
                    '</div>'
            },
            collapsed: {
                value: true,
                sync: 0
            }
        }
    });
}, {
    requires: ['button','component/extension']
});