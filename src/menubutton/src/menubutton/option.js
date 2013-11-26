/**
 * represent a menu option , just make it selectable and can have select status
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Menu = require('menu');
    var MenuItem = Menu.Item;
    /**
     * Option for Select component.
     * xclass: 'option'.
     * @class KISSY.MenuButton.Option
     * @extends KISSY.Menu.Item
     */
    return MenuItem.extend({}, {
        ATTRS: {
            /**
             * Whether this option can be selected.
             * Defaults to: true.
             * @type {Boolean}
             */
            selectable: {
                value: true
            },

            /**
             * String will be used as select 's content if selected.
             * @type {String}
             */
            textContent: {
            }
        },
        xclass: 'option'
    });
});