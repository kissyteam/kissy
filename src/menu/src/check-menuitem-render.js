/**
 * checkable menu item render
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem-render', function (S, MenuItemRender, Extension) {

    return MenuItemRender.extend([Extension.ContentRender], {

        initializer: function () {
            if (this.get('checked')) {
                this.get('elCls').push(self.getBaseCssClasses("checked"));
            }
        },

        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getBaseCssClasses("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        }

    }, {
        ATTRS: {
            contentTpl: {
                value: '<div class="{{getBaseCssClasses "checkbox"}}"></div>' +
                    Extension.ContentRender.ContentTpl
            },
            checked: {
                sync: 0
            }
        }
    })
}, {
    requires: ['./menuitem-render', 'component/extension']
});