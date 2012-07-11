/**
 * @fileOverview menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function (S, Component, Separator) {

    /**
     * @extends Separator
     * @class
     * Menu separator.
     * xclass: 'menuseparator'.
     * @memberOf Menu
     * @name Separator
     */
    var MenuSeparator = Separator.extend({
    }, {}, {
        xclass:'menuseparator',
        priority:20
    });

    return MenuSeparator;

}, {
    requires:['component', 'separator']
});