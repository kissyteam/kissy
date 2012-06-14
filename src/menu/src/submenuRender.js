/**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenuRender", function (S, MenuItemRender) {
    var SubMenuRender,
        CONTENT_TMPL = '<span class="ks-submenu-content"><' + '/span>',
        ARROW_TMPL = '<span class="ks-submenu-arrow">►<' + '/span>';

    SubMenuRender = MenuItemRender.extend({
        createDom:function () {
            var self = this,
                el = self.get("el");
            el.attr("aria-haspopup", "true")
                .append(ARROW_TMPL);
        }
    }, {
        ATTRS:{
            arrowEl:{},
            contentElCls:{
                value:"ks-submenu-content"
            },
            contentEl:{
                valueFn:function () {
                    return S.all(CONTENT_TMPL);
                }
            }
        }
    });

    return SubMenuRender;
}, {
    requires:['./menuitemRender']
});