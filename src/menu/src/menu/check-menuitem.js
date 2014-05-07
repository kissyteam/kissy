/**
 * checkable menu item
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var MenuItem = require('./menuitem');
    var ContentBox = require('component/extension/content-box');
    var CheckMenuItemTpl = require('./check-menuitem-xtpl');

    /**
     * @class KISSY.Menu.CheckItem
     */
    return MenuItem.extend([ContentBox], {
        beforeCreateDom: function (renderData) {
            if (renderData.checked) {
                renderData.elCls.push(this.getBaseCssClasses('checked'));
            }
        },
        _onSetChecked: function (v) {
            var self = this,
                cls = self.getBaseCssClasses('checked');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },
        handleClickInternal: function (e) {
            var self = this;
            self.callSuper(e);
            self.set('checked', !self.get('checked'));
            self.fire('click');
            return true;
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: CheckMenuItemTpl
            },

            /**
             * Whether the menu item is checked.
             * @cfg {Boolean} checked
             */
            /**
             * @ignore
             */
            checked: {
                render: 1,
                sync: 0
            }
        },
        xclass: 'check-menuitem'
    });
});