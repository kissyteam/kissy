/**
 * @fileOverview toolbar separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("toolbar/separator", function (S, Component, Separator) {

    /**
     * @extends Separator
     * @class
     * toolbar separator.
     * xclass: 'toolbar-separator'.
     * @memberOf Toolbar
     * @name Separator
     */
    var ToolbarSeparator = Separator.extend({
    }, {}, {
        xclass:'toolbar-separator',
        priority:20
    });

    return ToolbarSeparator;

}, {
    requires:['component', 'separator']
});