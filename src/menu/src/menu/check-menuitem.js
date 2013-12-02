/**
 * checkable menu item
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var MenuItem = require('./menuitem');
    var CheckMenuItemRender = require('./check-menuitem-render');

    /**
     * @class KISSY.Menu.CheckItem
     */
    return MenuItem.extend({
        handleClickInternal: function () {
            var self = this;
            self.callSuper();
            self.set('checked', !self.get('checked'));
            self.fire('click');
            return true;
        }
    }, {
        ATTRS: {
            /**
             * Whether the menu item is checked.
             * @cfg {Boolean} checked
             */
            /**
             * @ignore
             */
            checked: {
                view: 1
            },
            xrender: {
                value: CheckMenuItemRender
            }
        },
        xclass: 'check-menuitem'
    });
});