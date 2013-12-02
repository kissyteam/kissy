/**
 * checkable menu item render
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var MenuItemRender = require('./menuitem-render');
    var ContentRenderExtension = require('component/extension/content-render');
    var CheckMenuItemTpl = require('./check-menuitem-xtpl');

    return MenuItemRender.extend([ContentRenderExtension], {
        beforeCreateDom: function (renderData) {
            if (renderData.checked) {
                renderData.elCls.push(this.getBaseCssClasses('checked'));
            }
        },

        _onSetChecked: function (v) {
            var self = this,
                cls = self.getBaseCssClasses('checked');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: CheckMenuItemTpl
            }
        }
    });
});