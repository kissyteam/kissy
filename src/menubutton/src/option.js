/**
 * represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function (S, Menu) {
    var MenuItem = Menu.Item;
    /**
     * Option for Select component.
     * xclass: 'option'.
     * @class KISSY.MenuButton.Option
     * @extends KISSY.Menu.Item
     */
    return MenuItem.extend({}, {
        ATTRS:
        {
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
        }
    }, {
        xclass: 'option',
        priority: 10
    });
}, {
    requires: ['menu']
});