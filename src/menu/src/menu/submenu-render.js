/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu-render", function (S, MenuItemRender, ContentRenderExtension) {

    return MenuItemRender.extend([ContentRenderExtension], {
        decorateDom: function (el) {
            var controller = this.controller,
                prefixCls = controller.prefixCls;
            var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
            var docBody = popupMenuEl[0].ownerDocument.body;
            docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
            var PopupMenuClass =
                this.getComponentConstructorByNode(prefixCls, popupMenuEl);
            controller.setInternal('menu', new PopupMenuClass({
                srcNode: popupMenuEl,
                prefixCls: prefixCls
            }));
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: ContentRenderExtension.ContentTpl +
                    '<span class="{{prefixCls}}submenu-arrow">►</span>'
            }
        }
    });

}, {
    requires: ['./menuitem-render', 'component/extension/content-render']
});