/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var SubMenuTpl = require('./submenu-xtpl');
    var MenuItemRender = require('./menuitem-render');
    var ContentRenderExtension = require('component/extension/content-render');

    return MenuItemRender.extend([ContentRenderExtension], {
        decorateDom: function (el) {
            var control = this.control,
                prefixCls = control.get('prefixCls');
            var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
            var docBody = popupMenuEl[0].ownerDocument.body;
            docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
            var PopupMenuClass =
                this.getComponentConstructorByNode(prefixCls, popupMenuEl);
            control.setInternal('menu', new PopupMenuClass({
                srcNode: popupMenuEl,
                prefixCls: prefixCls
            }));
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: SubMenuTpl
            }
        }
    });
});