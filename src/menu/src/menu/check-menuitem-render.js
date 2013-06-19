/**
 * checkable menu item render
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem-render', function (S, MenuItemRender, ContentRenderExtension) {

    return MenuItemRender.extend([ContentRenderExtension], {

        beforeCreateDom: function (renderData) {
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses("checked"));
            }
        },

        _onSetChecked: function (v) {
            var self = this,
                el = self.el,
                cls = self.getBaseCssClasses("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        }

    }, {
        ATTRS: {
            contentTpl: {
                value: '<div class="{{getBaseCssClasses "checkbox"}}"></div>' +
                    ContentRenderExtension.ContentTpl
            }
        }
    })
}, {
    requires: ['./menuitem-render', 'component/extension/content-render']
});