/**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenuRender", function (S, MenuItemRender) {
    var SubMenuRender,
        ARROW_TMPL = '<span class="ks-submenu-arrow">►<' + '/span>';

    SubMenuRender = MenuItemRender.extend({
        renderUI:function () {
            var self = this,
                el = self.get("el");
            el.attr("aria-haspopup", "true").append(ARROW_TMPL);
        },
        _uiSetContent:function (v) {
            var self = this;
            SubMenuRender.superclass._uiSetContent.call(self, v);
            self.get("el").append(ARROW_TMPL);
        }
    });

    return SubMenuRender;
}, {
    requires:['./menuitemRender']
});