/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu-render", function (S, MenuItemRender, Extension) {

    return MenuItemRender.extend([Extension.ContentRender], {
    }, {
        ATTRS: {
            contentTpl: {
                value: Extension.ContentRender.ContentTpl +
                    '<span class="{{prefixCls}}submenu-arrow">►</span>'
            }
        }
    });

}, {
    requires: ['./menuitem-render', 'component/extension']
});