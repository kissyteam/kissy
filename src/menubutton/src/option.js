/**
 *  represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function (S, Menu) {
    var MenuItem = Menu.Item;
    /**
     * @name Option
     * @class
     * Option for Select component.
     * xclass: 'option'.
     * @memberOf MenuButton
     * @extends Menu.Item
     */
    var Option = MenuItem.extend(
        /**
         * @lends MenuButton.Option.prototype
         */
        {
            /**
             * Handle blur event.
             */
            handleBlur:function () {
                return Option.superclass.handleBlur.apply(this, arguments);
            }
        }, {
            ATTRS:/**
             * @lends MenuButton.Option.prototype
             */
            {
                /**
                 * Whether this option can be selected.
                 * Defaults to: true.
                 * @type {Boolean}
                 */
                selectable:{
                    value:true
                },

                /**
                 * String will be used as select 's content if selected.
                 * @type {String}
                 */
                textContent:{

                }
            }
        }, {
            xclass:'option',
            priority:10
        });

    return Option;
}, {
    requires:['menu']
});