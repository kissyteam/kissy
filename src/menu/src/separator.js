/**
 * @fileOverview menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function (S, Component, SeparatorRender) {

    /**
     * @extends Component.Controller
     * @class
     * Menu separator.
     * xclass: 'menuseparator'.
     * @memberOf Menu
     * @name Separator
     */
    var Separator = Component.Controller.extend({
    }, {
        ATTRS:/**
         * @lends Menu.Separator#
         */
        {

            /**
             * Un-focusable.
             * readonly.
             * @default false.
             */
            focusable:{
                value:false
            },

            disabled:{
                value:true
            },

            handleMouseEvents:{
                value:false
            },

            xrender:{
                value:SeparatorRender
            }
        }
    }, {
        xclass:'menuseparator',
        priority:20
    });

    return Separator;

}, {
    requires:['component', './separatorRender']
});