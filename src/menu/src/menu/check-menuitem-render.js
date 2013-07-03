/**
 * checkable menu item render
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem-render', function (S, MenuItemRender, ContentRenderExtension, CheckMenuItemTpl) {

    return MenuItemRender.extend([ContentRenderExtension], {

        beforeCreateDom: function (renderData) {
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses("checked"));
            }
        },

        _onSetChecked: function (v) {
            var self = this,
                cls = self.getBaseCssClasses("checked");
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        }

    }, {
        ATTRS: {
            contentTpl: {
                value: CheckMenuItemTpl
            }
        }
    })
}, {
    requires: [
        './menuitem-render',
        'component/extension/content-render',
        './check-menuitem-tpl'
    ]
});