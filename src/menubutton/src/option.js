/**
 * @fileOverview represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function (S, Menu) {
    var MenuItem = Menu.Item;
    /**
     * Option for Select component.
     * @name Option
     * @class
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
                 * Default : true.
                 * @type Boolean
                 */
                selectable:{
                    value:true
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