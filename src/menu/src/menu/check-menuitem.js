/**
 * checkable menu item
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem', function (S, MenuItem, CheckMenuItemRender) {
    return MenuItem.extend({

        performActionInternal: function () {
            var self = this;
            self.set("checked", !self.get("checked"));
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
        xclass: "check-menuitem"
    })
}, {
    requires: ['./menuitem', './check-menuitem-render']
});