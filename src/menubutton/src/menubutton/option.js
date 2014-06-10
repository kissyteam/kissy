/**
 * represent a menu option , just make it selectable and can have select status
 * @ignore
 * @author yiminghe@gmail.com
 */
var Menu = require('menu');
/**
 * Option for Select component.
 * xclass: 'option'.
 * @class KISSY.MenuButton.Option
 * @extends KISSY.Menu.Item
 */
module.exports = Menu.RadioItem.extend({}, {
    ATTRS: {
        /**
         * String will be used as select 's content if selected.
         * @type {String}
         */
        textContent: {
        }
    },
    xclass: 'option'
});